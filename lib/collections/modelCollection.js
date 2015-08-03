module.exports = ModelCollection;

var util = require('util');
var utility = require('../utility.js');
var EventEmitter = require('../eventEmitter.js');
var ObservableCollection = require('./observableCollection.js');
var CommonCollection = require('./commonCollection.js');
var Model = require('../model.js');

function ModelCollection(namespace) {
    EventEmitter.mixin(this);

    this.namespace = namespace;
    
    this._items = new ObservableCollection();
    utility.forward(this._items, this);

    Object.defineProperty(this, 'context', {
        get: function() {
            return this.namespace.context;
        }
    });

    CommonCollection.mixin(this, {
        addingevent: 'model-adding',
        addedEvent: 'model-added',
        removingEvent: 'model-removing',
        removedEvent: 'model-removed',
        globalEmitter: this.context.project
    });
}

//------------------------------------------------------------------------
ModelCollection.prototype.add = function add(name) {
    var model = new Model(name, this.namespace);

    this.namespace.context.project.emit('model-adding', { model: model });
    this._items.add(model);
    this.namespace.context.project.emit('model-added', { model: model });
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

    this.namespace.context.project.emit('model-removing', { model: model });
    this._items.remove(model);
    this.namespace.context.project.emit('model-removed', { model: model });
    return true;
}