module.exports = InstanceCollection;

var util = require('util');
var _ = require('lodash');
var utility = require('../utility.js');
var EventEmitter = require('events').EventEmitter;
var ObservableCollection = require('./observableCollection.js');
var CommonCollection = require('./commonCollection.js');
var Instance = require('../instance.js');

function InstanceCollection(namespace) {
    EventEmitter.call(this);

    this.namespace = namespace;

    this._items = new ObservableCollection();
    utility.forward(this._items, this);

    Object.defineProperty(this, 'context', {
        get: function() {
            return this.namespace.context;
        }
    });

    CommonCollection.mixin(this, {
        addingevent: 'instance-adding',
        addedEvent: 'instance-added',
        removingEvent: 'instance-removing',
        removedEvent: 'instance-removed',
        globalEmitter: this.context.project
    });    
}

util.inherits(InstanceCollection, EventEmitter);

InstanceCollection.prototype.add = function add(name, model) {    
    var instance = new Instance(name, this.namespace, model);
    var items = [{ item: instance, index: this._items.length }];

    this._onAdding(items);
    this._items.add(instance);
    this._onAdded(items);

    return instance;
}