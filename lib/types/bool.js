var util = require('util');
var utility = require('../utility.js');
var Emitter = require('../eventEmitter.js');

var exports = module.exports;
exports.type = type;
exports.create = create;
exports.validate = validate;

// Shared type information
var typeInfo = {
    name: 'boolean',
    equals: function equals(other) {
        if(!other.hasOwnProperty('name')) {
            return false;
        }
        return other.name === 'boolean';
    }
};

function type() {
    return typeInfo;
}

function create() {
    var value = true;

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

    Emitter.mixin(this);
    this._value = value;
}

Object.defineProperty(BoolValue.prototype, 'value', {
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

Object.defineProperty(BoolValue.prototype, 'type', {
    get: function() { return typeInfo; }
});

Object.defineProperty(BoolValue.prototype, 'validate', {
    get: function() { return validate; }
});

BoolValue.prototype.clone = function clone() {
    return new BoolValue(this.value);
}

BoolValue.prototype.equals = function equals(other) {
    return other instanceof BoolValue ?
        this.value === other.value :
        false;
}
