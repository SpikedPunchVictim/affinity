'use strict';

var NamedCollection = require('./namedCollection.js');
var Events = require('../events.js');

class NamespaceCollection extends NamedCollection {
    constructor(namespace) {
        super();
        this._namespace = namespace;
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
        var nspace = new Namespace(name, this._namespace, this.context);
        this._add([{ item: nspace, index: this._items.length }]);
        return nspace;
    }

    // Centralizing emitting events
    _emitEvent() {
        var args = [];
        for(var i = 0; i < arguments.length; ++i) {
            args[i] = arguments[i];
        }

        this.context.project.emit.apply(this.context.project, args);
        this.emit.apply(this, args);
    }

    _onAdding(items) {
        this._onValidateAdding(items);
        this._emitEvent(Events.namespaceCollection.adding, items);
    }
    _onAdded(items) {
        this._emitEvent(Events.namespaceCollection.added, items);
    }
    _onRemoving(items) {
        this._emitEvent(Events.namespaceCollection.removing, items);
    }
    _onRemoved(items) {
        this._emitEvent(Events.namespaceCollection.removed, items);
    }
    _onMoving(items) {
        this._emitEvent(Events.namespaceCollection.moving, items);
    }
    _onMoved(items) {
        this._emitEvent(Events.namespaceCollection.moved, items);
    }
    _onValidateAdding(items) {
        // Blank
    }
}

module.exports = NamespaceCollection;