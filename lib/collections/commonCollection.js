var _ = require('lodash');
var ObservableCollection = require('./observableCollection.js');

// module.exports.extend = function extend(dest) {

// };

//  Adds common collection methods to collections housing an ObservableCollection.
//
// Assumes:
//  - An ObservableCollection member named '_items' that contains the internal collection
//  - A Project context is available through the 'context' member
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

        //----------------------------------------------------------------
        _onAdding: function _onAdding(items) {
            this._globalEmitter.emit('item-adding', items);
            this.emit(this._addingEvent, items);
        }.bind(dest),

        //----------------------------------------------------------------
        _onAdded: function _onAdded(items) {
            this._globalEmitter.emit('item-added', items);
            this.emit(this._addedEvent, items);
        }.bind(dest),

        //----------------------------------------------------------------
        _onRemoving: function _onRemoving(items) {
            this._globalEmitter.emit('item-removing', items);
            this.emit(this._removingEvent, items);
        }.bind(dest),

        //----------------------------------------------------------------
        _onRemoved: function _onRemoved(items) {
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
            if(_.isString(item)) {
                // Search by name
                for(var i = 0; i < this._items.length; i++) {
                    if(this._items.at(i).name === item) {
                        return i;
                    }
                }

            } else {
                // Search by reference
                for(var i = 0; i < this._items.length; i++) {
                    if(this._items.at(i) === item) {
                        return i;
                    }
                }
            }

            return -1;
        }.bind(dest),
        // Searches for the item by name
        find: function find(name) {
            var index = this.indexOf(name);
            return index == -1 ? null : this._items.at(index);
        }.bind(dest),

        //----------------------------------------------------------------
        // Removes an item from the collection either by name, or 
        // reference. The predicate is optional and takes:
        //      - function(item, index, collection)
        //----------------------------------------------------------------
        remove: function remove(item, predicate) {
            if(this._items.length <= 0) {
                return false;
            }

            var self = this;
            var index = -1;
            var predicate = predicate || null;

            if(predicate == null && (_.isObject(item) || _.isPlainObject(item))) {
                // Remove by item reference equality
                predicate = function(it, idx) {
                                if(item == it) {
                                    index = idx;
                                    return true;
                                }
                            };
            } else if(predicate == null) {
                // Remove by strict item equality
                predicate = function(it, idx) {
                                if(item === it) {
                                    index = idx;
                                    return true;
                                }
                            };
            }

            item = this._items.find(predicate);

            if(_.isNull(item) || _.isUndefined(item)) {
                return false;
            }

            var items = [{ item: item, index: index }];
            this._onRemoving(items);
            this._items.remove(item);
            this._onRemoved(items);
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