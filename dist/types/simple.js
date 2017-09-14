'use strict';

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require('lodash'),
    when = require('when'),
    Emitter = require('../eventEmitter.js'),
    Commands = require('../commands.js'),
    Type = require('./type.js'),
    Value = require('./value.js'),
    RequestForChange = require('../requestForChange.js'),
    Events = require('../events.js');

function isPrimitiveNaN(val) {
   // Check for NaN:
   // https://tc39.github.io/ecma262/#sec-isnan-number
   return val !== val;
}

//---------------------------------------------------------------------------------------
// The base value info
//
// Note:
//  Requests for change occur at the member/instance level. These are just
//  classes that store type/value info.
//---------------------------------------------------------------------------------------

var SimpleValue = function () {
   function SimpleValue(type) {
      (0, _classCallCheck3.default)(this, SimpleValue);

      Emitter.mixin(this);
      this._type = type;
      this._value = null;
   }

   (0, _createClass3.default)(SimpleValue, [{
      key: 'equals',
      value: function equals(other) {
         if (other instanceof SimpleValue) {
            return this.type.equals(other.type) && this.value === other.value;
         } else {
            return this.value === other;
         }
      }
   }, {
      key: 'isValidValue',
      value: function isValidValue(value) {
         throw new Error('Not implemented error');
      }
   }, {
      key: 'clone',
      value: function clone() {
         throw new Error('Not implemented error');
      }
   }, {
      key: 'isValidValue',
      value: function isValidValue(value) {
         try {
            this._extract(value);
            return true;
         } catch (err) {
            return false;
         }
      }
   }, {
      key: 'update',
      value: function update(other) {
         var val = this._extract(Value.isValue(other) ? other.value : other);

         if (val === this._value) {
            return when.resolve();
         }

         if (!this.isValidValue(val)) {
            return when.reject('Not a valid value for this type');
         }

         var changed = {
            from: this._value,
            to: val
         };

         var self = this;
         return RequestForChange.new(changed).notify(function (req) {
            return self.emit(Events.requestForChange, req);
         }).fulfill(function (req) {
            self.emit(Events.valueChanging, changed);
            self._value = val;
            self.emit(Events.valueChanged, changed);
         }).queue();
      }
   }, {
      key: '_extract',
      value: function _extract(val) {
         throw new Error('Not implemented error');
      }
   }, {
      key: 'applyChangeSet',
      value: function applyChangeSet(change) {
         return this.update(change.to);
      }
   }, {
      key: 'type',
      get: function get() {
         return this._type;
      }
   }, {
      key: 'value',
      get: function get() {
         return this._value;
      }
   }]);
   return SimpleValue;
}();

//---------------------------------------------------------------------------------------
//-- Bool
//---------------------------------------------------------------------------------------


var BoolType = new Type('bool', function (_) {
   return new BoolValue();
});

var BoolValue = function (_SimpleValue) {
   (0, _inherits3.default)(BoolValue, _SimpleValue);

   function BoolValue(options) {
      (0, _classCallCheck3.default)(this, BoolValue);

      var _this = (0, _possibleConstructorReturn3.default)(this, (BoolValue.__proto__ || Object.getPrototypeOf(BoolValue)).call(this, BoolType));

      if (_.isObject(options)) {
         _this.value = options ? options.value || true : true;
      } else {
         _this._value = _this._extract(options);
      }
      return _this;
   }

   (0, _createClass3.default)(BoolValue, [{
      key: '_extract',
      value: function _extract(val) {
         if (_.isBoolean(val)) {
            return val;
         } else if (_.isNil(val)) {
            return true;
         } else if (_.isString(val)) {
            return val.toLowerCase() === 'true';
         } else if (_.isFinite(val)) {
            return val !== 0;
         } else {
            throw new Error('Unsupported value used when updating a BoolValue');
         }
      }
   }, {
      key: 'clone',
      value: function clone() {
         return new BoolValue(this._value);
      }
   }]);
   return BoolValue;
}(SimpleValue);

//---------------------------------------------------------------------------------------
//-- Decimal
//---------------------------------------------------------------------------------------


var DecimalType = new Type('decimal', function (_) {
   return new DecimalValue();
});

var DecimalValue = function (_SimpleValue2) {
   (0, _inherits3.default)(DecimalValue, _SimpleValue2);

   function DecimalValue(options) {
      (0, _classCallCheck3.default)(this, DecimalValue);

      var _this2 = (0, _possibleConstructorReturn3.default)(this, (DecimalValue.__proto__ || Object.getPrototypeOf(DecimalValue)).call(this, DecimalType));

      if (_.isObject(options)) {
         _this2.value = options ? options.value || 0.0 : 0.0;
      } else {
         _this2._value = _this2._extract(options);
      }
      return _this2;
   }

   (0, _createClass3.default)(DecimalValue, [{
      key: '_extract',
      value: function _extract(val) {
         if (_.isNumber(val)) {
            return val;
         } else if (_.isNil(val)) {
            return 0.0;
         } else if (_.isString(val)) {
            var parsed = parseFloat(val);

            if (isPrimitiveNaN(parsed)) {
               throw new Error('Failed to create DecimalType using: ', val);
            }

            return parsed;
         } else {
            throw new Error('Unsupported value used when updating a DecimalValue');
         }
      }
   }, {
      key: 'clone',
      value: function clone() {
         return new DecimalValue(this._value);
      }
   }]);
   return DecimalValue;
}(SimpleValue);

