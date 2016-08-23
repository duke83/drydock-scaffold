"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.printRow = printRow;

var _text = require("./text");

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function printRow(a, b, c) {
  console.log("" + (0, _text2.default)(a).rightJustify(5) + (0, _text2.default)(b).rightJustify(7) + " " + c);
}