var util = require('util');
var Emitter = require('../eventEmitter.js');
var Commands = require('../commands.js');
var Types = require('./types.js');

var exports = module.exports;
exports.type = type;
exports.create = create;
exports.validate = validate;

// Shared type information
var typeInfo = {
    name: 'string',
    equals: function equals(other) {
        if(!other.hasOwnProperty('name')) {
            return false;
        }
        return other.name === 'string';
    }
};

function type() {
    return typeInfo;
}

function create() {
    var value = '';

    if(arguments.length > 0 && typeof arguments[0] === 'string') {
        value = arguments[0];
    }

    return new StringValue(value);
}

function validate(target, value) {
    if(!(typeof value === 'string')) {
        throw new Error('Invalid value for the string type');
    }    
}

function StringValue(value) {
    validate(this, value);

    //Emitter.mixin(this);
    //this.value = value;
}


//------------------------------------------------------------------------
// Creates the common structure for simple types. Simple types are:
//  1) bool
//  2) decimal
//  3) int
//  4) string
//  5) uint
//
// options : object
//
//  createChangeValueCommand(this, prevValue. nextValue)
//      Function for creating the ChangeValue command
//
//  typeInfo
//      The Value's typeInfo
//
//  validate : function
//      The Value's validate method
//
//  clone() : function
//      The Value's clone method that is called.
//
//  equals(obj) : function
//      Returns true if 'obj' equals the Value. Otherwise false.
//------------------------------------------------------------------------
Types.SimpleValue.mixin(StringValue.prototype, {
    createChangeValueCommand: function(self, prevValue, nextValue) {
        return new Commands.StringChangeValueCommand(self, prevValue, nextValue);
    },
    typeInfo: typeInfo,
    validate: validate,
    clone: function clone() {
        return new StringValue(this.value);
    },
    equals: function equals(obj) {
        console.log("Calling mixin equals: %j", this)
        return obj instanceof StringValue ?
            this.value === obj.value :
            false;
    }
});

/*
Object.defineProperty(StringValue.prototype, 'type', {
    get: function() { return typeInfo; }
});

Object.defineProperty(StringValue.prototype, 'validate', {
    get: function() { return validate; }
});

Object.defineProperty(StringValue.prototype, 'value', {
    get: function() {
        return this._value;
    },

    set: function(value) {
        if(value === this._value) {
            return;
        }

        validate(value);

        var command = new Commands.StringChangeValueCommand(this, this._value, value);
        command.apply();
    }
});

StringValue.prototype._setValue = function _setValue(value) {
    if(value === this._value) {
        return;
    }

    validate(value);
    
    this.emit('value-changing');
    this._value = value;
    this.emit('value-changed');
}


StringValue.prototype.clone = function clone() {
    return new StringValue(this.value);
}

StringValue.prototype.equals = function equals(other) {
    return other instanceof StringValue ?
        this.value === other.value :
        false;
}
*/