"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = writeMocks;

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _babelGenerator = require("babel-generator");

var _babelGenerator2 = _interopRequireDefault(_babelGenerator);

var _babelTypes = require("babel-types");

var t = _interopRequireWildcard(_babelTypes);

var _handler = require("./render/handler");

var _handler2 = _interopRequireDefault(_handler);

var _handlers = require("./render/handlers");

var _handlers2 = _interopRequireDefault(_handlers);

var _route = require("./render/route");

var _route2 = _interopRequireDefault(_route);

var _mock = require("./render/mock");

var _mock2 = _interopRequireDefault(_mock);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function renderCode(ast) {
  var _generate = (0, _babelGenerator2.default)(ast, {
    format: {
      indent: {
        style: "  ",
        adjustMultilineComment: true
      }
    },
    sourceMap: false
  });

  var code = _generate.code;


  return code;
}

function getRoutes(transactions) {
  var routes = {};

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = transactions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var transaction = _step.value;

      if (transaction === null) {
        continue;
      }
      var method = transaction.method;
      var hostname = transaction.hostname;
      var pathname = transaction.pathname;
      var href = transaction.href;
      var statusCode = transaction.statusCode;
      var responseBody = transaction.responseBody;
      var responseHeaders = transaction.responseHeaders;
      var hadError = transaction.hadError;
      var requestQueryString = transaction.requestQueryString;
      var requestPostData = transaction.requestPostData;


      var key = method + "-" + hostname + pathname;
      if (!(key in routes)) {
        var contentType = responseHeaders && (responseHeaders["content-type"] || responseHeaders["Content-Type"]) || "";
        routes[key] = {
          method: method,
          hostname: hostname,
          pathname: pathname,
           myNewProp1:'Kent1',
          isJson: contentType.indexOf("application/json") > -1,
          responses: []
        };
      }

      var preexistingResponses = routes[key].responses.length;
      routes[key].responses.push({
        statusCode: statusCode,
        responseBody: responseBody,
        responseHeaders: responseHeaders,
        myNewProp:'Kent',
        uniqueName: preexistingResponses + "-" + key
      });
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return routes;
}

function createFixturesDir(destination) {
  try {
    _fs2.default.mkdirSync(_path2.default.join(destination, "fixtures"));
  } catch (err) {
    if (err.message.indexOf("EEXIST") === -1) {
      throw err;
    }
  }
}

function writeFixture(route, response, destination) {
  var extension = route.isJson ? ".json" : ".html";

  var escapedName = encodeURIComponent(response.uniqueName);
  // This unique name will be used to generate fixture files.  Because of filename length
  // limits, this value should not exceed 255 characters in length.
  escapedName = escapedName.substr(0, 240);

  var pathToFixture = "./fixtures/" + escapedName + extension;

  var body = route.isJson ? JSON.stringify(JSON.parse(response.responseBody), null, 2) : response.responseBody;

  _fs2.default.writeFileSync(_path2.default.join(destination, pathToFixture), body);
  return pathToFixture;
}

function writeMocks(ip, port, destination, transactions) {

  var transactionsFiltred = transactions.filter(function(trans){
    return trans.method==='POST' && trans.pathname==='/typeAheadService'
  })
  var routes = getRoutes(transactionsFiltred);

  createFixturesDir(destination);

  var routesNodes = Object.keys(routes).map(function (routeKey) {
    var route = routes[routeKey];

    var handlersNode = (0, _handlers2.default)(route.responses.map(function (response) {
      var pathToFixture = writeFixture(route, response, destination);
      return {
        ast: (0, _handler2.default)(response.uniqueName, pathToFixture, route.isJson, response.statusCode,'other- my dog has flees'),
        name: response.uniqueName + 'xxx'
      };
    }));

    return (0, _route2.default)({
      name: routeKey,
      method: route.method,
      path: route.pathname,
      hostname: route.hostname,
      handlers: handlersNode,
       myNewProp2:'Kent2',
      contentType: route.responses[0].responseHeaders["content-type"] || route.responses[0].responseHeaders["Content-Type"] || "text/text"
    });
  });

  var mockAst = (0, _mock2.default)(ip, port, routesNodes);
  var mockJs = renderCode(t.program([].concat(mockAst)));

  _fs2.default.writeFileSync(_path2.default.join(destination, "mock.js"), mockJs);
}