module.exports = ModelCollection;

var util = require('util');
var utility = require('../utility.js');
var EventEmitter = require('events').EventEmitter;
var ObservableCollection = require('./observableCollection.js');
var Model = require('../model.js');

function ModelCollection(parent) {
    this._parent = parent;

    this._items = new ObservableCollection();
    utility.forward(this._items, this);
}

util.inherits(ModelCollection, EventEmitter);

ModelCollection.prototype.add = function add(name) {
    var model = new Model(name, this._parent);
    this._items.add(model);
    return model;
}

ModelCollection.prototype.remove = function remove(model) {
    return this._items.remove(model);
}