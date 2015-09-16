// Due to how things are imported through require, this needs to go at the top
module.exports = NamespaceCollection;

var _ = require('lodash');
var Emitter = require('../eventEmitter.js');
var CommonCollection = require('./commonCollection.js');
var Namespace = require('../namespace.js');

//------------------------------------------------------------------------
function NamespaceCollection(namespace) {
    Emitter.mixin(this);
    CommonCollection.mixin(this);

    this.namespace = namespace;

    Object.defineProperty(this, 'context', {
        get: function() {
            return this.namespace.context;
        }
    });

    this._onItemsAdding = function(items) {
        this.context.project.emit(NamespaceCollection.events.adding, items);
        this.emit(NamespaceCollection.events.adding, items)
    }

    this._onItemsAdded= function(items) {
        this.context.project.emit(NamespaceCollection.events.added, items);
        this.emit(NamespaceCollection.events.added, items)
    }
    
    this._onItemsRemoving = function(items) {
        this.context.project.emit(NamespaceCollection.events.removing, items);
        this.emit(NamespaceCollection.events.removing, items)
    }
    
    this._onItemsRemoved = function(items) {
        this.context.project.emit(NamespaceCollection.events.removed, items);
        this.emit(NamespaceCollection.events.removed, items)
    }
}

//------------------------------------------------------------------------
// List of supported events
NamespaceCollection.events = {
    adding: 'namespace-adding',
    added: 'namespace-added',
    removing: 'namespace-removing',
    removed: 'namespace-removed',
}

//------------------------------------------------------------------------
NamespaceCollection.prototype.add = function add(name) {
    var namespace = new Namespace(name, this.namespace, this.namespace.context);
    var items = [{ item: namespace, index: this._items.length }];

    this._onAdding(items);
    this._items.add(namespace);
    this._onAdded(items);
    return namespace;
}

//------------------------------------------------------------------------
NamespaceCollection.prototype.indexByName = function indexByName(name) {
    if(!_.isString(name)) {
        throw new Error('NamespaceCollection::indexByName expects a string argument');
    }

    for(var i = 0; i < this.length; ++i) {
        var current = this._items.at(i);
        if(current.name === name) {
            return i;
        }
    }
}