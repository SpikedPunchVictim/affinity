var util = require('util');
var utility = require('../utility.js');
var Emitter = require('../eventEmitter.js');
var ObservableCollection = require('./observableCollection.js');
var CommonCollection = require('./commonCollection.js');
var Model = require('../model.js');

module.exports = ModelCollection;

function ModelCollection(namespace) {
    Emitter.mixin(this);

    this.namespace = namespace;
    
    this._items = new ObservableCollection();
    utility.forward(this._items, this);

    Object.defineProperty(this, 'context', {
        get: function() {
            return this.namespace.context;
        }
    });

    CommonCollection.mixin(this, {
        addingevent: ModelCollection.events.adding,
        addedEvent: ModelCollection.events.added,
        removingEvent: ModelCollection.events.removing,
        removedEvent: ModelCollection.events.removed,
        globalEmitter: this.context.project
    });
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

    this.namespace.context.project.emit(ModelCollection.events.adding, { model: model });
    this._items.add(model);
    this.namespace.context.project.emit(ModelCollection.events.added, { model: model });
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

    this.namespace.context.project.emit(ModelCollection.events.removing, { model: model });
    this._items.remove(model);
    this.namespace.context.project.emit(ModelCollection.events.removed, { model: model });
    return true;
}