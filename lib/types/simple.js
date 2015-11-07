var _ = require('lodash');
var Emitter = require('../eventEmitter.js');
var Commands = require('../commands.js');
var Types = require('./types.js');

//---------------------------------------------------------------------------------------
// The base type info
//---------------------------------------------------------------------------------------
var SimpleType = {
    create: function(name) {
        return Types.create({name: name, equals: Types.equals});
    }
}

//---------------------------------------------------------------------------------------
// The base value info
//---------------------------------------------------------------------------------------
var SimpleValue = {
    //  isValidValue
    //  createValueChangeCommand(nextValue)
    //  clone
    create: function(simpleType, overrides) {
        // Setup getters/setters first
        var other = {
            _type: simpleType,
            _value: null,
            get type() {
                return this._type;
            },
            get value() {
                return this._value;
            },
            set value(val) {
                if(val === this._value) {
                    return;
                }
        
                this.isValidValue(val);
        
                var command = this._createValueChangeCommand(val);
                command.apply();
            }
        };
        
        other.init = function init(value) {
            if(!this.isValidValue(value)) {
                throw new Error("Unsupported value for this SimpleValue type");
            }
            Emitter.mixin(this);
            this._value = value;
        }

        other._createValueChangeCommand = overrides.createValueChangeCommand;
        other.isValidValue = overrides.isValidValue;
        other.clone = overrides.clone;
        
        other.equals = function equals(other) {
            return SimpleValue.equals(this, other);
        }
    
        other._setValue = function _setValue(value) {
            if(value === this._value) {
                return;
            }
    
            this.isValidValue(value);
            
            var changed = {
                from: this._value,
                to: value
            };
            
            this.emit('value-changing', changed);
            this._value = value;
            this.emit('value-changed', changed);
        }
        
        return other;
    },
    equals: function equalsType(simpleValue, otherValue) {
         var hasKeys = '_type' in otherValue && 
                        'type' in otherValue &&
                        simpleValue.type.equals(otherValue.type);
        if(!hasKeys) {
            return false;
        }
        
        return simpleValue.value === simpleValue.value;
    }
}

var Exported = {
    create: function create(simpleType, create) {
        return {
            _type: simpleType,
            _create: create,
            type: function type() {
                return this._type;
            },
            create: function create() {
                return this._create(arguments);
            }
        }
    }
}


//---------------------------------------------------------------------------------------
//-- Bool
//---------------------------------------------------------------------------------------
var BoolType = SimpleType.create('boolean');

var BoolValue = SimpleValue.create(BoolType, {
    isValidValue: function isValidValue(value) {
        return (typeof value === 'boolean'); 
    },
    clone: function clone() {
        return createBoolValue(this._value);
    },
    createValueChangeCommand: function _createValueChangeCommand(nextValue) {
        return new Commands.BoolChangeValueCommand(this, this._value, nextValue);
    }
});

function createBoolValue() {
    var value = true;

    if(arguments.length > 0 && typeof arguments[0] === 'boolean') {
        value = arguments[0];
    }

    var result = Object.create(BoolValue);
    result.init(value);
    return result;
}


//---------------------------------------------------------------------------------------
//-- Decimal
//---------------------------------------------------------------------------------------
var DecimalType = SimpleType.create('decimal');

var DecimalValue = SimpleValue.create(DecimalType, {
    isValidValue: function isValidValue(value){
        return (typeof value === 'number');
    },
    createValueChangeCommand: function createValueChangeCommand(nextValue) {
        return new Commands.DecimalChangeValueCommand(this, this._value, nextValue);
    },
    clone: function clone() {
        return createDecimalValue(this._value);
    }
});

function createDecimalValue() {
    var value = 0;

    if(arguments.length > 0 && typeof arguments[0] === 'number') {
        value = arguments[0];
    }

    var result = Object.create(DecimalValue);
    result.init(value);
    return result;
}

//---------------------------------------------------------------------------------------
//-- Int
//---------------------------------------------------------------------------------------
var IntType = SimpleType.create('int');

var IntValue = SimpleValue.create(IntType, {
    isValidValue: function isValidValue(value){
        return (typeof value === 'number');
    },
    createValueChangeCommand: function createValueChangeCommand(nextValue) {
        return new Commands.IntChangeValueCommand(this, this._value, nextValue);
    },
    clone: function clone() {
        return createIntValue(this._value);
    }    
})

function createIntValue() {
    var value = 0;

    if(arguments.length > 0 && typeof arguments[0] === 'number') {
        value = arguments[0];
    }

    var result = Object.create(IntValue);
    result.init(value);
    return result;
}


//---------------------------------------------------------------------------------------
//-- String
//---------------------------------------------------------------------------------------
var StringType = SimpleType.create('string');

var StringValue = SimpleValue.create(StringType, {
    isValidValue: function isvalidValue(value) {
        return (typeof value === 'string');
    },
    createValueChangeCommand: function createValueChangeCommand(nextValue) {
         return new Commands.StringChangeValueCommand(this, this._value, nextValue);
     },
    clone: function clone() {
         return createStringValue(this._value);
     }
});

function createStringValue() {
    var value = '';
    
    console.log(typeof arguments[0]);

    if(arguments.length > 0 && StringType.isValidValue(arguments[0])) {
        value = arguments[0];
    }

    var result = Object.create(StringValue);
    result.init(value);
    return result;
}

//---------------------------------------------------------------------------------------
//-- UInt
//---------------------------------------------------------------------------------------
var UIntType = SimpleType.create('uint');

var UIntValue = SimpleValue.create(UIntType, {
    isValidValue: function isvalidValue(value) {
        return (typeof value === 'number');
    },
    createValueChangeCommand: function createValueChangeCommand(nextValue) {
         return new Commands.UIntChangeValueCommand(this, this._value, nextValue);
     },
    clone: function clone() {
         return createUIntValue(this._value);
     }    
});

function createUIntValue() {
        var value = 0;
        
        if(arguments.length > 0 && typeof arguments[0] === 'number') {
            value = arguments[0];
        }
        
        var result = Object.create(UIntValue);
        result.init(value);
        return result;
}


//---------------------------------------------------------------------------------------
//-- Exports
//--------------------------------ı-------------------------------------------------------
var exports = module.exports;
exports.bool = Exported.create(BoolType, createBoolValue);
exports.decimal = Exported.create(DecimalType, createDecimalValue);
exports.int = Exported.create(IntType, createIntValue);
exports.string = Exported.create(StringType, createStringValue);
exports.uint = Exported.create(UIntType, createUIntValue);