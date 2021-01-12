'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = reactNodeToString;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _enzyme = require('enzyme');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function reactElementToJSXString(node) {
  var Wrapper = function Wrapper() {
    return node;
  };
  return (0, _enzyme.shallow)(_react2.default.createElement(Wrapper, null)).debug();
}

function reactArrayToJSXString(nodes) {
  var jsxString = '[';
  nodes.forEach(function (node, idx) {
    jsxString += '\n  ' + reactElementToJSXString(node);
    if (idx < nodes.length - 1) {
      jsxString += ',';
    }
  });
  return jsxString + '\n]';
}

function reactNodeToString(node) {
  if (Array.isArray(node)) {
    return reactArrayToJSXString(node);
  } else {
    return reactElementToJSXString(node);
  }
}