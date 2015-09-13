var _ = require('lodash');
var ObservableCollection = require('./observableCollection.js');

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
module.exports.mixin = function(dest, options) {

    // Defaults
    var options = options || {};
    options.addingEvent = options.addingEvent || 'adding',
    options.addedEvent = options.addedEvent || 'added',
    options.removingEvent = options.removingEvent || 'removing',
    options.removedEvent = options.removedEvent || 'removed',
    options.globalEmitter = options.globalEmitter || { emit: function() { } };

    _.extend(dest, {
        _addingEvent: options.addingEvent || 'adding',
        _addedEvent: options.addedEvent || 'added',
        _removingEvent: options.removingEvent || 'removing',
        _removedEvent: options.removedEvent || 'removed',
        _globalEmitter: options.globalEmitter,
        _items: new ObservableCollection(),

        // Optional overrides by the parent. These get called before any
        // events are emitted
        _onItemAdding: function(item, index) {},
        _onItemAdded: function(item, index) {},
        _onItemRemoving: function(item, index) {},
        _onItemRemoved: function(item, index) {},

        //----------------------------------------------------------------
        _onAdding: function _onAdding(items) {
            var self = this;
            _.each(items, function(item) {
                self._onItemAdding(item.item, item.index);
            });

            this._globalEmitter.emit('item-adding', items);
            this.emit(this._addingEvent, items);
        }.bind(dest),

        //----------------------------------------------------------------
        _onAdded: function _onAdded(items) {
            var self = this;
            _.each(items, function(item) {
                self._onItemAdded(item.item, item.index);
            });

            this._globalEmitter.emit('item-added', items);
            this.emit(this._addedEvent, items);
        }.bind(dest),

        //----------------------------------------------------------------
        _onRemoving: function _onRemoving(items) {
            var self = this;
            _.each(items, function(item) {
                self._onItemRemoving(item.item, item.index);
            });

            this._globalEmitter.emit('item-removing', items);
            this.emit(this._removingEvent, items);
        }.bind(dest),

        //----------------------------------------------------------------
        _onRemoved: function _onRemoved(items) {
            var self = this;
            _.each(items, function(item) {
                self._onItemRemoved(item.item, item.index);
            });

            this._globalEmitter.emit('item-removed', items);
            this.emit(this._removedEvent, items);
        }.bind(dest),

        //----------------------------------------------------------------
        at: function at(index) {
            // Leverage the exception that is already thrown at runtime
            return this._items.at(index);
        }.bind(dest),

        //----------------------------------------------------------------
        // Returns the index of the specified item by name or reference.
        // Returns -1 if the item does not exist.
        //----------------------------------------------------------------
        indexOf: function indexOf(item) {
            // Search by reference
            for(var i = 0; i < this._items.length; i++) {
                if(this._items.at(i) === item) {
                    return i;
                }
            }
            return -1;
        }.bind(dest),

        //----------------------------------------------------------------
        // Searches for the item by name
        //----------------------------------------------------------------
        find: function find(name) {
            var index = this.indexOf(name);
            return index == -1 ? null : this._items.at(index);
        }.bind(dest),

        //----------------------------------------------------------------
        // Removes an item from the collection either by reference, or 
        // prdicate. 'item' can be:
        //  - the item to be removed (reference)
        //  - a function with the following signature: bool function(item, index, collection).
        //    Retruning true marks the item for deletion.
        //----------------------------------------------------------------
        remove: function remove(item) {
            if(this._items.length <= 0 || _.isNull(item) || _.isUndefined(item)) {
                return false;
            }

            var toRemove = [];

            if(_.isFunction(item)) {
                for(var i = 0; i < this._items.length; ++i) {
                    var currentItem = this._items.at(i);
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
            this._items.removeMany(toRemove.map(function(value) { return value.item; }));
            this._onRemoved(toRemove);
            return true;
        }.bind(dest),

        //----------------------------------------------------------------
        // Used to add or remove elements from the collection.
        // Same functionality as Array.splice.
        //----------------------------------------------------------------
        splice: function splice(start, deleteCount) {
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
        }.bind(dest)
    });

    Object.defineProperty(dest, 'length', {
        get: function() {
            return this._items.length;
        }
    });
}