var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = Instance;

function Instance(name, nspace, model) {
    if(model == null) {
        throw new Error(util.format('model must be valid when creating an instance (name: %s)',name));
    }

    EventEmitter.call(this);
    QualifiedObject.mixin(this, name, nspace);

    this._fields = new MemberCollection();
    this._model = model;

    Object.defineProperty(this, 'fields', {
        get: function() {
            return this._fields;
        }
    });

    Object.defineProperty(this, 'model', {
        get: function() {
            return this._model;
        }
    });

    for(var index in model.fields) {
        var field = model.fields[index];
    }
}

util.inherits(Instance, EventEmitter);