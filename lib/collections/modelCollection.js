'use strict';

var NamedCollection = require('./namedCollection.js');
var Model = require('../model.js');

var events = {
    adding: 'model-adding',
    added: 'model-added',
    moving: 'model-moving',
    moved: 'model-moved',
    removing: 'model-removing',
    removed: 'model-removed'
}

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
        var model = new Model(name, this.namespace);
        this._add([{ item: model, index: this.length }]);
        return model;
    }

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

exports.ModelCollection = ModelCollection;
exports.events = events;

// function ModelCollection(namespace) {
//     Emitter.mixin(this);
//     CommonCollection.mixin(this);

//     this.namespace = namespace;

//     Object.defineProperty(this, 'context', {
//         get: function() {
//             return this.namespace.context;
//         }
//     });

//     this._onItemsAdding = function(items) {
//         this.context.project.emit(ModelCollection.events.adding, items);
//         this.emit(ModelCollection.events.adding, items)
//     }

//     this._onItemsAdded= function(items) {
//         this.context.project.emit(ModelCollection.events.added, items);
//         this.emit(ModelCollection.events.added, items)
//     }
    
//     this._onItemsRemoving = function(items) {
//         this.context.project.emit(ModelCollection.events.removing, items);
//         this.emit(ModelCollection.events.removing, items)
//     }
    
//     this._onItemsRemoved = function(items) {
//         this.context.project.emit(ModelCollection.events.removed, items);
//         this.emit(ModelCollection.events.removed, items)
//     }
// }

// //------------------------------------------------------------------------
// // List of supported events
// ModelCollection.events = {
//     adding: 'model-adding',
//     added: 'model-added',
//     removing: 'model-removing',
//     removed: 'model-removed'
// }

// //------------------------------------------------------------------------
// ModelCollection.prototype.add = function add(name) {
//     var model = new Model(name, this.namespace);
//     var items = [{item: model, index: this._items.length}];

//     this._onAdding(items);
//     this._items.add(model);
//     this._onAdded(items);
//     return model;
// }

// //------------------------------------------------------------------------
// ModelCollection.prototype.remove = function remove(model) {
//     if(_.isString(model)) {
//         // Remove by name
//         model = _.find(this._items, function(item, index) { return item.name === model; });
//     } else if(model instanceof Model) {
//         model = _.find(this._items, function(item, index) { return _.isEqual(model, item); });
//     }

//     if(_.isNull(model) || _.isUndefined(model)) {
//         return false;
//     }

//     var items = [{item: model, index: this._items.length}];
//     this._onRemoving(items);
//     this._items.remove(model);
//     this._onRemoved(items);
//     return true;
// }