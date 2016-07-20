'use strict';

var _ = require('lodash');
var Emitter = require('../eventEmitter.js');
var Commands = require('../commands.js');
var Type = require('./type.js');
var RequestForChange = require('../requestForChange.js');
var Events = require('../events.js');

//---------------------------------------------------------------------------------------
// The base value info
//
// Note:
//  Requests for change occur at the member/instance level. These are just
//  classes that store type/value info.
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
            throw new Error('Not a valid value for this type');
        }
        
        var changed = {
            from: this._value,
            to: val
        };
        
        var req = new RequestForChange(changed);
        req.fulfilled(this, ctx => {
            this.emit(Events.valueChanging, changed);
            this._value = val;
            this.emit(Events.valueChanged, changed); 
        });
        
        this.emit(Events.requestForChange, req);
        req._settle();
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
    
    applyChangeSet(change) {
        // TODO: validate type?
        this.value = change.to;
    }
}

//---------------------------------------------------------------------------------------
//-- Bool
//---------------------------------------------------------------------------------------
var BoolType = new Type('boolean');

class BoolValue extends SimpleValue {
    constructor(options) {
        let value = true;
        
        if(_.isBoolean(options)) {
            value = options;
        } else if(_.isString(options)) {
            value = options.toLowerCase() === 'true';
        } else {
            value = options ?
                options.value || true :
                true;
        }
        
        super(BoolType, value);
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
        let value = 0.0;
        
        if(_.isNumber(options)) {
            value = options;
        } else if(_.isString(options)) {
	        value = parseFloat(options);
            if(isNaN(value)) {
                throw new Error('Failed to create IntType using: ', options);
            }
        } else {
	        value = options ?
                options.value || 0.0 :
                0.0;
        }
        super(DecimalType, value);
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
        let value = 0;
        
        if(_.isNumber(options)) {
            value = options;
        } else if(_.isString(options)) {
	        value = parseInt(options);
            if(isNaN(value)) {
                throw new Error('Failed to create IntType using: ', options);
            }         
        }
         else {
            value = options ?
                options.value || 0 :
                0;
        }
        
        super(IntType, value);
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
        let value = '';
        
        if(_.isString(options)) {
            value = options;
        } else {
            value = options ?
                options.value || '' :
                String(options);
        }
           
        super(StringType, value);
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
        let value = 0;
        
        if(_.isNumber(options)) {
            value = options;
        } else if(_.isString(options)) {
	        value = parseInt(options);
            if(isNaN(value) || value < 0) {
                throw new Error('Failed to create UIntType using: ', options);
            }         
        } else {
            value = options ?
                options.value || 0 :
                0;
        }
        
            
        super(UIntType, value);
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