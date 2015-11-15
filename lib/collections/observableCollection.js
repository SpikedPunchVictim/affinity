'use strict';

var util = require('util');
var EventEmitter = require('../eventEmitter.js');
var _ = require('lodash');


// var create = function create() {
//     return new ObservableCollection();
// }
var events = {
    adding: 'adding',
    added: 'added',
    moving: 'moving',
    moved: 'moved',
    removing: 'removing',
    removed: 'removed',
    replacing: 'replacing',
    replaced: 'replaced'
};

//------------------------------------------------------------------------
// Sorts the event response formatted items by index in reverse. ie larger
// indexes appear first.
//------------------------------------------------------------------------
function sortByIndexReverse(a, b) {
    return sortByIndex(a, b) * -1;   
}

//------------------------------------------------------------------------
// Sorts the event response formatted items by index in reverse. ie larger
// indexes appear first.
//------------------------------------------------------------------------
function sortByIndex(a, b) {
    if(a.index > b.index) return 1;
    if(a.index < b.index) return -1;
    return 0;    
}


/*
var create = function create() {
    var obj = {
        _items: [],
        get length() {
            return this._items.length;
        },
        //
        //  Adds items to the collection. Mutliple arguments
        //  can be passed in to add mutliple items
        //
        add: function add(item) {
            var toAdd = []
            if(arguments.length > 0) {
                var startIndex = this._items.length;
                for(var i = 0; i < arguments.length; ++i) {
                    toAdd.push({ item: arguments[i], index: startIndex + i });
                }
            } else {
                toAdd.push({ item: item, index: this._items.length });
            }
            
            this._onAdding(toAdd);
            
            for(var i = 0; i < toAdd.length; ++i) {
                this._items.push(toAdd[i].item);
            }

            this._onAdded(toAdd);  
        },
        //
        //  'addMany' is necessary since arrays can be added to the collection.
        //
        // addMany: function addMany(items) {
        //     var toAdd = [];
        //     var self = this;
        //     var startIndex = this._items.length;
        
        //     toAdd = items.map(function(item, index) {
        //         return {
        //             item: item,
        //             index: startIndex + index
        //         };
        //     });
        
        //     // Sort by index
        //     toAdd.sort(function(a, b) {
        //         if(a.index > b.index) return 1;
        //         if(a.index < b.index) return -1;
        //         return 0;
        //     })
        
        //     this._onAdding(toAdd);
        
        //     for(var i = 0; i < toAdd.length; i++) {
        //         this._items.splice(toAdd[i].index, 0, toAdd[i].item);
        //     }
        
        //     this._onAdded(toAdd);
        // },
        remove: function remove(item) {
            var toRemove = []
            if(arguments.length > 0) {
                for(var i = 0; i < arguments.length; ++i) {
                    var currentItem = arguments[i];
                    var currentIndex = this._items.indexOf(currentItem);
                    
                    // Ignore items that are not part of the original collection
                    if(currentIndex < 0) { continue; }
                    toRemove.push({ item: item, index: this._items.indexOf(currentItem) });
                }
            } else {
                toRemove.push({ item: item, index: this._items.indexOf(item) });
            }
            
            if(toRemove.length == 0) {
                return;
            }
            
            this._onRemoving(toRemove);
            
            // Sort to remove safely from the end
            toRemove.sort(sortByIndexReverse);
            
            // [REMOVE]
            console.log(toRemove);
            
            for(var i = 0; i < toRemove.length; i++) {
                this._items.splice(toRemove[i].index, 1);
            }

            this._onRemoved(toRemove);            
        },
        // removeMany: function removeMany(items) {
        //     var self = this;
        //     var itemsToRemove = items.map(function(item, index) {
        //         return {
        //             item: item,
        //             index: self._items.indexOf(item)
        //         }
        //     });
        
        //     if(itemsToRemove.length == 0) {
        //         return;
        //     }
        
        //     itemsToRemove = itemsToRemove.filter(function(item) {
        //         return item.index >= 0;
        //     });
        
        //     // Remove safely from the end without affecting higher indexes
        //     itemsToRemove.sort(_sortByIndexReverse);
        
        //     this._onRemoving(itemsToRemove);
            
        //     for(var i = 0; i < itemsToRemove.length; i++) {
        //         this._items.splice(itemsToRemove[i].index, 1);
        //     }
        
        //     this._onRemoved(itemsToRemove);
        // },
        splice: function splice(start, deleteCount) {
            if(start < 0) {
                start = this._items.length + start;
            } else if (start > this._items.length) {
                start = this._items.length;
            }
        
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
        
                    return toAdd.map(function(item, index) { return item; });
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
        },
        push: function push(items) {
            this.add(items);
            return this._items.length;          
        },
        find: function find(predicate) {
            for(var i=0; i < this._items.length; i++) {
                var value = this._items[i];
                if(predicate(value, i, this._items)) {
                    return value;
                }
            }
        
            return void 0;            
        },
        pop: function pop() {
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
        },
        insert: function insert(item, index) {
            this._onAdding([{item: item, index: index}]);
            this._items.splice(index, 0, item);   
            this._onAdded([{item: item, index: index}]);            
        },
        at: function at(index) {
            var result = this._items[index];
        
            if(result == undefined) {
                throw new RangeError('Index out of range');
            }
            
            return result;             
        },
        _onAdding: function _onAdding(items) {
            this.emit(events.adding, items);
        },
        _onAdded: function _onAdded(items) {
            this.emit(events.added, items);
        },
        _onRemoving: function _onRemoving(items) {
            this.emit(events.removing, items);
        },
        _onRemoved: function _onRemoved(items) {
            this.emit(events.removed, items);
        }
    };
    
    EventEmitter.mixin(obj);
    return obj;
}
*/

