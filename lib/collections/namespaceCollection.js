module.exports = NamespaceCollection;

var util = require('util');
var utility = require('../utility.js');
var EventEmitter = require('events').EventEmitter;
var ObservableCollection = require('./observableCollection.js');
var Namespace = require('../namespace.js');

//------------------------------------------------------------------------
function NamespaceCollection(namespace) {
    this.namespace = namespace;

    this._items = new ObservableCollection();
    utility.forward(this._items, this);
}

util.inherits(NamespaceCollection, EventEmitter);

//------------------------------------------------------------------------
NamespaceCollection.prototype.add = function add(name) {
    var namespace = new Namespace(name, this.namespace, this.namespace.context);
    this._items.add(namespace);
    return namespace;
}

//------------------------------------------------------------------------
NamespaceCollection.prototype.remove = function remove(namespace) {
    return this._items.remove(namespace);
}

//------------------------------------------------------------------------
NamespaceCollection.prototype.indexOf = function indexOf(namespace) {
    if(typeof namespace === 'string') {
        // This assumes the user is searching for the namespace by name
        for(var i = 0; i < this._items.length; i++) {
            if(this._items.at(i).name === namespace) {
                return i;
            }
        }

    } else if (namespace instanceof Namespace) {
        for(var i = 0; i < this._items.length; i++) {
            if(this._items.at(i) === namespace) {
                return i;
            }
        }
    }

    return -1;
}

//------------------------------------------------------------------------
NamespaceCollection.prototype.find = function find(namespace) {
    var index = this.indexOf(namespace);
    return index == -1 ? null : this._items[index];
}