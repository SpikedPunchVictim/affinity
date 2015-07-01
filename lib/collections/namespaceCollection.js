module.exports = NamespaceCollection;

var util = require('util');
var utility = require('../utility.js');
var EventEmitter = require('events').EventEmitter;
var ObservableCollection = require('./observableCollection.js');
var Namespace = require('../namespace.js');

function NamespaceCollection(parent) {
    this._parent = parent;

    this._items = new ObservableCollection();
    utility.forward(this._items, this);
}

util.inherits(NamespaceCollection, EventEmitter);

NamespaceCollection.prototype.add = function add(name) {
    var namespace = new Namespace(name, this._parent);
    this._items.add(namespace);
    return namespace;
}

NamespaceCollection.prototype.remove = function remove(namespace) {
    return this._items.remove(namespace);
}