var pop = Array.prototype.pop;
var push = Array.prototype.push;
var reverse = Array.prototype.reverse;
var shift = Array.prototype.shift;
var splice = Array.prototype.splice;
var unshift = Array.prototype.unshift;

class ObservableCollection extends Array {
    add() {
        var args = []
        for(var i = 0; i < arguments.length; ++i) {
            args.push(arguments[i]);
        }
        this.push.apply(this, args);
    }

    // Removes the first instance of the specified value.
    // Returns true if a value was removed, otherwise false.
    remove() {
        if(this.length == 0) {
            return false;
        }

        var toRemove = []
        for(var i = 0; i < arguments.length; ++i) {
            var index = this.indexOf(arguments[i]);
            if(index >= 0) {
                toRemove.push(index);
            }            
        }

        if(toRemove.length == 0) {
            return false;
        }

        // Reverse sort for safe deletion
        toRemove.sort((a, b) => {
            if (a > b) return -1;
            if (b > a) return 1;
            return 0;
        });

        var change = toRemove.map((current, index, array) => ({ item: this[current], index: current }), this);
        this.emit('removing', change);

        for(var i = 0; i < toRemove.length; ++i) {
            splice.call(this, toRemove[i], 1);
        }

        this.emit('removed', change);
        return true;
    }

    clear() {
        this.splice(0, this.length);
    }

    // Modified version of:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
    fill(value) {
        // Steps 1-2.
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }
        
        var O = Object(this);
        
        // Steps 3-5.
        var len = O.length >>> 0;
        
        // Steps 6-7.
        var start = arguments[1];
        var relativeStart = start >> 0;
        
        // Step 8.
        var k = relativeStart < 0 ?
          Math.max(len + relativeStart, 0) :
          Math.min(relativeStart, len);
        
        // Steps 9-10.
        var end = arguments[2];
        var relativeEnd = end === undefined ?
            len : end >> 0;
        
        // Step 11.
        var final = relativeEnd < 0 ?
            Math.max(len + relativeEnd, 0) :
            Math.min(relativeEnd, len);
        
        // Step 12.
        var index = k;
        var change = []
        while(index < final) {
            change.push({
                item: value,
                index: index
            });
            index++;
        }
        
        this.emit('replacing', change);
        
        while (k < final) {
            O[k] = value;
            k++;
        }
        
        this.emit('replaced', change);
        
