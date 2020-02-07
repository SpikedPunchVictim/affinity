'use strict';

var NamedCollection = require('./namedCollection.js');
var Events = require('../events.js');

class NamespaceCollection extends NamedCollection {
    constructor(namespace) {
        super();
        this._namespace = namespace;
        this.context.eventRouter.join(this)
    }

    get context() {
        return this._namespace.context;
    }
    
    get namespace() {
        return this._namespace;
    }

    new(name) {
        // Since these collections are both factories and collections,
        // we require the modules where we need them
        var Namespace = require('../namespace.js');
        
        if(this.findByName(name) != null) {
            throw new Error('Namespace name already exists. Namespaces must be unique.');
        }

        var nspace = new Namespace(name, this._namespace, this.context);
        this._add([{ item: nspace, index: this._items.length }]);
        return nspace;
    }

    /*
    * Gets or adds the specified namespace by name
    *
    * @param {string} name The Namespace's name
    * @return {Namespace} The Namespace with the specified name
    */
    getOrAdd(name) {
        let found = this.findByName(name);
        if(found == null) {
            return this.new(name);
        }

        return found;
    }

    _onAdding(items) {
        this._onValidateAdding(items);
        this.emit(Events.namespaceCollection.adding, items);
    }
    _onAdded(items) {
        this.emit(Events.namespaceCollection.added, items);
    }
    _onRemoving(items) {
        this.emit(Events.namespaceCollection.removing, items);
    }
    _onRemoved(items) {
        this.emit(Events.namespaceCollection.removed, items);
    }
    _onMoving(items) {
        this.emit(Events.namespaceCollection.moving, items);
    }
    _onMoved(items) {
        this.emit(Events.namespaceCollection.moved, items);
    }
    _onValidateAdding(items) {
        // Blank
    }
}

module.exports = NamespaceCollection;