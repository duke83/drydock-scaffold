"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _minimist = require("minimist");

var _minimist2 = _interopRequireDefault(_minimist);

var _bluebird = require("bluebird");

var _bluebird2 = _interopRequireDefault(_bluebird);

var _setupServer3 = require("./setup-server");

var _setupServer4 = _interopRequireDefault(_setupServer3);

var _writeMocks = require("./write-mocks");

var _writeMocks2 = _interopRequireDefault(_writeMocks);

var _importHar = require("./import-har");

var _importHar2 = _interopRequireDefault(_importHar);

var _text = require("./text");

var _text2 = _interopRequireDefault(_text);

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function trapFirstCtrlC() {
  var firstCtrlC = true;
  return new _bluebird2.default(function (resolve) {
    process.on("SIGINT", function () {
      if (!firstCtrlC) {
        console.log("\nexiting early...\n");
        process.exit();
      }
      firstCtrlC = false;
      resolve();
    });
  });
}

function main(options) {
  var _options$ip = options.ip;
  var ip = _options$ip === undefined ? "0.0.0.0" : _options$ip;
  var _options$port = options.port;
  var port = _options$port === undefined ? 1337 : _options$port;
  var _options$destination = options.destination;
  var destination = _options$destination === undefined ? process.cwd() : _options$destination;


  var getTransactions = void 0;
  if (options._.length && options._[0] === "import") {
    var filepath = _path2.default.resolve(process.cwd(), options._[1]);
    getTransactions = doImport(filepath);
  } else {
    getTransactions = runProxy(options);
  }

  getTransactions.then(function (transactions) {
    console.log("writing mocks to disk...");
    return (0, _writeMocks2.default)(ip, port, destination, transactions);
  }).then(function () {
    console.log("finished!");
    console.log("");
    console.log("If you haven't done so, you'll want to install a couple of node modules:");
    console.log("  npm install --save drydock yargs lodash");
  });
}

function runProxy(options) {
  var _options$ip2 = options.ip;
  var ip = _options$ip2 === undefined ? "0.0.0.0" : _options$ip2;
  var _options$port2 = options.port;
  var port = _options$port2 === undefined ? 1337 : _options$port2;


  var transactions = [];

  function onRequest(_ref) {
    var method = _ref.method;
    var hostname = _ref.hostname;
    var pathname = _ref.pathname;
    var href = _ref.href;
    var transactionNo = _ref.transactionNo;

    (0, _util.printRow)(transactionNo, (0, _text2.default)(method.toUpperCase()).yellow(), href);
    transactions[transactionNo] = { method: method, hostname: hostname, pathname: pathname, href: href };
  }

  function onResponse(_ref2) {
    var statusCode = _ref2.statusCode;
    var method = _ref2.method;
    var href = _ref2.href;
    var transactionNo = _ref2.transactionNo;
    var body = _ref2.body;
    var headers = _ref2.headers;

    var color = statusCode >= 200 && statusCode < 300 ? "green" : "red";
    (0, _util.printRow)(transactionNo, (0, _text2.default)(method.toUpperCase())[color](), href);

    Object.assign(transactions[transactionNo], {
      statusCode: statusCode,
      responseBody: body,
      responseHeaders: headers
    });
  }

  function onError(transactionNo) {
    transactions[transactionNo] = null;
  }

  var _setupServer = (0, _setupServer4.default)({ ip: ip, port: port }, onRequest, onResponse, onError);

  var _setupServer2 = _slicedToArray(_setupServer, 2);

  var start = _setupServer2[0];
  var stop = _setupServer2[1];


  return _bluebird2.default.resolve().then(function () {
    console.log("\nWhen started, the proxy server will forward any HTTP(S) requests along to\n" + "the intended servers.  Responses will be relayed back to the originating\n" + "client, and all transactions will be recorded.\n\n" + "Once you have captured all desired API interactions, press CTRL-C to stop\n" + "the proxy server, and mocks will be written to disk.\n\n---\n");
    console.log("starting proxy server on http://" + ip + ":" + port + "...");
    return start();
  }).then(trapFirstCtrlC).then(function () {
    console.log("\nstopping server...");
    return stop();
  }).then(function () {
    return console.log("server stopped, press CTRL-C immediately to avoid writing to disk...");
  }).delay(3000).then(function () {
    return transactions;
  });
}

function doImport(filepath) {
  return _bluebird2.default.resolve().then(function () {
    console.log("importing HAR file...");
    return (0, _importHar2.default)(filepath);
  });
}

main((0, _minimist2.default)(process.argv.slice(2)));