var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports.type = type;
module.exports.create = create;

// Shared Type information
var typeInfo = {
    name: 'decimal',
    equals: function equals(other) {
        if(!other.hasOwnProperty('name')) {
            return false;
        }
        return other.name === 'decimal';
    }
}

function type() {
    return typeInfo
}

function create() {
    var value = 0.0;

    if(arguments.length > 0 && typeof arguments[0] === 'number') {
        value = arguments[0];
    }

    return new DecimalValue(value);
}

function validate(value) {
    if(!(typeof value === 'number')) {
        throw new Error('Invalid value for the decimal type');
    }    
}

function DecimalValue(value) {
    validate(value);
    EventEmitter.call(this);
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

util.inherits(DecimalValue, EventEmitter);

DecimalValue.prototype.clone = function clone() {
    return new DecimalValue(this.value);
}

DecimalValue.prototype.equals = function equals(other) {
    return other instanceof DecimalValue ?
        this.value === other.value :
        false;
}