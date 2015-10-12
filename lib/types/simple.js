var _ = require('lodash');
var Emitter = require('../eventEmitter.js');
var Commands = require('../commands.js');

//---------------------------------------------------------------------------------------
// The base type info
//---------------------------------------------------------------------------------------
var SimpleType = {
    type: function() {
        throw new Error("Not implemented");
    },
    create: function() {
        throw new Error("Not implemented");
    },
    validate: function(other) {
        throw new Error("Not implemented");
    }
}

//---------------------------------------------------------------------------------------
// The base value info
//---------------------------------------------------------------------------------------
var SimpleValue = {
    _value: null,
    init: function init(value) {
        this.validate(value);
        Emitter.mixin(this);
        this._value = value;
    },
    get type() {
        throw new Error("Not implemented");
    },
    get value() {
        return this._value;
    },
    set value(val) {
        if(this.value === this._value) {
            return;
        }

        this.validate(this.value);

        var command = this._createValueChangeCommand(val);
        command.apply();
    },
    validate: function validate(value) {
        throw new Error("Not implemented");
    },
    equals: function equals(other) {
        throw new Error("Not implemented");
    },
    clone: function() {
      throw new Error("Not implemented");
    },
    _createValueChangeCommand: function _createValueChangeCommand(nextValue) {
        throw new Error("Not implemented");
    },
    _setValue: function _setValue(value) {
        if(value === this._value) {
            return;
        }

        this.validate(value);
        
        this.emit('value-changing');
        this._value = value;
        this.emit('value-changed');
    }
}


//---------------------------------------------------------------------------------------
//-- Bool
//---------------------------------------------------------------------------------------
var BoolType = Object.create(SimpleType);
_.extend(BoolType, {
    _type: {
        name: 'boolean',
        equals: function equals(other) {
            if(!other.hasOwnProperty('name')) {
                return false;
            }
            return other.name === 'boolean';
        }
    },
    type: function type() {
        return this._type;
    },
    create: function create() {
        var value = true;
    
        if(arguments.length > 0 && typeof arguments[0] === 'boolean') {
            value = arguments[0];
        }
    
        var result = Object.create(BoolValue);
        result.init(value);
        return result;
    },
    validate: function validate(value) {
        if(!(typeof value === 'boolean')) {
            throw new Error('Invalid value for the bool type');
        }    
    }
});

var BoolValue = Object.create(SimpleValue);
_.extend(BoolValue, {
    get type() {
      return BoolType.type();  
    },
    validate: function validate(value) {
        return Bool.validate(value);
    },
    equals: function equals(other) {
        return other instanceof BoolValue ?
            this.value === other.value :
            false;
    },
    clone: function clone() {
        return Bool.create(this._value);
    },
    _createValueChangeCommand: function _createValueChangeCommand(nextValue) {
        return new Commands.BoolChangeValueCommand(this, this._value, nextValue);
    }
});

//---------------------------------------------------------------------------------------
//-- Decimal
//---------------------------------------------------------------------------------------
var DecimalType = Object.create(SimpleType);
_.extend(DecimalType, {
    _type: {
        name: 'decimal',
        equals: function equals(other) {
            if(!other.hasOwnProperty('name')) {
                return false;
            }
            return other.name === 'decimal';
        }
    },
    type: function type() {
        return this._type;
    },
    create: function create() {
        var value = 0.0;
    
        if(arguments.length > 0 && typeof arguments[0] === 'number') {
            value = arguments[0];
        }
    
        var result = Object.create(DecimalValue);
        result.init(value);
        return result;
    },
    validate: function validate(value) {
        if(!(typeof value === 'number')) {
            throw new Error('Invalid value for the decimal type');
        }
    }
});

var DecimalValue = Object.create(SimpleValue);
_.extend(DecimalValue, {
    get type() {
      return DecimalType.type();  
    },
    validate: function validate(value) {
        return DecimalType.validate(value);
    },
    equals: function equals(other) {
        return other instanceof DecimalValue ?
            this.value === other.value :
            false;
    },
    clone: function clone() {
        return DecimalType.create(this._value);
    },
    _createValueChangeCommand: function _createValueChangeCommand(nextValue) {
        return new Commands.DecimalChangeValueCommand(this, this._value, nextValue);
    }
});

