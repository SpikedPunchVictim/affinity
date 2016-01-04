'use strict';

var Instance = require('../instance.js');
var NamedCollection = require('./collections/namedCollection.js');

var events = {
    adding: 'instance-adding',
    added: 'instance-added',
    moving: 'instance-moving',
    moved: 'instance-moved',
    removing: 'instance-removing',
    removed: 'instance-removed'
}

class InstanceCollection extends NamedCollection {
    constructor(namespace) {
        super();

        this._namespace = namespace;
    }

    get context() {
        return this._namespace.context;
    }

    _emitEvent() {
        var args = [];
        for(var i = 0; i < arguments.length; ++i) {
            args[i] = arguments[i];
        }

        this.context.project.emit.apply(this, args);
        this.emit.apply(this, args);
    }
    
    add() {
        var instance = new Instance(name, this.namespace, model);
        var items = [{ item: instance, index: this._items.length }];

        this._onAdding(items);
        this._items.add(instance);
        this._onAdded(items);

        return instance;
    }

    _onAdding(items) {
        this._onValidateAdding(items);
        this._emitEvent(events.adding, items);
    }
    _onAdded(items) {
        this._emitEvent(events.added, items);
    }
    _onRemoving(items) {
        this._emitEvent(events.removing, items);
    }
    _onRemoved(items) {
        this._emitEvent(events.removed, items);
    }
    _onMoving(items) {
        this._emitEvent(events.moving, items);
    }
    _onMoved(items) {
        this._emitEvent(events.moved, items);
    }
}

exports = {
    InstanceCollection: InstanceCollection,
    events: events
}

/*
function InstanceCollection(namespace) {
    Emitter.mixin(this);
    CommonCollection.mixin(this);

    this.namespace = namespace;

    Object.defineProperty(this, 'context', {
        get: function() {
            return this.namespace.context;
        }
    });

    this._onItemsAdding = function(items) {
        this.context.project.emit(InstanceCollection.events.adding, items);
        this.emit(InstanceCollection.events.adding, items)
    }

    this._onItemsAdded= function(items) {
        this.context.project.emit(InstanceCollection.events.added, items);
        this.emit(InstanceCollection.events.added, items)
    }
    
    this._onItemsRemoving = function(items) {
        this.context.project.emit(InstanceCollection.events.removing, items);
        this.emit(InstanceCollection.events.removing, items)
    }
    
    this._onItemsRemoved = function(items) {
        this.context.project.emit(InstanceCollection.events.removed, items);
        this.emit(InstanceCollection.events.removed, items)
    } 
}

//------------------------------------------------------------------------
// List of supported events
InstanceCollection.events = {
    adding: 'instance-adding',
    added: 'instance-added',
    removing: 'instance-removing',
    removed: 'instance-removed'
}

//------------------------------------------------------------------------
InstanceCollection.prototype.add = function add(name, model) {    
    var instance = new Instance(name, this.namespace, model);
    var items = [{ item: instance, index: this._items.length }];

    this._onAdding(items);
    this._items.add(instance);
    this._onAdded(items);

    return instance;
}
*/