        // Step 13.
        return O;
    }
    
    // Modified version of:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin
    // [TODO]: Revisit the eventing from this
    copyWithin(target, start/*, end*/) {
        // Steps 1-2.
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }

        var O = Object(this);
        
        // Steps 3-5.
        var len = O.length >>> 0;
        
        // Steps 6-8.
        var relativeTarget = target >> 0;
        
        var to = relativeTarget < 0 ?
            Math.max(len + relativeTarget, 0) :
            Math.min(relativeTarget, len);
        
        // Steps 9-11.
        var relativeStart = start >> 0;
        
        var from = relativeStart < 0 ?
            Math.max(len + relativeStart, 0) :
            Math.min(relativeStart, len);
        
        // Steps 12-14.
        var end = arguments[2];
        var relativeEnd = end === undefined ? len : end >> 0;
        
        var final = relativeEnd < 0 ?
            Math.max(len + relativeEnd, 0) :
            Math.min(relativeEnd, len);
        
        // Step 15.
        var count = Math.min(final - from, len - to);
        
        // Steps 16-17.
        var direction = 1;
        
        if (from < to && to < (from + count)) {
            direction = -1;
            from += count - 1;
            to += count - 1;
        }
        
        var tempCount = count;
        var tempFrom = from;
        var tempTo = to;
        var adds = [];
        var removes = [];
        while (tempCount > 0) {
            if (tempFrom in O) {
                adds.push({ item: O[tempFrom], index: tempTo });
            } else {
                removes.push({ item: O[tempTo], index: tempTo });
            }
        
            tempFrom += direction;
            tempTo += direction;
            tempCount--;
        }
        
        if(adds.length > 0) {
            this.emit('replacing', adds);
        }
        
        // Step 18.
        while (count > 0) {
            if (from in O) {
                O[to] = O[from];
            } else {
                delete O[to];
          }
        
            from += direction;
            to += direction;
            count--;
        }

        if(removes.length > 0) {
            this.emit('replaced', removes);
        }
        
        // Step 19.
        return O;
    }
    
    pop() {
        if(this.length == 0) {
            return undefined;
        }
        
        var change = {
            item: this[this.legnth - 1],
            index: this.length - 1
        }
        
        this.emit('removing', change);
        var result = pop.call(this);
        this.emit('removed', change);
        return result;
    }
    
    push(items) {
        if(arguments.length == 0) {
            return this.length;
        }
        
        var change = [];
        for(var i = 0; i < arguments.length; ++i) {
            change.push({
                item: arguments[i],
                index: this.length + i
            });
        }
        
        this.emit('adding', change);
        var result = push.apply(this, change.map(current => current.item));
        this.emit('added', change);
        
        return result;
    }

    reverse() {
        if(this.length == 0) {
            return;
        }

        var change = [];
        for(var i = 0; i < this.length; ++i) {
            change.push({
                item: this[i],
                index: this.length - 1 - i
            });
        }


        this.emit('moving', change);
        var result = reverse.call(this);
        this.emit('moved', change);
        return result;
    }

    shift() {
        if(this.length == 0) {
            return;
        }

        var change = { iten: this[0], index: 0 };
        this.emit('removing', change);
        var result = shift.call(this);
        this.emit('removed', change);
        return result;
    }

    splice(start, deleteCount) {
        if(start < 0) {
            start = Math.max(0, this.length + start);
        } else if (start > this.length) {
            start = this.length;
        }

        if(deleteCount < 0) {
            return [];            
        } else if (deleteCount == 0) {
            // Adding
            if(arguments.length <= 2) {
                return [];
            }

            var change = [];
            for(var i = 2; i < arguments.length; ++i) {
                change.push({
                    item: arguments[i],
                    index: start + (i - 2)
                });
            }

            if(change.length == 0) {
                return [];
            }

            this.emit('adding', change);

            var args = [];
            for(var i = 0; i < arguments.length; ++i) {
                args.push(arguments[i]);
            }

            var result = splice.apply(this, args);

            this.emit('added', change);

            return result;

        } else {
            // Removing
            var change = [];

            deleteCount = deleteCount || this.length;
        
            if((deleteCount + start) > this.length) {
                deleteCount = this.length - start;
            }
    
            for(var i = 0; i < deleteCount; i++) {
                change.push({
                    item: this[start + i],
                    index: start + i
                });
            }
    
            if(change.length == 0) {
                return [];
            }
    
            this.emit('removing', change);
    
            var args = [];
            for(var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
    
            var result = splice.apply(this, args);
    
            this.emit('removed', change);
    
            return result;
        }
    }

    unshift() {
        if(arguments.length == 0) {
            return this.length;
        }

        var change = [];
        for(var i = 0; i < arguments.length; ++i) {
            change.push({
                item: arguments[i],
                index: arguments.length - 1 - i
            });
        }

        var args = [];
        for(var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        this.emit('adding', change);
        var result = unshift.apply(this, args);
        this.emit('added', change);
        return result;
    }
}

module.exports = {
    create: function create() {
        var obj = new ObservableCollection();
        EventEmitter.mixin(obj)
        return obj;
    },
    // List of supported events
    events: events
}











// Consider:
// Adding a mixin method, that will add the methods for an
// Observable collection. Add the following functions for overriding:
//  - _onAdding
//  - _onAdded
//  - _onRemoving
//  - _onRemoved


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
var sync = function sync(options) {
    var syncObj = { };

    syncObj.master = options.master;
    syncObj.slave = options.slave || create();

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
            this.master.remove(events.added, this.items_added);
            this.master.remove(events.removed, this.items_removed);
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

    syncObj.master.on(events.added, syncObj.items_added);
    syncObj.master.on(events.removed, syncObj.items_removed);

    return syncObj;
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
//  - 'adding'
//  - 'added'
//  - 'removing'
//  - 'removed
//
//  Will need:
//  - 'moved'
//
//------------------------------------------------------------------------
// function ObservableCollection() {
//     EventEmitter.call(this);
//     this._items = [];

//     Object.defineProperty(this, 'length', {
//         get: function() { return this._items.length; }
//     });
// }

// util.inherits(ObservableCollection, EventEmitter);

//------------------------------------------------------------------------
// List of supported events
// ObservableCollection.events = {
//     adding: 'adding',
//     added: 'added', 
//     removing: 'removing',
//     removed: 'removed'
// }

// //------------------------------------------------------------------------
// ObservableCollection.prototype.add = function add(item) {
//     var self = this;

//     var toAdd = { item: item, index: this._items.length };

//     this._onAdding([toAdd]);

//     self._items.push(item);

//     this._onAdded([toAdd]);
// }

// //------------------------------------------------------------------------
// ObservableCollection.prototype.addMany = function addMany(items) {
//     var toAdd = [];
//     var self = this;
//     var startIndex = this._items.length;

//     toAdd = items.map(function(item, index) {
//         return {
//             item: item,
//             index: startIndex + index
//         };
//     });

//     // Sort by index
//     toAdd.sort(function(a, b) {
//         if(a.index > b.index) return 1;
//         if(a.index < b.index) return -1;
//         return 0;
//     })

//     this._onAdding(toAdd);

//     for(var i = 0; i < toAdd.length; i++) {
//         this._items.splice(toAdd[i].index, 0, toAdd[i].item);
//     }

//     this._onAdded(toAdd);    
// }

// //------------------------------------------------------------------------
// ObservableCollection.prototype.remove = function remove(item) {
//     var index = this._items.indexOf(item);

//     if(index < 0) {
//         return;
//     }

//     var itemToRemove = {
//         item: item,
//         index:index
//     };

//     this._onRemoving(itemToRemove);
//     this._items.splice(index, 1);
//     this._onRemoved(itemToRemove);
// }

// //------------------------------------------------------------------------
// ObservableCollection.prototype.removeMany = function remove(items) {
//     var self = this;
//     var itemsToRemove = items.map(function(item, index) {
//         return {
//             item: item,
//             index: self._items.indexOf(item)
//         }
//     });

//     if(itemsToRemove.length == 0) {
//         return;
//     }

//     itemsToRemove = itemsToRemove.filter(function(item) {
//         return item.index >= 0;
//     });

//     // Remove safely from the end without affecting higher indexes
//     itemsToRemove.sort(_sortByIndexReverse);

//     this._onRemoving(itemsToRemove);
    
//     for(var i = 0; i < itemsToRemove.length; i++) {
//         this._items.splice(itemsToRemove[i].index, 1);
//     }

//     this._onRemoved(itemsToRemove);
// }

// //------------------------------------------------------------------------
// ObservableCollection.prototype.splice = function splice(start, deleteCount) {
//     if(start < 0) {
//         start = this._items.length + start;
//     } else if (start > this._items.length) {
//         start = this._items.length;
//     }

//     var isAdding = false;
//     if(deleteCount < 0) {
//         return; // Do nothing (raise an error?)
//     } else if(deleteCount == 0) {
//         // Adding
//         if(arguments.length > 2) {
//             var toAdd = [];
//             for(var i = 2; i < arguments.length; i++) {
//                 toAdd.push({
//                     item: arguments[i],
//                     index: start + (i - 2)
//                 });
//             }

//             if(toAdd.length == 0) {
//                 return [];
//             }

//             this._onAdding(toAdd);

//             var args = [];
//             for(var i = 0; i < arguments.length; i++) {
//                 args.push(arguments[i]);
//             }

//             this._items.splice.apply(this._items, args);

//             this._onAdded(toAdd);

//             return toAdd.map(function(item, index) { return item; });;
//         }
//     } else if(deleteCount > 0) {
//         // Removing
//         var toRemove = [];

//         if((deleteCount + start) > this._items.length) {
//             deleteCount = this._items.length - start;
//         }

//         for(var i = 0; i < deleteCount; i++) {
//             toRemove.push({
//                 item: this._items[start + i],
//                 index: start + i
//             });
//         }

//         if(toRemove.length == 0) {
//             return [];
//         }

//         this._onRemoving(toRemove);

//         var args = [];
//         for(var i = 0; i < arguments.length; i++) {
//             args.push(arguments[i]);
//         }

//         this._items.splice.apply(this._items, args);

//         this._onRemoved(toRemove);

//         return toRemove.map(function(item, index) { return item; });
//     }

//     return [];
// }

// //------------------------------------------------------------------------
// ObservableCollection.prototype.push = function push(items) {
//     this.add(items);
//     return this._items.length;
// }

// //------------------------------------------------------------------------
// ObservableCollection.prototype.find = function(predicate) {
//     for(var i=0; i < this._items.length; i++) {
//         var value = this._items[i];
//         if(predicate(value, i, this._items)) {
//             return value;
//         }
//     }

//     return void 0;
// }

// //------------------------------------------------------------------------
// ObservableCollection.prototype.pop = function pop() {
//     if(this._items.length == 0) { 
//         return undefined;
//     }

//     var index = Math.max(0, this._items.length - 1);
    
//     var removed = []
//     removed.push({
//         item: this._items[index],
//         index: index
//     });

//     this._onRemoving(removed);
//     var value = this._items.pop();
//     this._onRemoved(removed);
//     return value;
// }

// //------------------------------------------------------------------------
// ObservableCollection.prototype.insert = function insert(item, index) {
//     this._onAdding([{item: item, index: index}]);
//     this._items.splice(index, 0, item);   
//     this._onAdded([{item: item, index: index}]);
// }

// //------------------------------------------------------------------------
// ObservableCollection.prototype.at = function at(index) {
//     var result = this._items[index];

//     if(result == undefined) {
//         throw new RangeError('Index out of range');
//     }
    
//     return result;    
// }

// //------------------------------------------------------------------------
// ObservableCollection.prototype._onAdding = function _onAdding(items) {
//     this.emit(ObservableCollection.events.adding, items);
// }

// //------------------------------------------------------------------------
// ObservableCollection.prototype._onAdded = function _onAdded(items) {
//     this.emit(ObservableCollection.events.added, items);
// }

// //------------------------------------------------------------------------
// ObservableCollection.prototype._onRemoving = function _onRemoving(items) {
//     this.emit(ObservableCollection.events.removing, items);
// }

// //------------------------------------------------------------------------
// ObservableCollection.prototype._onRemoved = function _onRemoved(items) {
//     this.emit(ObservableCollection.events.removed, items);
// }