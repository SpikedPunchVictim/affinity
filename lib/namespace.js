'use strict';

var QualifiedObject = require('./qualifiedObject.js');
var NamespaceCollection = require('./collections/namespaceCollection.js');
var ModelCollection = require('./collections/modelCollection.js');
var InstanceCollection = require('./collections/instanceCollection.js');
var Events = require('./events.js');

class Namespace extends QualifiedObject {
    constructor(name, parent, context) {
        super(name, parent);
        this._context = context;

        this._children = new NamespaceCollection(this);
        this._models = new ModelCollection(this);
        this._instances = new InstanceCollection(this);
        
        // Subscribe/forward events
        var self = this;
        this._childrenSub = this._children.sub([
          { event: Events.namespaceCollection.adding, handler: items => self._emitEvent(Events.namespace.childAdding, items) },
          { event: Events.namespaceCollection.added, handler: items => self._emitEvent(Events.namespace.childAdded, items) },
          { event: Events.namespaceCollection.moving, handler: items => self._emitEvent(Events.namespace.childMoving, items) },
          { event: Events.namespaceCollection.moved, handler: items => self._emitEvent(Events.namespace.childMoved, items) },
          { event: Events.namespaceCollection.removing, handler: items => self._emitEvent(Events.namespace.childRemoving, items) },
          { event: Events.namespaceCollection.removed, handler: items => {
                // TODO: Handle namespace item disposing (centrally?)
                self._disposeRemoved(items);
                self._emitEvent(Events.namespace.childRemoved, items);
              }
          }]
        );
        
        this._modelSub = this._models.sub([
          { event: Events.modelCollection.adding, handler: items => self._emitEvent(Events.namespace.modelAdding, items) },
          { event: Events.modelCollection.added, handler: items => self._emitEvent(Events.namespace.modelAdded, items) },
          { event: Events.modelCollection.moving, handler: items => self._emitEvent(Events.namespace.modelMoving, items) },
          { event: Events.modelCollection.moved, handler: items => self._emitEvent(Events.namespace.modelMoved, items) },
          { event: Events.modelCollection.removing, handler: items => self._emitEvent(Events.namespace.modelRemoving, items) },
          { event: Events.modelCollection.removed, handler: items => {
                self._disposeRemoved(items);
                self._emitEvent(Events.namespace.modelRemoved, items);
              }
          }]
        );
        
        this._instancesSub = this._instances.sub([
          { event: Events.instanceCollection.adding, handler: items => self._emitEvent(Events.namespace.instanceAdding, items) },
          { event: Events.instanceCollection.added, handler: items => self._emitEvent(Events.namespace.instanceAdded, items) },
          { event: Events.instanceCollection.moving, handler: items => self._emitEvent(Events.namespace.instanceMoving, items) },
          { event: Events.instanceCollection.moved, handler: items => self._emitEvent(Events.namespace.instanceMoved, items) },
          { event: Events.instanceCollection.removing, handler: items => self._emitEvent(Events.namespace.instanceRemoving, items) },
          { event: Events.instanceCollection.removed, handler: items => {
                self._disposeRemoved(items);
                self._emitEvent(Events.namespace.instanceRemoved, items);
              }
          }]
        );
    }
    
    dispose() {
        this._emitEvent(Events.disposing, { source: this });
        this._childrenSub.off();
        this._modelSub.off();
        this._instancesSub.off();
        this._emitEvent(Events.disposed, { source: this });
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
    
    get root() {
        var current = this.parent;

        if(current == null) {
            return this;
        }

        while(current != null) {
            if(current.parent == null) {
                break;
            }
            
            current = current.parent;
        }
        
        return current;
    }
    
    // Provided a starting namespace, will search for the relative
    // ancestor from a qualifiedName
    static findRelative(startNamespace, qualifiedName) {        
        // current is the root at this point
        var tokens = qualifiedName.split('.');

        if(tokens.length == 1 && tokens[0] === startNamespace.name) {
            return startNamespace;
        }

        var current = startNamespace;
        for(var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            current = current.children.findByName(token);

            if(current == null) {
                return null;
            }
        }
        
        return current;
    }

    /*
    * From the root, will build out the specified qualified
    * path. This will add Namespaces where they don't exist,
    * and ignore the ones that do.
    *
    * @param {string} qualifiedName The qualified name of the resulting Namespace
    * @return {Namespace} Returns the Namespace created (matching the qualified name)
    */
    expand(qualifiedName) {
        let tokens = qualifiedName.split('.');
        
        let current = this.root;
        tokens.forEach(token => {
            current = current.children.getOrAdd(token);
        });
        return current;
    }
    
    _emitEvent() {
        var args = [];
        for(var i = 0; i < arguments.length; ++i) {
            args[i] = arguments[i];
        }        
        
        this.context.project.emit.apply(this.context.project, args);
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
        
        this._emitEvent(Events.namespace.childRemoved, items);
    }
    
    _onModelRemoved(items) {
     
        this._emitEvent(Events.namespace.modelRemoved, items);   
    }
    
    _onInstanceRemoved(items) {
        
        this._emitEvent(Events.namespace.instanceRemoved, items);
    }
}

module.exports = Namespace;