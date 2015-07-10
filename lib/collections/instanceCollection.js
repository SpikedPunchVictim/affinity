module.exports = InstanceCollection;

var util = require('util');
var utility = require('../utility.js');
var EventEmitter = require('events').EventEmitter;
var ObservableCollection = require('./observableCollection.js');
var Instance = require('../instance.js');

function InstanceCollection(namespace) {
    this._namespace = namespace;

    this._items = new ObservableCollection();
    utility.forward(this._items, this);
}

util.inherits(InstanceCollection, EventEmitter);

InstanceCollection.prototype.add = function add(name, model) {
    var instance = new Instance(name, this._namespace, model);
    this._items.add(instance);
    return instance;
}

InstanceCollection.prototype.remove = function remove(instance) {
    return this._items.remove(instance);
}