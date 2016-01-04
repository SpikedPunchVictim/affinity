'use strict';

var Emitter = require('../eventEmitter.js');
var Commands = require('../commands.js');
var Type = require('./type.js');

var events = {
    requestForChange: 'simple-request-for-change',
    valuechanging: 'value-changing',
    valuechanged: 'value-changed'
}

//---------------------------------------------------------------------------------------
// The base type info
//---------------------------------------------------------------------------------------
// var SimpleType = {
//     create: function(name) {
//         return Type.create({name: name, equals: Type.equals});
//     }
// }

//---------------------------------------------------------------------------------------
class SimpleRfcCommand extends Commands.RfcCommand {
    constructor(source, value) {
        super();
        this._source = source;
        this._value = value;
        this._originalValue = this._source.value;
    }
    
    apply() {
        this._source._setValue(this._value);
    }
    
    unapply() {
        this._source._setValue(this._originalValue);
    }
}

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
        this._value = value;
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
            this.emit('error', 'Not a valid value for this type');
            return;
        }
        
        this.emit(events.requestForChange, new SimpleRfcCommand(this, val));
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

class BoolValue extends SimpleValue {
    constructor(options) {        
        let value = options ?
            options.value || true :
            true;
            
        super(BoolType, value || true);
    }
    
    isValidValue(value) {
        return (typeof value === 'boolean');
    }
    
    clone() {
        return new BoolValue(this._value);
    }
}

//---------------------------------------------------------------------------------------
//-- Decimal
//---------------------------------------------------------------------------------------
var DecimalType = new Type('decimal');

class DecimalValue extends SimpleValue {
    constructor(options) {
        let value = options ?
            options.value || 0.0 :
            0.0;
        super(DecimalType, value || 0.0);
    }
    
    isValidValue(value) {
        return (typeof value === 'number');
    }
    
    clone() {
        return new DecimalValue(this._value);
    }
}

//---------------------------------------------------------------------------------------
//-- Int
//---------------------------------------------------------------------------------------
var IntType = new Type('int');

class IntValue extends SimpleValue {
    constructor(options) {
        let value = options ?
            options.value || 0 :
            0;
            
        super(IntType, value || 0);
    }
    
    isValidValue(value) {
        return (typeof value === 'number');
    }
    
    clone() {
        return new IntValue(this._value);
    }
}

//---------------------------------------------------------------------------------------
//-- String
//---------------------------------------------------------------------------------------
var StringType = new Type('string');

class StringValue extends SimpleValue {
    constructor(options) {
        let value = options ?
            options.value || '' :
            '';
            
        super(StringType, value || '');
    }
    
    isValidValue(value) {
        return (typeof value === 'string');
    }
    
    clone() {
        return new StringValue(this._value);
    }
}

//---------------------------------------------------------------------------------------
//-- UInt
//---------------------------------------------------------------------------------------
var UIntType = new Type('uint');

class UIntValue extends SimpleValue {
    constructor(options) {
        let value = options ?
            options.value || 0 :
            0;
            
        super(UIntType, value || 0);
    }
    
    isValidValue(value) {
        return (typeof value === 'number') && (value >= 0);
    }
    
    clone() {
        return new UIntValue(this._value);
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