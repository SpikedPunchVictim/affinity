'use strict';

var _ = require('lodash');
var ObservableCollection = require('./observableCollection.js');
var EventEmitter = require('../eventEmitter.js');



// module.exports.extend = function extend(dest) {

// };

//  Adds common collection methods to collections housing an ObservableCollection.
//  Consider: Using an ObservableCollection with different search strategies.
//      For example, create an ObservableCollection, and assign it a NamedObjectSearchStrategy,
//      whose methods used to search the ObservableCollection. This would assume the exposed
//      Obseravblecollection API be a one-size-fits-all approach.
//
//
// Assumes:
//  - An ObservableCollection member named '_items' that contains the internal collection
//  - A Project context is available through the 'context' member
//  - The items in the collection are NamedObjects
//
var mixin = function mixin(dest) {
    dest._items = new ObservableCollection();

    var hasEmitter = ('emit' in dest);
    
    if(!hasEmitter) {
        EventEmitter.mixin(dest);
    }

    // Optional overrides by the parent
    dest._onItemsAdding = function(items) {};
    dest._onItemsAdded = function(items) {};
    dest._onItemsRemoving = function(items) {};
    dest._onItemsRemoved = function(items) {};
    dest._validateAdd = function _validateAdd(items) { return true; }

        //----------------------------------------------------------------
    dest._onAdding = function _onAdding(items) {
        if(this._validateAdd(items)) {
            this._onItemsAdding(items);
            this.emit('adding', items);
        }
    };

    //----------------------------------------------------------------
    dest._onAdded = function _onAdded(items) {
        this._onItemsAdded(items);
        this.emit('added', items);
    };

        //----------------------------------------------------------------
    dest._onRemoving = function _onRemoving(items) {
        this._onItemsRemoving(items);
        this.emit('removing', items);
    };

        //----------------------------------------------------------------
    dest._onRemoved = function _onRemoved(items) {
        this._onItemsRemoved(items);
        this.emit('removed', items);
    };

    //----------------------------------------------------------------
    dest.at = function at(index) {
        // Leverage the exception that is already thrown at runtime
        return this._items[index];
    };

    //----------------------------------------------------------------
    // Returns the index of the specified item by name or reference.
    // Returns -1 if the item does not exist.
    //----------------------------------------------------------------
    dest.indexOf = function indexOf(item) {
        // Search by reference
        for(var i = 0; i < this._items.length; i++) {
            if(this._items[i] === item) {
                return i;
            }
        }
        return -1;
    };

    //----------------------------------------------------------------
    // Searches for the item by name
    //----------------------------------------------------------------
    dest.find = function find(name) {
        var index = this.indexOf(name);
        return index == -1 ? null : this._items.at(index);
    };

    //----------------------------------------------------------------
    // Removes an item from the collection either by reference, or 
    // prdicate. 'item' can be:
    //  - the item to be removed (reference)
    //  - a function with the following signature: bool function(item, index, collection).
    //    Returning true marks the item for deletion.
    //----------------------------------------------------------------
    dest.remove = function remove(item) {
        if(this._items.length <= 0 || _.isNull(item) || _.isUndefined(item)) {
            return false;
        }

        var toRemove = [];

        if(_.isFunction(item)) {
            for(var i = 0; i < this._items.length; ++i) {
                var currentItem = this._items[i];
                if(item(currentItem, i, this)) {
                    toRemove.push({
                        item: currentItem,
                        index: i
                    });
                }
            }
        } else {
            var index = this.indexOf(item);
            if(index == -1) {
                return false;
            }

            toRemove.push({
                item: item,
                index: index
            });
        }

        if(toRemove.length == 0) {
            return false;
        }

        this._onRemoving(toRemove);
        this._items.remove.apply(this._items, toRemove.map(function(value) { return value.item; }));
        this._onRemoved(toRemove);
        return true;
    };

    //----------------------------------------------------------------
    // Used to add or remove elements from the collection.
    // Same functionality as Array.splice.
    //----------------------------------------------------------------
    dest.splice = function splice(start, deleteCount) {
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
    };

    Object.defineProperty(dest, 'length', {
        get: function() {
            return this._items.length;
        }
    });
}

module.exports.mixin = mixin;