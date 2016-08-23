"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (filepath) {
  var harRaw = _fs2.default.readFileSync(filepath);
  var har = JSON.parse(harRaw);

  return har.log.entries.map(function (entry) {
    var entryUrl = _url2.default.parse(entry.request.url);

    return {
      method: entry.request.method,
      hostname: entryUrl.hostname,
      pathname: entryUrl.pathname,
      href: entryUrl.href,
      statusCode: entry.response.status,
      responseBody: entry.response.content.text,
      responseHeaders: entry.response.headers.reduce(function (obj, header) {
        obj[header.name] = header.value;
        return obj;
      }, {}),
      hadError: false
    };
  });
};

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _url = require("url");

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }