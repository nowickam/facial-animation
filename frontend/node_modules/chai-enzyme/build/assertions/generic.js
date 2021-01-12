'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = generic;
function generic(assertion, desc) {
  return function (args) {
    var wrapper = args.wrapper,
        markup = args.markup,
        flag = args.flag,
        inspect = args.inspect,
        arg1 = args.arg1,
        arg2 = args.arg2,
        sig = args.sig;

    var actual = wrapper[assertion](arg1);

    if (!flag(this, 'negate') || Object.keys(args).indexOf('arg2') === -1) {
      this.assert(undefined !== actual, function () {
        return 'expected ' + sig + ' to have a #{exp} ' + desc + markup();
      }, function () {
        return 'expected ' + sig + ' not to have a #{exp} ' + desc + markup();
      }, arg1);
    }

    if (Object.keys(args).indexOf('arg2') !== -1) {
      this.assert(arg2 === actual, function () {
        return 'expected ' + sig + ' to have a ' + inspect(arg1) + ' ' + desc + ' with the value #{exp}, but the value was #{act}' + markup();
      }, function () {
        return 'expected ' + sig + ' not to have a ' + inspect(arg1) + ' ' + desc + ' with the value #{act}' + markup();
      }, arg2, actual);
    }

    flag(this, 'object', actual);
  };
}