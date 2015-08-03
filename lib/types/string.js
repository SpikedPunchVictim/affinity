var util = require('util');
var EventEmitter = require('../eventEmitter.js');

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

    EventEmitter.mixin(this);
    this._value = value;

    Object.defineProperty(this, 'type', {
        get: function() { return typeInfo; }
    });

    Object.defineProperty(this, 'validate', {
        get: function() { return validate; }
    });

    Object.defineProperty(this, 'value', {
        get: function() {
            return this._value;
        },

        set: function(value) {
            if(value === this._value) {
                return;
            }

            validate(this, value);

            this.emit('value-changing');
            this._value = value;
            this.emit('value-changed');
        }
    });
}

StringValue.prototype.clone = function clone() {
    return new StringValue(this.value);
}

StringValue.prototype.equals = function equals(other) {
    return other instanceof StringValue ?
        this.value === other.value :
        false;
}