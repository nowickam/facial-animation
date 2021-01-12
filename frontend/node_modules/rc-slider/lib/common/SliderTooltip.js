"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _rcTooltip = _interopRequireDefault(require("rc-tooltip"));

var _ref = require("rc-util/lib/ref");

var _raf = _interopRequireDefault(require("rc-util/lib/raf"));

var SliderTooltip = React.forwardRef(function (props, ref) {
  var visible = props.visible,
      overlay = props.overlay;
  var innerRef = React.useRef(null);
  var tooltipRef = (0, _ref.composeRef)(ref, innerRef);
  var rafRef = React.useRef(null);

  function cancelKeepAlign() {
    _raf.default.cancel(rafRef.current);
  }

  function keepAlign() {
    rafRef.current = (0, _raf.default)(function () {
      var _innerRef$current;

      (_innerRef$current = innerRef.current) === null || _innerRef$current === void 0 ? void 0 : _innerRef$current.forcePopupAlign();
    });
  }

  React.useEffect(function () {
    if (visible) {
      keepAlign();
    } else {
      cancelKeepAlign();
    }

    return cancelKeepAlign;
  }, [visible, overlay]);
  return React.createElement(_rcTooltip.default, Object.assign({
    ref: tooltipRef
  }, props));
});
var _default = SliderTooltip;
exports.default = _default;