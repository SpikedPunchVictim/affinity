'use strict';

var NamedCollection = require('./namedCollection.js');
var Model = require('../model.js');
var Events = require('../events.js');

class ModelCollection extends NamedCollection {
    constructor(namespace) {
        super();
        this._namespace = namespace;
    }

    get namespace() {
        return this._namespace;
    }

    get context() {
        return this.namespace.context;
    }

    new(name) {
        var model = new Model(name, this._namespace);
        this._add([{ item: model, index: this.length }]);
        return model;
    }

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
        this._emitEvent(Events.modelCollection.adding, items);
    }
    _onAdded(items) {
        this._emitEvent(Events.modelCollection.added, items);
    }
    _onRemoving(items) {
        this._emitEvent(Events.modelCollection.removing, items);
    }
    _onRemoved(items) {
        this._emitEvent(Events.modelCollection.removed, items);
    }
    _onMoving(items) {
        this._emitEvent(Events.modelCollection.moving, items);
    }
    _onMoved(items) {
        this._emitEvent(Events.modelCollection.moved, items);
    }
    _onValidateAdding(items) {
        // Blank
    }
}

module.exports = ModelCollection;