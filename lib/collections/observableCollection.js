var util = require('util');
var EventEmitter = require('events').EventEmitter

module.exports = ObservableCollection;
module.exports.sync = sync;

//-----------------------------------------------------------------------
// Keeps multiple ObservableCollections in sync by using the
// provided transformations. Call dispose on the returned sync object
// to discontinue syncing between the collections.
//
// options {Object}
//  master: {Object - ObservableCollection}
//  slave: (optional) {Object - ObservableCollection}
//      This field is optional. If not provided, will create a new colection
//      and sync that one with the provided master.
//  addSlaveItem: { function(masterItem, masterItemIndex) }
//  removeSlaveItem: { function(slaveItem) }
//  compare: { function(masterItem, slaveItem) returns true if they are equal }
//-----------------------------------------------------------------------
function sync(options) {
    var syncObj = { };

    syncObj.master = options.master;
    syncObj.slave = options.slave || new ObservableCollection();

    syncObj.addSlaveItem = options.addSlaveItem ||
        function(masterItem, masterIndex) { this.slave.insert(masterItem, masterIndex); }.bind(syncObj),
        
    syncObj.removeSlaveItem = options.removeSlaveItem ||
        function(slaveItem) { this.slave.remove(slaveItem); }.bind(syncObj),
        
    syncObj.items_added = function(items) {
        var self = this;
        items.forEach(function(item) {
            self.addSlaveItem(item.item, item.index);
        });
    }.bind(syncObj);


    syncObj.items_removed = function(items) {
            if(items.length == 1) {
                this.removeSlaveItem(options.slave.at(item.index));
                return;
            }

            // Remove from the end of the array as it's a safe delete
            // Sort by highest index first
            items.sort(function(a, b) {
                if(a.index < b.index) return 1;
                if(a.index > b.index) return -1;
                return 0;
            });

            for(var i = 0; i < items.length; i++) {
                var item = items[i];
                this.removeSlaveItem(this.slave.at(item.index));
            }
        }.bind(syncObj);

    syncObj.dispose = function() {
            this.master.remove('items-added', this.items_added);
            this.master.remove('items-added', this.items_added);
        };


    // Do the synching
    for(var i = 0; i < syncObj.master.length; i++) {
        var isInMasterRange = i < syncObj.master.length;
        var isInSlaveRange = i < syncObj.slave.length;

        // Add to the slave
        if (isInMasterRange && !isInSlaveRange) {
            syncObj.addSlaveItem(syncObj.master.at(i), i);
            continue;
        }

        // Remove from slave
        if (isInSlaveRange && !isInMasterRange) {
            syncObj.removeSlaveItem(syncObj.slave.at(i));
            syncObj.slave.RemoveAt(i);
            --i;
            continue;
        }

        // Compare and make sure they are equal
        if (isInMasterRange && isInSlaveRange) {
            // If they are not equal, replace the slave item
            if (!syncObj.compare(syncObj.master.at(i), syncObj.slave.at(i)))
            {
                syncObj.removeSlaveItem(syncObj.slave.at(i));
                syncObj.addSlaveItem(syncObj.master.at(i), i);
            }
        }
    }

    syncObj.master.on('items-added', syncObj.items_added);
    syncObj.master.on('items-removed', syncObj.items_removed);

    return syncObj;
}

//------------------------------------------------------------------------
// Sorts the event response formatted items by index in reverse. ie larger
// indexes appear first.
//------------------------------------------------------------------------
function _sortByIndexReverse(a, b) {
    return _sortByIndex(a, b) * -1;   
}

//------------------------------------------------------------------------
// Sorts the event response formatted items by index in reverse. ie larger
// indexes appear first.
//------------------------------------------------------------------------
function _sortByIndex(a, b) {
    if(a.index > b.index) return 1;
    if(a.index < b.index) return -1;
    return 0;    
}

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
//  Will need:
//  - 'items-moved'
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
ObservableCollection.prototype.add = function add(item) {
    var self = this;
    var startIndex = this._items.length;

    var toAdd = { item: item, index: this._items.length };

    this._onAdding([toAdd]);

    self._items.push(item);

    this._onAdded([toAdd]);
}

