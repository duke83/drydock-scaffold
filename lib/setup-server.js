"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = setupServer;

var _zlib = require("zlib");

var _zlib2 = _interopRequireDefault(_zlib);

var _hapi = require("hapi");

var _hapi2 = _interopRequireDefault(_hapi);

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _text = require("./text");

var _text2 = _interopRequireDefault(_text);

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var requestP = _bluebird2.default.promisify(_request2.default);
var gunzip = _bluebird2.default.promisify(_zlib2.default.gunzip, { context: _zlib2.default });

var lastTransaction = 0;

function decompress(body, headers) {
  var encoding = headers["content-encoding"];
  return encoding && encoding.indexOf("gzip") === -1 ? _bluebird2.default.resolve(body) : _bluebird2.default.resolve().then(function () {
    return gunzip(body);
  }).catch(function () {
    return body;
  });
}

function setupServer(_ref, onRequest, onResponse, onError) {
  var ip = _ref.ip;
  var port = _ref.port;

  var server = new _hapi2.default.Server(ip, port, {
    cors: true
  });

  server.route({
    method: "*",
    path: "/{path*}",
    handler: function handler(req, reply) {
      var transactionNo = lastTransaction++;
      var method = req.method;
      var headers = req.headers;
      var payload = req.payload;
      var _req$url = req.url;
      var protocol = _req$url.protocol;
      var hostname = _req$url.hostname;
      var pathname = _req$url.pathname;
      var href = _req$url.href;


      onRequest({ method: method, protocol: protocol, hostname: hostname, pathname: pathname, href: href, headers: headers, payload: payload, transactionNo: transactionNo });

      requestP({
        url: href,
        method: method,
        headers: headers,
        body: payload,
        encoding: null
      }).then(function (_ref2) {
        var statusCode = _ref2.statusCode;
        var body = _ref2.body;
        var responseHeaders = _ref2.headers;

        var r = reply(body).code(statusCode);
        Object.keys(responseHeaders).forEach(function (header) {
          r = r.header(header, responseHeaders[header]);
        });

        return decompress(body, responseHeaders).then(function (decompressedBody) {
          return onResponse({
            statusCode: statusCode,
            method: method,
            href: href,
            transactionNo: transactionNo,
            body: decompressedBody,
            headers: responseHeaders
          });
        });
      }).catch(function (err) {
        onError(transactionNo);
        (0, _util.printRow)(transactionNo, (0, _text2.default)("ERROR").cyan(), err.stack);
        reply("").code(500);
        return;
      });
    }
  });

  return [_bluebird2.default.promisify(server.start.bind(server)), _bluebird2.default.promisify(server.stop.bind(server))];
}