"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = renderHandler;

var _babelTemplate = require("babel-template");

var _babelTemplate2 = _interopRequireDefault(_babelTemplate);

var _babelTypes = require("babel-types");

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var requireJsonTmpl = (0, _babelTemplate2.default)("require(PATH_TO_FILE)");
var requireHtmlTmpl = (0, _babelTemplate2.default)("fs.readFileSync(path.join(__dirname, PATH_TO_FILE), \"utf8\")");

var successTmpl = (0, _babelTemplate2.default)("({\n  description: NAME,\n  handler: function (request) {\n    return FIXTURE_EXPRESSION;\n  }\n})");

var errorTmpl = (0, _babelTemplate2.default)("({\n  description: NAME,\n  handler: function (request) {\n    throw new Drydock.Errors.HttpError({\n      payload: FIXTURE_EXPRESSION,\n      type: RESPONSE_TYPE,\n      code: STATUS_CODE\n    });\n  }\n})");

function renderHandler(name, pathToFixture, isJson, statusCode) {
  var PATH_TO_FILE = t.stringLiteral(pathToFixture);
  var FIXTURE_EXPRESSION = isJson ? requireJsonTmpl({ PATH_TO_FILE: PATH_TO_FILE }) : requireHtmlTmpl({ PATH_TO_FILE: PATH_TO_FILE });

  return (statusCode === 200 ? successTmpl({ NAME: t.stringLiteral(name), FIXTURE_EXPRESSION: FIXTURE_EXPRESSION }) : errorTmpl({
    NAME: t.stringLiteral(name),
    FIXTURE_EXPRESSION: FIXTURE_EXPRESSION,
    RESPONSE_TYPE: t.stringLiteral(isJson ? "application/json" : "text/html"),
    STATUS_CODE: t.numericLiteral(statusCode)
  })).expression;
}