//------------------------------------------------------------------------
ObservableCollection.prototype.addMany = function addMany(items) {
    var toAdd = [];
    var self = this;
    var startIndex = this._items.length;

    toAdd = items.map(function(item, index) {
        return {
            item: item,
            index: startIndex + index
        };
    });

    this._onAdding(toAdd);
    
    toAdd.forEach(function (item) {
        self._items.push(item.item);
    });

    this._onAdded(toAdd);    
}

//------------------------------------------------------------------------
ObservableCollection.prototype.remove = function remove(item) {
    var index = this._items.indexOf(item);

    if(index < 0) {
        return;
    }

    var itemToRemove = {
        item: item,
        index:index
    };

    this._onRemoving(itemToRemove);
    this._items.splice(index, 1);
    this._onRemoved(itemToRemove);
}

//------------------------------------------------------------------------
ObservableCollection.prototype.removeMany = function remove(items) {
    var self = this;
    var itemsToRemove = items.map(function(item, index) {
        return {
            item: item,
            index: self._items.indexOf(item)
        }
    });

    if(itemsToRemove.length == 0) {
        return;
    }

    itemsToRemove = itemsToRemove.filter(function(item) {
        return item.index >= 0;
    });

    // Remove safely from the end without affecting higher indexes
    itemsToRemove.sort(_sortByIndexReverse);

    this._onRemoving(itemsToRemove);
    
    for(var i = 0; i < itemsToRemove.length; i++) {
        this._items.splice(itemsToRemove[i].index, 1);
    }

    this._onRemoved(itemsToRemove);
}

//------------------------------------------------------------------------
ObservableCollection.prototype.splice = function splice(start, deleteCount) {
    if(start < 0) {
        start = this._items.length + start;
    } else if (start > this._items.length) {
        start = this._items.length;
    }

    var isAdding = false;
    if(deleteCount < 0) {
        return; // Do nothing (raise an error?)
    } else if(deleteCount == 0) {
        // Adding
        if(arguments.length > 2) {
            var toAdd = [];
            for(var i = 2; i < arguments.length; i++) {
                toAdd.push({
                    item: arguments[i],
                    index: start + (i - 2)
                });
            }

            if(toAdd.length == 0) {
                return [];
            }

            this._onAdding(toAdd);

            var args = [];
            for(var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }

            this._items.splice.apply(this._items, args);

            this._onAdded(toAdd);

            return toAdd.map(function(item, index) { return item; });;
        }
    } else if(deleteCount > 0) {
        // Removing
        var toRemove = [];

        if((deleteCount + start) > this._items.length) {
            deleteCount = this._items.length - start;
        }

        for(var i = 0; i < deleteCount; i++) {
            toRemove.push({
                item: this._items[start + i],
                index: start + i
            });
        }

        if(toRemove.length == 0) {
            return [];
        }

        this._onRemoving(toRemove);

        var args = [];
        for(var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        this._items.splice.apply(this._items, args);

        this._onRemoved(toRemove);

        return toRemove.map(function(item, index) { return item; });
    }

    return [];
}

//------------------------------------------------------------------------
ObservableCollection.prototype.push = function push(items) {
    this.add(items);
    return this._items.length;
}

//------------------------------------------------------------------------
ObservableCollection.prototype.find = function(predicate) {
    for(var i=0; i < this._items.length; i++) {
        var value = this._items[i];
        if(predicate(value, i, this._items)) {
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
ObservableCollection.prototype.insert = function insert(item, index) {
    this._onAdding([{item: item, index: index}]);
    this._items.splice(index, 0, item);   
    this._onAdded([{item: item, index: index}]);
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