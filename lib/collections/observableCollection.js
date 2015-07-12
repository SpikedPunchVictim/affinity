var util = require('util');
var EventEmitter = require('events').EventEmitter

module.exports = ObservableCollection;

//------------------------------------------------------------------------
// This clas implements a collection that can be observed for changes.
//
// Raised events:
//
//  The following events contain the same parameters passed into the
//  listener calback:
//      An array of objects containing the
//          - item: Item in context
//          - index: The item's index
//
//  - 'items-adding'
//  - 'items-added'
//  - 'items-removing'
//  - 'items'removed
// 
//
//------------------------------------------------------------------------
function ObservableCollection() {
    EventEmitter.call(this);
    this._items = [];

    Object.defineProperty(this, 'length', {
        get: function() { return this._items.length; }
    });
}

util.inherits(ObservableCollection, EventEmitter);

//------------------------------------------------------------------------
ObservableCollection.prototype.add = function add(items) {
    var toAdd = [];
    var self = this;
    var startIndex = this._items.length;

    if(items instanceof Array) {
        toAdd = items.map(function(item, index) {
            return {
                item: item,
                index: startIndex + index
            };
        });

    } else {
        toAdd.push({
            item: items,
            index: startIndex
        });
    }

    this._onAdding(toAdd);
    
    toAdd.forEach(function (item) {
        self._items.push(item.item);
    });

    this._onAdded(toAdd);
    return toAdd.length;
}

//------------------------------------------------------------------------
ObservableCollection.prototype.remove = function remove(items) {
    var itemsToRemove = [];
    var self = this;

    if(items instanceof Array) {
        itemsToRemove = items.map(function(item, index) {
            console.log('item: %j    index: %s', item, index);
            return {
                item: item,
                index: self._items.indexOf(item)
            }
        });

        itemsToRemove = itemsToRemove.filter(function(item) {
            return item.index >= 0;
        });

        // Sort by index so we can safely remove the items from the array
        itemsToRemove = itemsToRemove.sort(function(a, b) {
            return a.index > b.index ? 1 : -1;
        });

    } else {
        var index = this._items.indexOf(items);
        if(index >= 0) {
            itemsToRemove.push({
                item: items,
                index:index
            });
        }
    }

    this._onRemoving(itemsToRemove);
    for(var i = Math.max(0, itemsToRemove.length - 1); i >= 0; i--) {
        this._items.splice(itemsToRemove[i].index, 1);
    }
    this._onRemoved(itemsToRemove)
}

//------------------------------------------------------------------------
ObservableCollection.prototype.push = function push(items) {
    this.add(items);
    return this._items.length;
}

//------------------------------------------------------------------------
ObservableCollection.prototype.find = function(filter) {
    for(var i=0; i < this._items.length, i++) {
        var value = this._items[i];
        if(filter(value, i, this._items)) {
            return value;
        }
    }

    return void 0;
}

//------------------------------------------------------------------------
ObservableCollection.prototype.pop = function pop() {
    if(this._items.length == 0) { 
        return undefined;
    }

    var index = Math.max(0, this._items.length - 1);
    
    var removed = []
    removed.push({
        item: this._items[index],
        index: index
    });

    this._onRemoving(removed);
    var value = this._items.pop();
    this._onRemoved(removed);
    return value;
}

//------------------------------------------------------------------------
ObservableCollection.prototype.at = function at(index) {
    return this._items[index];
}

//------------------------------------------------------------------------
ObservableCollection.prototype._onAdding = function _onAdding(items) {
    this.emit('items-adding', items);
}

//------------------------------------------------------------------------
ObservableCollection.prototype._onAdded = function _onAdded(items) {
    this.emit('items-added', items);
}

//------------------------------------------------------------------------
ObservableCollection.prototype._onRemoving = function _onRemoving(items) {
    this.emit('items-removing', items);
}

//------------------------------------------------------------------------
ObservableCollection.prototype._onRemoved = function _onRemoved(items) {
    this.emit('items-removed', items);
}

