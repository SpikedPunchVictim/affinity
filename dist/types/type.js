'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Type = function () {
   function Type(name, createDefault) {
      (0, _classCallCheck3.default)(this, Type);

      this._name = name;

      // Allows for the developer to create a default value from the Type
      this._createDefault = createDefault;
   }

   (0, _createClass3.default)(Type, [{
      key: 'default',
      value: function _default() {
         if (this._createDefault == null) {
            throw new Error('No default specified for type ' + this.name);
         }
         return this._createDefault();
      }
   }, {
      key: 'equals',
      value: function equals(other) {
         return this._name === other.name;
      }

      /*
       * Determines if an object implements, what appears to be, a Type
       *
       * @params {Value} other
       * @returns true if appears to be a Type, otherwise false
       */

   }, {
      key: 'toString',
      value: function toString() {
         return this.name;
      }
   }, {
      key: 'name',
      get: function get() {
         return this._name;
      }
   }], [{
      key: 'isType',
      value: function isType(other) {
         return (typeof other === 'undefined' ? 'undefined' : (0, _typeof3.default)(other)) === 'object' && "name" in other && "equals" in other;
      }
   }]);
   return Type;
}();

module.exports = Type;