'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Type = require('./type.js');

var Value = function () {
   function Value() {
      (0, _classCallCheck3.default)(this, Value);
   }

   (0, _createClass3.default)(Value, [{
      key: 'equals',
      value: function equals() {
         throw new Error('Unimplemented');
      }
   }, {
      key: 'clone',
      value: function clone() {
         throw new Error('Unimplemented');
      }
   }, {
      key: 'update',
      value: function update(other) {
         throw new Error('Unimplemented');
      }

      /*
      * Determines if an object implements, what appears to be, a Value
      *
      * @params {Value} other
      * @returns true if appears to be a Value, otherwise false
      */

   }, {
      key: 'type',
      get: function get() {
         throw new Error('Not Implemented');
      }
   }], [{
      key: 'isValue',
      value: function isValue(other) {
         return (typeof other === 'undefined' ? 'undefined' : (0, _typeof3.default)(other)) === 'object' && "equals" in other && "type" in other && "clone" in other && "update" in other && Type.isType(other.type);
      }
   }]);
   return Value;
}();

module.exports = Value;