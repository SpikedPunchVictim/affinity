'use strict';

var Emitter = require('../eventEmitter.js');
var Commands = require('../commands.js');
var Type = require('./type.js');

//---------------------------------------------------------------------------------------
// The base type info
//---------------------------------------------------------------------------------------
// var SimpleType = {
//     create: function(name) {
//         return Type.create({name: name, equals: Type.equals});
//     }
// }

//---------------------------------------------------------------------------------------
// The base value info
//---------------------------------------------------------------------------------------
class SimpleValue {
    constructor(type, value) {
        if(!this.isValidValue(value)) {
            throw new Error("Unsupported value for this type");
        }
        
        Emitter.mixin(this);
        this._type = type;
        this._value;      
    }
    
    get type() {
        return this._type;
    }
    
    get value() {
        return this._value;
    }
    
    set value(val) {
        if(val === this._value) {
            return;
        }

        if(!this.isValidValue(val)) {
            this.emit('error', 'Not a valid value for this type')
        }

        var command = this._createValueChangeCommand(val);
        command.apply();  
    }
    
     equals(other) {
        return this.type.equals(other.type) &&
               this.value === other.value;
    }
    
    isValidValue(value) {
        this.emit('error', 'Not implemented error');
    }
    
    clone() {
        this.emit('error', 'Not implemented error');
    }
   
    _createValueChangeCommand(nextvalue) {
        this.emit('error', 'Not implemented error');
    }
    
    _setValue(value) {
        if(value === this._value) {
            return;
        }

        if(!this.isValidValue(value)) {
            this.emit('error', 'Not a valid value for this type')
        }
        
        var changed = {
            from: this._value,
            to: value
        };
        
        this.emit('value-changing', changed);
        this._value = value;
        this.emit('value-changed', changed);
    }
}

/*
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
*/

// var Exported = {
//     create: function create(simpleType, create) {
//         return {
//             _type: simpleType,
//             _create: create,
//             type: function type() {
//                 return this._type;
//             },
//             create: function create() {
//                 return this._create(arguments);
//             }
//         }
//     }
// }

function exportType(name, type, onCreate) {
    module.exports[name] = {
        type() {
           return type;
        },
        
        create() {
            return onCreate();
        }
    }
}

//---------------------------------------------------------------------------------------
//-- Bool
//---------------------------------------------------------------------------------------
var BoolType = new Type('boolean');
// var BoolType = SimpleType.create('boolean');

class BoolValue extends SimpleValue {
    constructor(value) {
        super(BoolType, value);
    }
    
    isValidValue(value) {
        return (typeof value === 'boolean');
    }
    
    clone() {
        return new BoolValue(this._value);
    }
   
    _createValueChangeCommand(nextValue) {
        return new Commands.BoolChangeValueCommand(this, this._value, nextValue);
    }
}

//---------------------------------------------------------------------------------------
//-- Decimal
//---------------------------------------------------------------------------------------
var DecimalType = new Type('decimal');

class DecimalValue extends SimpleValue {
    constructor(value) {
        super(DecimalType, value);
    }
    
    isValidValue(value) {
        return (typeof value === 'number');
    }
    
    clone() {
        return new DecimalValue(this._value);
    }
   
    _createValueChangeCommand(nextValue) {
        return new Commands.DecimalChangeValueCommand(this, this._value, nextValue);
    }
}

//---------------------------------------------------------------------------------------
//-- Int
//---------------------------------------------------------------------------------------
var IntType = new Type('int');

class IntValue extends SimpleValue {
    constructor(value) {
        super(IntType, value);
    }
    
    isValidValue(value) {
        return (typeof value === 'number');
    }
    
    clone() {
        return new IntValue(this._value);
    }
   
    _createValueChangeCommand(nextValue) {
        return new Commands.IntChangeValueCommand(this, this._value, nextValue);
    }
}

//---------------------------------------------------------------------------------------
//-- String
//---------------------------------------------------------------------------------------
var StringType = new Type('string');

class StringValue extends SimpleValue {
    constructor(value) {
        super(StringType, value);
    }
    
    isValidValue(value) {
        return (typeof value === 'string');
    }
    
    clone() {
        return new StringValue(this._value);
    }
   
    _createValueChangeCommand(nextValue) {
        return new Commands.StringChangeValueCommand(this, this._value, nextValue);
    } 
}

//---------------------------------------------------------------------------------------
//-- UInt
//---------------------------------------------------------------------------------------
var UIntType = new Type('uint');

class UIntValue extends SimpleValue {
    constructor(value) {
        super(UIntType, value);
    }
    
    isValidValue(value) {
        return (typeof value === 'number');
    }
    
    clone() {
        return new UIntValue(this._value);
    }
   
    _createValueChangeCommand(nextValue) {
        return new Commands.UIntChangeValueCommand(this, this._value, nextValue);
    } 
}

//---------------------------------------------------------------------------------------
//-- Exports
//--------------------------------ı-------------------------------------------------------
exportType('bool', BoolType, (value) => new BoolValue(value));
exportType('decimal', DecimalType, (value) => new DecimalValue(value));
exportType('int', IntType, (value) => new IntValue(value));
exportType('string', StringType, (value) => new StringValue(value));
exportType('uint', UIntType, (value) => new UIntValue(value));