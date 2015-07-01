var EventEmitter = require('events').Eventemitter;

module.exports.createInfo = createInfo;
module.exports.createValue = createValue;

// Shared Type information
var typeInfo = {
    name: "String"
}

function createInfo() {
    return typeInfo
}

function createValue(value) {
    return new StringValue(value || "");
}

function StringValue(value) {
    EventEmitter.call(this)
    this._value = value;
}

util.inherits(StringValue, EventEmitter);

Object.defineProperty(StringValue, 'value', {
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