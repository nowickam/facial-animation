'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ref;
function ref(_ref) {
  var wrapper = _ref.wrapper,
      markup = _ref.markup,
      flag = _ref.flag,
      arg1 = _ref.arg1,
      sig = _ref.sig;

  var actual = wrapper.props();

  if (Array.isArray(arg1)) {
    this.assert(arg1.every(Object.prototype.hasOwnProperty.bind(actual)), function () {
      return 'expected ' + sig + ' to have props #{exp} but props were #{act} ' + markup();
    }, function () {
      return 'expected ' + sig + ' not to have props #{exp} but props were #{act} ' + markup();
    }, arg1, Object.keys(actual));
    flag(this, 'object', arg1.map(function (key) {
      return actual[key];
    }));
  } else {
    var actualProps = Object.keys(arg1).reduce(function (props, key) {
      props[key] = actual[key];
      return props;
    }, {});
    this.assert(Object.keys(arg1).every(function (key) {
      return actualProps[key] === arg1[key];
    }), function () {
      return 'expected ' + sig + ' to have props #{exp} but props were #{act} ' + markup();
    }, function () {
      return 'expected ' + sig + ' not to have props #{exp} but props were #{act} ' + markup();
    }, arg1, actualProps);
    flag(this, 'object', actualProps);
  }
}