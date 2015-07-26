var EventEmitter = require('events').EventEmitter;
var util = require('util');
var NamedObject = require('./namedObject.js');

module.exports = ModelMember;

function ModelMember(model, name, value) {
    NamedObject.mixin(this);
    this.model = model;
    this._name = name;
    this.value = value;    

    Object.defineProperty(this, 'type', {
        get: function() {
            return this.value.type;
        }
    });
}

util.inherits(ModelMember, EventEmitter);