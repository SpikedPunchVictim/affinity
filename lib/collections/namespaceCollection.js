// Due to how things are imported through require, this needs to go at the top
module.exports = NamespaceCollection;

var util = require('util');
var _ = require('lodash');
var utility = require('../utility.js');
var EventEmitter = require('events').EventEmitter;
var ObservableCollection = require('./observableCollection.js');
var CommonCollection = require('./commonCollection.js');
var Namespace = require('../namespace.js');

//------------------------------------------------------------------------
function NamespaceCollection(namespace) {
    EventEmitter.call(this);

    this.namespace = namespace;

    this._items = new ObservableCollection();
    utility.forward(this._items, this);

    Object.defineProperty(this, 'context', {
        get: function() {
            return this.namespace.context;
        }
    });

    CommonCollection.mixin(this, {
        addingevent: NamespaceCollection.events.adding,
        addedEvent: NamespaceCollection.events.added,
        removingEvent: NamespaceCollection.events.removing,
        removedEvent: NamespaceCollection.events.removed,
        globalEmitter: this.context.project
    });
}

util.inherits(NamespaceCollection, EventEmitter);

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