module.exports = Namespace;

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var QualifiedObject = require('./qualifiedObject.js');
var NamespaceCollection = require('./collections/namespaceCollection.js');

function Namespace(name, parent) {
    QualifiedObject.mixin(this);
    this._parent = parent;
    this._name = name;
    this._children = new NamespaceCollection(parent);
}

util.inherits(Namespace, EventEmitter);