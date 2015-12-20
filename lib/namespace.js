'use strict';

var QualifiedObject = require('./qualifiedObject.js');
var Collections = require('./collections/index.js');
var NamespaceCollection = Collections.NamespaceCollection;
var ModelCollection = Collections.ModelCollection;
var InstanceCollection = Collections.InstanceCollection;

class Namespace extends QualifiedObject {
    constructor(name, parent, context) {
        super(name, parent);
        this._context = context;

        this._children = new NamespaceCollection(this);
        this._models = new ModelCollection(this);
        this._instances = new InstanceCollection(this);
    }

    get context() {
        return this._context;
    }

    get children() {
        return this._children;
    }

    get models() {
        return this._models;
    }
}

//------------------------------------------------------------------------
function Namespace(name, parent, context) {
    Emitter.mixin(this);
    QualifiedObject.mixin(this);

    this._name = name;      // NamedObject
    this._namespace = parent;  // QualifiedObject
    this.context = context || parent.context;
    this.children = new NamespaceCollection(this);
    this.models = new ModelCollection(this);
    this.instances = new InstanceCollection(this);

    this.models.on('model-removed', function(items) {
        for(var i = 0; i < items.length; ++i) {
            items[i].dispose();
        }
    });

    this.instances.on('instance-removed', function(items) {
        for(var i = 0; i < items.length; ++i) {
            items[i].dispose();
        }
    });
}

//------------------------------------------------------------------------
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

module.exports = Namespace;