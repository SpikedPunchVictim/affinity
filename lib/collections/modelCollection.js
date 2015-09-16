var Emitter = require('../eventEmitter.js');
var CommonCollection = require('./commonCollection.js');
var Model = require('../model.js');

module.exports = ModelCollection;

function ModelCollection(namespace) {
    Emitter.mixin(this);
    CommonCollection.mixin(this);

    this.namespace = namespace;

    Object.defineProperty(this, 'context', {
        get: function() {
            return this.namespace.context;
        }
    });

    this._onItemsAdding = function(items) {
        this.context.project.emit(ModelCollection.events.adding, items);
        this.emit(ModelCollection.events.adding, items)
    }

    this._onItemsAdded= function(items) {
        this.context.project.emit(ModelCollection.events.added, items);
        this.emit(ModelCollection.events.added, items)
    }
    
    this._onItemsRemoving = function(items) {
        this.context.project.emit(ModelCollection.events.removing, items);
        this.emit(ModelCollection.events.removing, items)
    }
    
    this._onItemsRemoved = function(items) {
        this.context.project.emit(ModelCollection.events.removed, items);
        this.emit(ModelCollection.events.removed, items)
    }
}

//------------------------------------------------------------------------
// List of supported events
ModelCollection.events = {
    adding: 'model-adding',
    added: 'model-added',
    removing: 'model-removing',
    removed: 'model-removed'
}

//------------------------------------------------------------------------
ModelCollection.prototype.add = function add(name) {
    var model = new Model(name, this.namespace);
    var items = [{item: model, index: this._items.length}];

    this._onAdding(items);
    this._items.add(model);
    this._onAdded(items);
    return model;
}

//------------------------------------------------------------------------
ModelCollection.prototype.remove = function remove(model) {
    if(_.isString(model)) {
        // Remove by name
        model = _.find(this._items, function(item, index) { return item.name === model; });
    } else if(model instanceof Model) {
        model = _.find(this._items, function(item, index) { return _.isEqual(model, item); });
    }

    if(_.isNull(model) || _.isUndefined(model)) {
        return false;
    }

    var items = [{item: model, index: this._items.length}];
    this._onRemoving(items);
    this._items.remove(model);
    this._onRemoved(items);
    return true;
}