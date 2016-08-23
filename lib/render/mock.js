"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = renderMock;

var _babelTemplate = require("babel-template");

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

var _babelTypes = require("babel-types");

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tmpl = (0, _babelTemplate2.default)("\n  var fs = require(\"fs\");\n  var path = require(\"path\");\n\n  var Drydock = require(\"drydock\");\n\n  var createMock = function (options) {\n    options = options ? options : {};\n\n    var mock = new Drydock({\n      port: options.port || PORT,\n      ip: options.ip || IP,\n      verbose: !!options.verbose,\n      initialState: {},\n      cors: true\n    });\n\n    ROUTES;\n\n    return mock;\n  };\n\n  if (require.main === module) {\n    createMock(require(\"yargs\").argv).start();\n  } else {\n    module.exports = createMock;\n  }\n");

function renderMock(ip, port, routesNodes) {
  return tmpl({
    IP: t.stringLiteral(ip),
    PORT: t.numericLiteral(port),
    ROUTES: routesNodes
  });
}