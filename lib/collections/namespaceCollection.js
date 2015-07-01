module.exports = NamespaceCollection;

var util = require('util');
var ObservableCollection = require('./observableCollection.js');
var Namespace = require('../namespace.js');

function NamespaceCollection(parent) {
    ObservableCollection.call(this);
    this._parent = parent;
}

util.inherits(NamespaceCollection, ObservableCollection);

NamespaceCollection.prototype.add = function add(name) {
    var namespace = new Namespace(name, this._parent);
    this.add(namespace);
    return namespace;
}