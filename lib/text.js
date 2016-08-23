"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var color,
    _Text,
    _ = require("lodash");

// ********************

color = _.extend(function (text, color) {
  return color + text + "\x1b[0m";
}, {
  normal: "\x1b[0m",
  black: "\x1b[30m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
});

// ********************

_Text = function Text(text) {
  if ((typeof text === "undefined" ? "undefined" : _typeof(text)) === undefined) {
    throw new Error("you must supply a toString-able parameter");
  }
  if (text instanceof _Text) {
    return text;
  }
  this.text = text.toString();
};

_Text.prototype.toString = _Text.prototype.inspect = function () {
  return this._color ? color(this.text, this._color) : this.text;
};

_Text.prototype.rightJustify = function (width) {
  if (!width || width < 0) {
    throw new Error("you must supply a width");
  }
  this.text = (new Array(width).join(" ") + this.text).slice(-width);
  return this;
};

_Text.prototype.leftJustify = function (width) {
  if (!width || width < 0) {
    throw new Error("you must supply a width");
  }
  this.text = (this.text + Array(width).join(" ")).slice(0, width);
  return this;
};

_Text.prototype.center = function (width) {
  var extra, left, right;
  if (!width || width < 0) {
    throw new Error("you must supply a width");
  }

  extra = width - this.text.length;
  if (extra < 1) {
    return this;
  }

  left = right = extra / 2 | 0;
  if (extra % 2) {
    right++;
  }

  this.text = Array(left + 1).join(" ") + this.text + Array(right + 1).join(" ");
  return this;
};

_Text.prototype.pad = function (num, chr) {
  var padding;

  if (!num || num < 0) {
    throw new Error("you must supply the number of characters to pad by");
  }

  chr = chr || " ";
  padding = Array(num + 1).join(chr);
  this.text = padding + this.text + padding;

  return this;
};

_Text.prototype.color = function (color) {
  this._color = color;
  return this;
};

_Text.prototype.black = _.partial(_Text.prototype.color, color.black);
_Text.prototype.bright = _.partial(_Text.prototype.color, color.bright);
_Text.prototype.red = _.partial(_Text.prototype.color, color.red);
_Text.prototype.green = _.partial(_Text.prototype.color, color.green);
_Text.prototype.yellow = _.partial(_Text.prototype.color, color.yellow);
_Text.prototype.blue = _.partial(_Text.prototype.color, color.blue);
_Text.prototype.magenta = _.partial(_Text.prototype.color, color.magenta);
_Text.prototype.cyan = _.partial(_Text.prototype.color, color.cyan);

module.exports = function (text) {
  return new _Text(text);
};