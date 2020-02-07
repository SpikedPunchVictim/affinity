'use strict';

const _ = require('lodash')
const when = require('when')
const { EventEmitter } = require('../eventEmitter.js')
const Type = require('./type.js')
const Value = require('./value.js')
const RequestForChange = require('../requestForChange.js')
const Events = require('../events.js')

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
class SimpleValue extends EventEmitter {
   constructor(type) {
      super()
      this._type = type;
      this._value = null;
   }

   get type() {
      return this._type;
   }

   get value() {
      return this._value;
   }

   equals(other) {
      if (other instanceof SimpleValue) {
         return this.type.equals(other.type) && this.value === other.value;
      } else {
         return this.value === other;
      }
   }

   isValidValue(value) {
      throw new Error('Not implemented error');
   }

   clone() {
      throw new Error('Not implemented error');
   }

   isValidValue(value) {
      try {
         this._extract(value)
         return true
      } catch(err) {
         return false
      }
   }

   update(other) {
      let val = this._extract(Value.isValue(other) ? other.value : other);

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

      let self = this;
      return RequestForChange.new(changed)
         .notify(req => self.emit(Events.requestForChange, req))
         .fulfill(req => {
            self.emit(Events.valueChanging, changed);
            self._value = val;
            self.emit(Events.valueChanged, changed);
         })
         .queue();
   }

   _extract(val) {
      throw new Error('Not implemented error');
   }

   applyChangeSet(change) {
      return this.update(change.to);
   }
}

//---------------------------------------------------------------------------------------
//-- Bool
//---------------------------------------------------------------------------------------
var BoolType = new Type('bool', _ => new BoolValue());

class BoolValue extends SimpleValue {
   constructor(options) {
      super(BoolType);

      if (_.isObject(options)) {
         this.value = options ?
            options.value || true :
            true;
      } else {
         this._value = this._extract(options);
      }
   }

   _extract(val) {
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

   clone() {
      return new BoolValue(this._value);
   }
}

//---------------------------------------------------------------------------------------
//-- Decimal
//---------------------------------------------------------------------------------------
var DecimalType = new Type('decimal', _ => new DecimalValue());

class DecimalValue extends SimpleValue {
   constructor(options) {
      super(DecimalType);

      if (_.isObject(options)) {
         this.value = options ?
            options.value || 0.0 :
            0.0;
      } else {
         this._value = this._extract(options);
      }
   }

   _extract(val) {
      if (_.isNumber(val)) {
         return val;
      } else if (_.isNil(val)) {
         return 0.0;
      } else if (_.isString(val)) {
         let parsed = parseFloat(val);

         if (isPrimitiveNaN(parsed)) {
            throw new Error('Failed to create DecimalType using: ', val);
         }

         return parsed;
      } else {
         throw new Error('Unsupported value used when updating a DecimalValue');
      }
   }

   clone() {
      return new DecimalValue(this._value);
   }
}

//---------------------------------------------------------------------------------------
//-- Int
//---------------------------------------------------------------------------------------
var IntType = new Type('int', _ => new IntValue());

class IntValue extends SimpleValue {
   constructor(options) {
      super(IntType);

      if (_.isNil(options)) {
         this._value = 0;
      } else if (_.isObject(options)) {
         this.value = options ?
            options.value || 0 :
            0;
      } else {
         this._value = this._extract(options);
      }
   }

   _extract(val) {
      if (_.isNumber(val)) {
         return val;
      } else if (_.isNil(val)) {
         return 0;
      } else if (_.isString(val)) {
         let parsed = parseInt(val);

         if (isPrimitiveNaN(parsed)) {
            throw new Error('Failed to create IntType using: ', val);
         }

         return parsed;
      } else {
         throw new Error('Unsupported value used when updating a IntValue');
      }
   }

   clone() {
      return new IntValue(this._value);
   }
}

//---------------------------------------------------------------------------------------
//-- String
//---------------------------------------------------------------------------------------
var StringType = new Type('string', _ => new StringValue());

class StringValue extends SimpleValue {
   constructor(options) {
      super(StringType);

      if (_.isObject(options)) {
         this.value = options ?
            options.value || '' :
            '';
      } else {
         this._value = this._extract(options);
      }
   }

   _extract(val) {
      return _.toString(val);
   }

   clone() {
      return new StringValue(this._value);
   }
}

//---------------------------------------------------------------------------------------
//-- UInt
//---------------------------------------------------------------------------------------
var UIntType = new Type('uint', _ => new UIntValue());

class UIntValue extends SimpleValue {
   constructor(options) {
      super(UIntType);

      if (_.isObject(options)) {
         this.value = options ?
            options.value || '' :
            '';
      } else {
         this._value = this._extract(options);
      }
   }

   _extract(val) {
      if (_.isString(val)) {
         let parsed = parseInt(val);

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

   clone() {
      return new UIntValue(this._value);
   }
}

//---------------------------------------------------------------------------------------
//-- Exports
//--------------------------------ı-------------------------------------------------------
function exportType(name, type, onCreate) {
   module.exports[name] = {
      type() {
         return type;
      },
      value(initialValue) {
         return onCreate(initialValue);
      }
   }
}

exportType('bool', BoolType, (value) => new BoolValue(value));
exportType('decimal', DecimalType, (value) => new DecimalValue(value));
exportType('int', IntType, (value) => new IntValue(value));
exportType('string', StringType, (value) => new StringValue(value));
exportType('uint', UIntType, (value) => new UIntValue(value));