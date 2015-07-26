var util = require('util');
var EventEmitter = require('events').EventEmitter
var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');

module.exports = Model;

function Model(name, nspace) {
    EventEmitter.call(this);
    QualifiedObject.mixin(this, name, nspace);
    this._name = name;
    this._nspace = nspace;

    Object.defineProperty(this, 'namespace', {
        get: function() {
            return this._nspace;
        }
    });

    this.members = new MemberCollection(this);

    this.members.on('items-adding', function(items) {
        var adding = { members: items, model: this };
        var model = this.model;
        model._nspace.context.project.emit('members-adding', adding);
        model.emit('members-adding', adding);
    });

    this.members.on('items-added', function(items) {
        var added = { members: items, model: this };
        var model = this.model;
        model._nspace.context.project.emit('members-added', added);
        model.emit('members-added', added);
    });

    this.members.on('items-removing', function(items) {
        var removing = { members: items, model: this };
        var model = this.model;
        model._nspace.context.project.emit('members-removing', removing);
        model.emit('members-removing', removing);
    });

    this.members.on('items-removed', function(items) {
        var removed = { members: items, model: this };
        var model = this.model;
        model._nspace.context.project.emit('members-removed', removed);
        model.emit('members-removed', removed);
    });
}

util.inherits(Model, EventEmitter);