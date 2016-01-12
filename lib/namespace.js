'use strict';

var QualifiedObject = require('./qualifiedObject.js');
var NamespaceCollection = require('./collections/namespaceCollection.js');
var ModelCollection = require('./collections/modelCollection.js');
var InstanceCollection = require('./collections/instanceCollection.js');

var events = {
    childAdding: 'namespace-child-adding',
    childAdded: 'namespace-child-added',
    childRemoving: 'namespace-child-removing',
    childRemoved: 'namespace-child-removed',
    modelAdding: 'namespace-model-adding',
    modelAdded: 'namespace-model-added',
    modelRemoving: 'namespace-model-removing',
    modelRemoved: 'namespace-model-removed',
    instanceAdding: 'namespace-instance-adding',
    instanceAdded: 'namespace-instance-added',
    instanceRemoving: 'namespace-instance-removing',
    instanceRemoved: 'namespace-instance-removed'
};

class Namespace extends QualifiedObject {
    constructor(name, parent, context) {
        super(name, parent);
        this._context = context;

        this._children = new NamespaceCollection.NamespaceCollection(this);
        this._models = new ModelCollection.ModelCollection(this);
        this._instances = new InstanceCollection.InstanceCollection(this);
        
        // Subscribe/forward events
        var self = this;
        this._cildrenSub = this._children.sub([
          { event: NamespaceCollection.events.adding, handler: items => self._emitEvent(events.childAdding, items) },
          { event: NamespaceCollection.events.added, handler: items => self._emitEvent(events.childAdded, items) },
          { event: NamespaceCollection.events.removing, handler: items => self._emitEvent(events.childRemoving, items) },
          { event: NamespaceCollection.events.removed, handler: items => {
              // TODO: Handle namespace item disposing (centrally?)
                self._disposeRemoved(items);
                self._emitEvent(events.childRemoved, items);
              }
          }]
        );
        
        this._modelSub = this._models.sub([
          { event: ModelCollection.events.adding, handler: items => self._emitEvent(events.modelAdding, items) },
          { event: ModelCollection.events.added, handler: items => self._emitEvent(events.modelAdded, items) },
          { event: ModelCollection.events.removing, handler: items => self._emitEvent(events.modelRemoving, items) },
          { event: ModelCollection.events.removed, handler: items => {
                self._disposeRemoved(items);
                self._emitEvent(events.modelRemoved, items);
              }
          }]
        );
        
        this._instancesSub = this._instances.sub([
          { event: InstanceCollection.events.adding, handler: items => self._emitEvent(events.instanceAdding, items) },
          { event: InstanceCollection.events.added, handler: items => self._emitEvent(events.instanceAdded, items) },
          { event: InstanceCollection.events.removing, handler: items => self._emitEvent(events.instanceRemoving, items) },
          { event: InstanceCollection.events.removed, handler: items => {
                self._disposeRemoved(items);
                self._emitEvent(events.instanceRemoved, items);
              }
          }]
        );
    }
    
    dispose() {
        this._childrenSub.off();
        this._modelSub.off();
        this._instancesSub.off();
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
    
    get instances() {
        return this._instances;
    }
    
    get qualifiedObjects() {
        return this._qualifiedObjects;
    }
    
    find(qualifiedName) {
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
    
    _emitEvent() {
        var args = [];
        for(var i = 0; i < arguments.length; ++i) {
            args[i] = arguments[i];
        }        
        
        this.context.project.emit.apply(this, args);
        this.emit.apply(this, args);
    }
    
    _disposeRemoved(items) {
        items.forEach(it => {
            it.item.dispose();
        });
    }
    
    _onNamespaceRemoved(items) {
        items.forEach(it => {
            it.item.dispose();
        });
        
        this._emitEvent(events.childRemoved, items);
    }
    
    _onModelRemoved(items) {
     
        this._emitEvent(events.modelRemoved, items);   
    }
    
    _onInstanceRemoved(items) {
        
        this._emitEvent(events.instanceRemoved, items);
    }
}

exports.Namespace = Namespace;
exports.events = events;

/*
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
*/