//---------------------------------------------------------------------------------------
//-- Int
//---------------------------------------------------------------------------------------
var IntType = Object.create(SimpleType);
_.extend(IntType, {
    _type: {
        name: 'int',
        equals: function equals(other) {
            if(!other.hasOwnProperty('name')) {
                return false;
            }
            return other.name === 'int';
        }
    },
    type: function type() {
        return this._type;
    },
    create: function create() {
        var value = 0;
    
        if(arguments.length > 0 && typeof arguments[0] === 'number') {
            value = arguments[0];
        }
    
        var result = Object.create(IntValue);
        result.init(value);
        return result;
    },
    validate: function validate(value) {
        if(!(typeof value === 'number')) {
            throw new Error('Invalid value for the int type');
        }
    }
});

var IntValue = Object.create(SimpleValue);
_.extend(IntValue, {
    get type() {
      return IntType.type();  
    },
    validate: function validate(value) {
        return IntType.validate(value);
    },
    equals: function equals(other) {
        return other instanceof IntValue ?
            this.value === other.value :
            false;
    },
    clone: function clone() {
        return IntType.create(this._value);
    },
    _createValueChangeCommand: function _createValueChangeCommand(nextValue) {
        return new Commands.IntChangeValueCommand(this, this._value, nextValue);
    }
});


//---------------------------------------------------------------------------------------
//-- String
//---------------------------------------------------------------------------------------
var StringType = Object.create(SimpleType);
_.extend(StringType, {
    _type: {
        name: 'string',
        equals: function equals(other) {
            if(!other.hasOwnProperty('name')) {
                return false;
            }
            return other.name === 'string';
        }
    },
    type: function type() {
        return this._type;
    },
    create: function create() {
        var value = '';
    
        if(arguments.length > 0 && typeof arguments[0] === 'string') {
            value = arguments[0];
        }
    
        var result = Object.create(StringValue);
        result.init(value);
        return result;
    },
    validate: function validate(value) {
        if(!(typeof value === 'string')) {
            throw new Error('Invalid value for the string type');
        }
    }
});

var StringValue = Object.create(SimpleValue);
_.extend(StringValue, {
    get type() {
      return StringType.type();  
    },
    validate: function validate(value) {
        return StringType.validate(value);
    },
    equals: function equals(other) {
        return other instanceof StringValue ?
            this.value === other.value :
            false;
    },
    clone: function clone() {
        return StringType.create(this._value);
    },
    _createValueChangeCommand: function _createValueChangeCommand(nextValue) {
        return new Commands.StringChangeValueCommand(this, this._value, nextValue);
    }
});

console.log("StringValue: %j", StringValue);


//---------------------------------------------------------------------------------------
//-- UInt
//---------------------------------------------------------------------------------------
var UIntType = Object.create(SimpleType);
_.extend(UIntType, {
    _type: {
        name: 'uint',
        equals: function equals(other) {
            if(!other.hasOwnProperty('name')) {
                return false;
            }
            return other.name === 'uint';
        }
    },
    type: function type() {
        return this._type;
    },
    create: function create() {
        var value = 0;
    
        if(arguments.length > 0 && typeof arguments[0] === 'number') {
            value = arguments[0];
        }
    
        var result = Object.create(UIntValue);
        result.init(value);
        return result;
    },
    validate: function validate(value) {
        if(!(typeof value === 'number')) {
            throw new Error('Invalid value for the uint type');
        }
    
        if(value < 0) {
            throw new Error('The value must be equal to or greater than 0');
        }
    }
});

var UIntValue = Object.create(SimpleValue);
_.extend(UIntValue, {
    get type() {
      return UIntType.type();  
    },
    validate: function validate(value) {
        return UIntType.validate(value);
    },
    equals: function equals(other) {
        return other instanceof UIntValue ?
            this.value === other.value :
            false;
    },
    clone: function clone() {
        return UIntType.create(this._value);
    },
    _createValueChangeCommand: function _createValueChangeCommand(nextValue) {
        return new Commands.UIntChangeValueCommand(this, this._value, nextValue);
    }
});


var exports = module.exports;
exports.Bool = BoolType;
exports.Decimal = DecimalType;
exports.Int = IntType;
exports.String = StringType;
exports.UInt = UIntType;



