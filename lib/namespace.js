module.exports = Namespace;

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var QualifiedObject = require('./qualifiedObject.js');
var NamespaceCollection = require('./collections/namespaceCollection.js');
var ModelCollection = require('./collections/modelCollection.js');
var InstanceCollection = require('./collections/instanceCollection.js');


function Namespace(name, parent, context) {
    QualifiedObject.mixin(this);

    this._name = name;      // NamedObject
    this._parent = parent;  // QualifiedObject
    this.context = context;
    this.children = new NamespaceCollection(this);
    this.models = new ModelCollection(this);
    this.instances = new InstanceCollection(this);
}

util.inherits(Namespace, EventEmitter);

Namespace.prototype.find = function find(qualifiedName) {
    var current = this.parent;

    while(current != null) {
        current = current.parent;
    }
    
    // current is the root at this point
    var tokens = qualifiedName.split('.');
    for(var i = 0; tokens.length; i++) {
        var token = tokens[i];
        current = current.children.find(token);

        if(current == null) {
            return null;
        }
    }

    return current;
}

// TODO: Validate the parent doesn't exist already in the hierarchy for circular reference detection
// Inherited from QualifiedObject when the underlying parent changes
Namespace.prototype._onParentChanged = function _onParentChanged(change) {
    this.children.namespace = value;
    this.models.namespace = value;
    this.instances.namespace = value;
}