var EventEmitter = require('events').EventEmitter;
var util = require('util');

var exports = module.exports;
exports.type = type;
exports.create = create;
exports.validate = validate;

// Shared type information
var typeInfo = {
    name: 'boolean',
    equals: function equals(typeInfo) {
        if(!typeInfo.hasOwnProperty('name')) {
            return false;
        }
        return typeInfo.name === 'boolean';
    }
};

function type() {
    return typeInfo;
}

function create() {
    var value = '';

    if(arguments.length > 0 && typeof arguments[0] === 'boolean') {
        value = arguments[0];
    }

    return new BoolValue(value);
}

function validate(value) {
    if(!(typeof value === 'boolean')) {
        throw new Error('Invalid value for the bool type');
    }    
}

function BoolValue(value) {
    validate(value);
    EventEmitter.call(this);
    this._value = value;
}

util.inherits(BoolValue, EventEmitter);

Object.defineProperty(BoolValue, 'type', {
    get: function() { return typeInfo; }
});

Object.defineProperty(BoolValue, 'validate', {
    get: function() { return validate; }
});

Object.defineProperty(BoolValue, 'value', {
    get: function() {
        return this._value;
    },

    set: function(value) {
        if(value === this._value) {
            return;
        }

        validate(value);

        this.emit('value-changing');
        this._value = value;
        this.emit('value-changed');
    }
});