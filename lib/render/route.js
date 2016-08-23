"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = renderRoute;

var _babelTemplate = require("babel-template");

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

var _babelTypes = require("babel-types");

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jsonRouteTmpl = (0, _babelTemplate2.default)("\n  mock.jsonRoute({\n    name: NAME,\n    method: METHOD,\n    path: PATH,\n    hostname: HOSTNAME,\n    handlers: HANDLERS\n  });\n");

var htmlRouteTmpl = (0, _babelTemplate2.default)("\n  mock.htmlRoute({\n    name: NAME,\n    method: METHOD,\n    path: PATH,\n    hostname: HOSTNAME,\n    handlers: HANDLERS\n  });\n");

function renderRoute(opts) {
  var name = opts.name;
  var method = opts.method;
  var path = opts.path;
  var hostname = opts.hostname;
  var handlers = opts.handlers;
  var contentType = opts.contentType;


  var routeTmpl = contentType.indexOf("application/json") > -1 ? jsonRouteTmpl : htmlRouteTmpl;

  return routeTmpl({
    NAME: t.stringLiteral(name),
    METHOD: t.stringLiteral(method.toUpperCase()),
    PATH: t.stringLiteral(path),
    HOSTNAME: t.stringLiteral(hostname),
    HANDLERS: handlers
  });
}