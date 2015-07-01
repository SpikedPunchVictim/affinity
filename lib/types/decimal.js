var EventEmitter = require('events').Eventemitter;

module.exports.createInfo = createInfo;
module.exports.createValue = createValue;

// Shared Type information
var typeInfo = {
    name: "decimal"
}

function createInfo() {
    return typeInfo
}

function createValue(value) {
    if(!(value instanceof Number)) {
        throw new Error('Invalid value to create a decimal type');
    }
    return new DecimalValue(value || 0.0);
}

function DecimalValue(value) {
    EventEmitter.call(this)
    this._value = value;
}

util.inherits(DecimalValue, EventEmitter);

Object.defineProperty(DecimalValue, 'value', {
    get: function() {
        return this._value;
    }

    set: function(value) {
        if(value === this._value) {
            return;
        }

        this.emit('value-changing');
        this._value = value;
        this.emit('value-changed');
    }
});