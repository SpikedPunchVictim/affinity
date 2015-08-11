var util = require('util');
var utility = require('../utility.js');
var Emitter = require('../eventEmitter.js');

module.exports.type = type;
module.exports.create = create;

// Shared Type information
var typeInfo = {
    name: 'uint',
    equals: function equals(other) {
        if(!other.hasOwnProperty('name')) {
            return false;
        }
        return other.name === 'uint';
    }
}

function type() {
    return typeInfo
}

function create() {
    var value = 0;

    if(arguments.length > 0 && typeof arguments[0] === 'number') {
        value = arguments[0];
    }

    return new UintValue(value);
}

function validate(value) {
    if(!(typeof value === 'number')) {
        throw new Error('Invalid value for the uint type');
    }

    if(value < 0) {
        throw new Error('The value must be equal to or greater than 0');
    }
}

function UintValue(value) {
    validate(value);
    Emitter.mixin(this);
    this._value = value;

    Object.defineProperty(this, 'value', {
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

    Object.defineProperty(this, 'type', {
        get: function() { return typeInfo; }
    });
}

UintValue.prototype.clone = function clone() {
    return new UintValue(this.value);
}

UintValue.prototype.equals = function equals(other) {
    return other instanceof UintValue ?
        this.value === other.value :
        false;
}