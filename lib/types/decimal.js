var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports.createType = createType;
module.exports.create = create;

// Shared Type information
var typeInfo = {
    name: 'decimal',
    equals: function equals(typeInfo) {
        if(!typeInfo.hasOwnProperty('name')) {
            return false;
        }
        return typeInfo.name === 'decimal';
    }
}

function createType() {
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
}

util.inherits(DecimalValue, EventEmitter);

Object.defineProperty(DecimalValue, 'value', {
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