//---------------------------------------------------------------------------------------
//-- Int
//---------------------------------------------------------------------------------------


var IntType = new Type('int', function (_) {
   return new IntValue();
});

var IntValue = function (_SimpleValue3) {
   (0, _inherits3.default)(IntValue, _SimpleValue3);

   function IntValue(options) {
      (0, _classCallCheck3.default)(this, IntValue);

      var _this3 = (0, _possibleConstructorReturn3.default)(this, (IntValue.__proto__ || Object.getPrototypeOf(IntValue)).call(this, IntType));

      if (_.isNil(options)) {
         _this3._value = 0;
      } else if (_.isObject(options)) {
         _this3.value = options ? options.value || 0 : 0;
      } else {
         _this3._value = _this3._extract(options);
      }
      return _this3;
   }

   (0, _createClass3.default)(IntValue, [{
      key: '_extract',
      value: function _extract(val) {
         if (_.isNumber(val)) {
            return val;
         } else if (_.isNil(val)) {
            return 0;
         } else if (_.isString(val)) {
            var parsed = parseInt(val);

            if (isPrimitiveNaN(parsed)) {
               throw new Error('Failed to create IntType using: ', val);
            }

            return parsed;
         } else {
            throw new Error('Unsupported value used when updating a IntValue');
         }
      }
   }, {
      key: 'clone',
      value: function clone() {
         return new IntValue(this._value);
      }
   }]);
   return IntValue;
}(SimpleValue);

//---------------------------------------------------------------------------------------
//-- String
//---------------------------------------------------------------------------------------


var StringType = new Type('string', function (_) {
   return new StringValue();
});

var StringValue = function (_SimpleValue4) {
   (0, _inherits3.default)(StringValue, _SimpleValue4);

   function StringValue(options) {
      (0, _classCallCheck3.default)(this, StringValue);

      var _this4 = (0, _possibleConstructorReturn3.default)(this, (StringValue.__proto__ || Object.getPrototypeOf(StringValue)).call(this, StringType));

      if (_.isObject(options)) {
         _this4.value = options ? options.value || '' : '';
      } else {
         _this4._value = _this4._extract(options);
      }
      return _this4;
   }

   (0, _createClass3.default)(StringValue, [{
      key: '_extract',
      value: function _extract(val) {
         return _.toString(val);
      }
   }, {
      key: 'clone',
      value: function clone() {
         return new StringValue(this._value);
      }
   }]);
   return StringValue;
}(SimpleValue);

//---------------------------------------------------------------------------------------
//-- UInt
//---------------------------------------------------------------------------------------


var UIntType = new Type('uint', function (_) {
   return new UIntValue();
});

var UIntValue = function (_SimpleValue5) {
   (0, _inherits3.default)(UIntValue, _SimpleValue5);

   function UIntValue(options) {
      (0, _classCallCheck3.default)(this, UIntValue);

      var _this5 = (0, _possibleConstructorReturn3.default)(this, (UIntValue.__proto__ || Object.getPrototypeOf(UIntValue)).call(this, UIntType));

      if (_.isObject(options)) {
         _this5.value = options ? options.value || '' : '';
      } else {
         _this5._value = _this5._extract(options);
      }
      return _this5;
   }

   (0, _createClass3.default)(UIntValue, [{
      key: '_extract',
      value: function _extract(val) {
         if (_.isString(val)) {
            var parsed = parseInt(val);

            if (isPrimitiveNaN(parsed)) {
               throw new Error('Failed to create UIntType using: ', val);
            }

            return parsed;
         } else if (_.isNil(val)) {
            return 0;
         } else if (_.isNumber(val) && val >= 0) {
            return val;
         } else {
            throw new Error('Unsupported value used when updating a UIntValue');
         }
      }
   }, {
      key: 'clone',
      value: function clone() {
         return new UIntValue(this._value);
      }
   }]);
   return UIntValue;
}(SimpleValue);

//---------------------------------------------------------------------------------------
//-- Exports
//--------------------------------ı-------------------------------------------------------


function exportType(name, _type, onCreate) {
   module.exports[name] = {
      type: function type() {
         return _type;
      },
      value: function value(initialValue) {
         return onCreate(initialValue);
      }
   };
}

exportType('bool', BoolType, function (value) {
   return new BoolValue(value);
});
exportType('decimal', DecimalType, function (value) {
   return new DecimalValue(value);
});
exportType('int', IntType, function (value) {
   return new IntValue(value);
});
exportType('string', StringType, function (value) {
   return new StringValue(value);
});
exportType('uint', UIntType, function (value) {
   return new UIntValue(value);
});