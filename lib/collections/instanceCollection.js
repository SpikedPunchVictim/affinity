module.exports = InstanceCollection;

var _ = require('lodash');
var Emitter = require('../eventEmitter');
var CommonCollection = require('./commonCollection.js');
var Instance = require('../instance.js');

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