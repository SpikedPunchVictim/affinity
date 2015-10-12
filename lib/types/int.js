var util = require('util');
var utility = require('../utility.js');
var Emitter = require('../eventEmitter.js');
var Commands = require('../commands.js');

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
    Emitter.mixin(this);
    this.value = value;
}

Object.defineProperty(IntValue.prototype, 'value', {
    get: function() {
        return this._value;
    },

    set: function(value) {
        if(value === this._value) {
            return;
        }

        validate(value);

        var command = new Commands.IntChangeValueCommand(this, this._value, value);
        command.apply();
    }
});

IntValue.prototype._setValue = function _setValue(value) {
    if(value === this._value) {
        return;
    }

    validate(value);
    
    this.emit('value-changing');
    this._value = value;
    this.emit('value-changed');
}


Object.defineProperty(IntValue.prototype, 'type', {
    get: function() { return typeInfo; }
});


IntValue.prototype.clone = function clone() {
    return new IntValue(this.value);
}

IntValue.prototype.equals = function equals(other) {
    return other instanceof IntValue ?
        this.value === other.value :
        false;
}