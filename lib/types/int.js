var util = require('util');
var utility = require('../utility.js');

module.exports.type = type;
module.exports.create = create;

// Shared Type information
var typeInfo = {
    name: 'int',
    equals: function equals(other) {
        if(!other.hasOwnProperty('name')) {
            return false;
        }
        return other.name === 'int';
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

    return new IntValue(value);
}

function validate(value) {
    if(!(typeof value === 'number')) {
        throw new Error('Invalid value for the int type');
    }
}

function IntValue(value) {
    validate(value);
    utility.events.mixin(this);
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

IntValue.prototype.clone = function clone() {
    return new IntValue(this.value);
}

IntValue.prototype.equals = function equals(other) {
    return other instanceof IntValue ?
        this.value === other.value :
        false;
}