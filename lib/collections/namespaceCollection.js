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
        addingevent: 'namespace-adding',
        addedEvent: 'namespace-added',
        removingEvent: 'namespace-removing',
        removedEvent: 'namespace-removed',
        globalEmitter: this.context.project
    });
}

util.inherits(NamespaceCollection, EventEmitter);

//------------------------------------------------------------------------
NamespaceCollection.prototype.add = function add(name) {
    var namespace = new Namespace(name, this.namespace, this.namespace.context);
    var items = [{ item: namespace, index: this._items.length }];

    this._onAdding(items);
    this._items.add(namespace);
    this._onAdded(items);
    return namespace;
}