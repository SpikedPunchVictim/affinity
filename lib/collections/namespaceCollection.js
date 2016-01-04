'use strict';

var NamedCollection = require('./namedCollection.js');
var Namespace = require('../namespace.js');

var events = {
    adding: 'namespace-adding',
    added: 'namespace-added',
    removing: 'namespace-removing',
    removed: 'namespace-removed',
}

class NamespaceCollection extends NamedCollection {
    constructor(namespace) {
        super();
    }

    get context() {
        return this.namespace.context;
    }

    addNamespace(name) {
        var nspace = new Namespace(name, this.namespace);
        var change = [{
            item: nspace,
            index: this._items.length
        }];

        this._onAdding(change);
        this._items.push(nspace);
        this._onAdded(change);

        return nspace;
    }

    // Centralizing emitting events
    _emitEvent() {
        var args = [];
        for(var i = 0; i < arguments.length; ++i) {
            args[i] = arguments[i];
        }

        this.context.project.emit.apply(this, args);
        this.emit.apply(this, args);
    }

    _onAdding(items) {
        this._onValidateAdding(items);
        this._emitEvent(events.adding, items);
    }
    _onAdded(items) {
        this._emitEvent(events.added, items);
    }
    _onRemoving(items) {
        this._emitEvent(events.removing, items);
    }
    _onRemoved(items) {
        this._emitEvent(events.removed, items);
    }
    _onMoving(items) {
        this._emitEvent(events.moving, items);
    }
    _onMoved(items) {
        this._emitEvent(events.moved, items);
    }
    _onValidateAdding(items) {
        // Blank
    }
}

exports = {
    NamespaceCollection: NamespaceCollection,
    events: events
}