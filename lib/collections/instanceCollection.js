module.exports = InstanceCollection;

var util = require('util');
var _ = require('lodash');
var utility = require('../utility.js');
var EventEmitter = require('events').EventEmitter;
var ObservableCollection = require('./observableCollection.js');
var Instance = require('../instance.js');

function InstanceCollection(namespace) {
    this.namespace = namespace;

    this._items = new ObservableCollection();
    utility.forward(this._items, this);
}

util.inherits(InstanceCollection, EventEmitter);

InstanceCollection.prototype.add = function add(name, model) {    
    var instance = new Instance(name, this.namespace, model);
    this.namespace.context.project.emit('instance-adding', { model: model, instance: instance });
    this._items.add(instance);
    this.namespace.context.project.emit('instance-added', { model: model, instance: instance });

    return instance;
}

InstanceCollection.prototype.remove = function remove(instance) {
    if(_.isString(instance)) {
        // Remove by name
        instance = _.find(this._items, function(item) { return item.name === instance; });
    } else if(instance instanceof Instance) {
        instance = _.find(this._items, function(item) { return _.isEqual(instance, item); });
    }

    if(_.isNull(instance) || _.isUndefined(instance)) {
        return false;
    }

    this.namespace.context.project.emit('instance-removing', { model: model, instance: instance });
    this._items.remove(instance);
    this.namespace.context.project.emit('instance-removed', { model: model, instance: instance });
}