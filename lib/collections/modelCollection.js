module.exports = ModelCollection;

var util = require('util');
var utility = require('../utility.js');
var EventEmitter = require('events').EventEmitter;
var ObservableCollection = require('./observableCollection.js');
var Model = require('../model.js');

function ModelCollection(namespace) {
    this.namespace = namespace;
    
    this._items = new ObservableCollection();
    utility.forward(this._items, this);
}

util.inherits(ModelCollection, EventEmitter);

ModelCollection.prototype.add = function add(name) {
    var model = new Model(name, this.namespace);

    this.namespace.context.project.emit('model-adding', { model: model });
    this._items.add(model);
    this.namespace.context.project.emit('model-added', { model: model });
    return model;
}

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