'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
   removed: 'removed'
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
   if (a.index > b.index) return 1;
   if (a.index < b.index) return -1;
   return 0;
}

var ObservableCollection = function () {
   function ObservableCollection() {
      (0, _classCallCheck3.default)(this, ObservableCollection);

      EventEmitter.mixin(this);
      this._items = [];
   }

   (0, _createClass3.default)(ObservableCollection, [{
      key: 'at',
      value: function at(index) {
         return this._items[index];
      }
   }, {
      key: 'indexOf',
      value: function indexOf(item) {
         return this._items.indexOf(item);
      }
   }, {
      key: 'contains',
      value: function contains(item) {
         return this.indexOf(item) >= 0;
      }

      // filter(item, index, collection)

   }, {
      key: 'find',
      value: function find(filter) {
         return _.find(this._items, filter, this);
      }

      // filter(item, index, collection)

   }, {
      key: 'filter',
      value: function filter(_filter) {
         return _.filter(this._items, _filter, this);
      }
   }, {
      key: 'insert',
      value: function insert(index, item) {
         if (index < 0 || index > this.length) {
            throw new Error(util.format('Index out of bouds when inserting value %s at index %s', item, index));
            //return this.emit('error', util.format('Index out of bouds when inserting value %s at index %s', item, index));
         }

         var change = [];
         change.push({
            item: item,
            index: index
         });

         this._add(change);
      }
   }, {
      key: 'add',
      value: function add() {
         var change = [];
         for (var i = 0; i < arguments.length; ++i) {
            change.push({
               item: arguments[i],
               index: this.length + i
            });
         }

         this._add(change);
      }
   }, {
      key: 'move',
      value: function move(from, to) {
         if (from < 0 || from >= this.length || to < 0 || to >= this.length) {
            throw new Error(util.format('Invaid indexes for moving from %s to %s', from, to));
            //return this.emit('error', util.format('Invaid indexes for moving from %s to %s', from, to));
         }

         if (from == to) {
            return;
         }

         var change = {
            from: from,
            to: to,
            item: this._items[from]
         };

         this._move([change]);
      }
   }, {
      key: 'clear',
      value: function clear() {
         var change = [];
         for (var i = 0; i < this._items.length; ++i) {
            change.push({
               item: this._items[i],
               index: i
            });
         }

         this._remove(change);
      }
   }, {
      key: 'remove',
      value: function remove(item) {
         var change = [];
         for (var i = 0; i < arguments.length; ++i) {
            var current = arguments[i];
            var itemIndex = this._items.indexOf(current);

            if (itemIndex < 0) {
               continue;
            }

            change.push({
               item: current,
               index: itemIndex
            });
         }

         this._remove(change);
      }
   }, {
      key: 'removeAt',
      value: function removeAt(index) {
         if (index < 0 || index >= this.length) {
            throw new Error(util.format('Index out of bouds when removing at index %s', index));
         }
         var item = this._items[index];

         var change = [];
         change.push({
            item: item,
            index: index
         });

         this._remove(change);
      }

      // filter(item, index, collection)

   }, {
      key: 'removeAll',
      value: function removeAll(filter) {
         if (this._items.length <= 0 || filter == null || filter === undefined) {
            return false;
         }

         // Error?
         if (!_.isFunction(filter)) {
            return false;
         }

         var toRemove = [];
         for (var i = 0; i < this._items.length; ++i) {
            var currentItem = this._items[i];
            if (filter(currentItem, i, this)) {
               toRemove.push({
                  item: currentItem,
                  index: i
               });
            }
         }

         if (toRemove.length == 0) {
            return false;
         }

         this._remove(toRemove);
         return true;
      }

      // Quickly/tersely subscribe to the events of the array, returning a Listener object.
      //
      //  subs : array of items
      //  Each item contains:
      //      event: string
      //      handler: function - event handler

   }, {
      key: 'sub',
      value: function sub(subs) {
         return EventEmitter.sub(this, subs);
      }

      // subscribes to all items (and future items) in collection

   }, {
      key: 'subItems',
      value: function subItems(subs) {
         var listener = new Listener(this);

         subs.forEach(function (item) {
            listener.on(item.event, item.handler);
         });

         return listener;
      }

      // Each item contains
      //  index: item's index
      //  item: the item
      //
      // Order is not necessary.

   }, {
      key: '_add',
      value: function _add(items) {
         // Sort before raising events
         items.sort(sortByIndex);

         this._onAdding(items);

         for (var i = 0; i < items.length; ++i) {
            this._items.splice(items[i].index, 0, items[i].item);
         }

         this._onAdded(items);
      }

      // Each item contains
      //  index: item's index
      //  item: the item
      //
      // Order is not necessary.

   }, {
      key: '_remove',
      value: function _remove(items) {
         // Safely remove the items from the end &
         // sort before raising events
         items.sort(sortByIndexReverse);

         this._onRemoving(items);

         for (var i = 0; i < items.length; ++i) {
            this._items.splice(items[i].index, 1);
         }

         this._onRemoved(items);
      }

      // Each item contains:
      //  from: from index
      //  to: to index
      //  item: the item
      //
      // They are provided in the order of their execution

   }, {
      key: '_move',
      value: function _move(items) {
         this._onMoving(items);

         for (var i = 0; i < items.length; ++i) {
            var current = items[i];
            this._items.splice(current.from, 1);
            this._items.splice(current.to, 0, current.item);
         }

         this._onMoved(items);
      }
   }, {
      key: '_onAdding',
      value: function _onAdding(items) {
         this._onValidateAdding(items);
         this.emit(events.adding, items);
      }
   }, {
      key: '_onAdded',
      value: function _onAdded(items) {
         this.emit(events.added, items);
      }
   }, {
      key: '_onRemoving',
      value: function _onRemoving(items) {
         this.emit(events.removing, items);
      }
   }, {
      key: '_onRemoved',
      value: function _onRemoved(items) {
         this.emit(events.removed, items);
      }
   }, {
      key: '_onMoving',
      value: function _onMoving(items) {
         this.emit(events.moving, items);
      }
   }, {
      key: '_onMoved',
      value: function _onMoved(items) {
         this.emit(events.moved, items);
      }
   }, {
      key: '_onValidateAdding',
      value: function _onValidateAdding(items) {
         // Blank
      }
   }, {
      key: 'length',
      get: function get() {
         return this._items.length;
      }
   }], [{
      key: 'events',
      get: function get() {
         return events;
      }
   }]);
   return ObservableCollection;
}();

// Expressing Symbol.iterator cannot be a lambda. It must be a 'function'.


ObservableCollection.prototype[Symbol.iterator] = /*#__PURE__*/_regenerator2.default.mark(function _callee() {
   return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
         switch (_context.prev = _context.next) {
            case 0:
               return _context.delegateYield(this._items, 't0', 1);

            case 1:
            case 'end':
               return _context.stop();
         }
      }
   }, _callee, this);
});

//
// This class assists in subscribers interested in listening
// to events on the ObservableCollection as well as the items
// in the collection.
//

var Listener = function () {
   function Listener(observableCollection) {
      (0, _classCallCheck3.default)(this, Listener);

      this._source = observableCollection;
      this._subs = new Map();
      observableCollection.on(events.added, this._onAdded.bind(this));
      observableCollection.on(events.removed, this._onRemoved.bind(this));
   }

   (0, _createClass3.default)(Listener, [{
      key: 'on',
      value: function on(event, handler) {
         var key = event.toLowerCase();
         var handlers = null;

         handlers = this._subs.get(key);

         if (!handlers) {
            handlers = [];
            this._subs.set(key, handlers);
         }

         handlers.push(handler);

         for (var i = 0; i < this._source.length; ++i) {
            var current = this._source.at(i);
            current.on(event, handler);
         }
      }
   }, {
      key: 'off',
      value: function off() {
         var _this = this;

         var _loop = function _loop() {
            var current = _this._source.at(i);

            _this._subs.forEach(function (handlers, event) {
               handlers.forEach(function (h) {
                  return current.off(event, h);
               });
            });
         };

         for (var i = 0; i < this._source.length; ++i) {
            _loop();
         }
      }
   }, {
      key: '_onAdded',
      value: function _onAdded(items) {
         var _this2 = this;

         var _loop2 = function _loop2() {
            var current = items[i];

            _this2._subs.forEach(function (handlers, event) {
               handlers.forEach(function (h) {
                  return current.item.on(event, h);
               });
            });
         };

         for (var i = 0; i < items.length; ++i) {
            _loop2();
         }
      }
   }, {
      key: '_onRemoved',
      value: function _onRemoved(items) {
         var _this3 = this;

         var _loop3 = function _loop3() {
            var current = items[i];

            _this3._subs.forEach(function (handlers, event) {
               handlers.forEach(function (h) {
                  return current.item.off(event, h);
               });
            });
         };

         for (var i = 0; i < items.length; ++i) {
            _loop3();
         }
      }
   }, {
      key: 'collection',
      get: function get() {
         return this._source;
      }
   }]);
   return Listener;
}();

ObservableCollection.prototype.Listener = Listener;
module.exports = ObservableCollection;

// var pop = Array.prototype.pop;
// var push = Array.prototype.push;
// var reverse = Array.prototype.reverse;
// var shift = Array.prototype.shift;
// var splice = Array.prototype.splice;
// var unshift = Array.prototype.unshift;

// class ObservableCollection2 extends Array {
//     _onAdding(items) {
//         this._onValidateAdding(items);
//         this.emit('adding', items);
//     }
//     _onAdded(items) {
//         this.emit('added', items);
//     }
//     _onRemoving(items) {
//         this.emit('removing', items);
//     }
//     _onRemoved(items) {
//         this.emit('removed', items);
//     }
//     _onReplacing(items) {
//         this.emit('replacing', items);
//     }
//     _onReplaced(items) {
//         this.emit('replaced', items);
//     }
//     _onMoving(items) {
//         this.emit('moving', items);
//     }
//     _onMoved(items) {
//         this.emit('moved', items);
//     }

//     _onValidateAdding(items) {
//         // Blank
//     }

//     add() {
//         var args = []
//         for(var i = 0; i < arguments.length; ++i) {
//             args.push(arguments[i]);
//         }
//         this.push.apply(this, args);
//     }

//     // Removes the first instance of the specified value.
//     // Returns true if a value was removed, otherwise false.
//     remove() {
//         if(this.length == 0) {
//             return false;
//         }

//         var toRemove = []
//         for(var i = 0; i < arguments.length; ++i) {
//             var index = this.indexOf(arguments[i]);
//             if(index >= 0) {
//                 toRemove.push(index);
//             }            
//         }

//         if(toRemove.length == 0) {
//             return false;
//         }

//         // Reverse sort for safe deletion
//         toRemove.sort((a, b) => {
//             if (a > b) return -1;
//             if (b > a) return 1;
//             return 0;
//         });

//         var change = toRemove.map((current, index, array) => ({ item: this[current], index: current }), this);
//         this._onRemoving(change);

//         for(var i = 0; i < toRemove.length; ++i) {
//             splice.call(this, toRemove[i], 1);
//         }

//         this._onRemoved(change);
//         return true;
//     }

//     insert(item, index) {
//         this.splice(index, 1, item);
//     }

//     clear() {
//         this.splice(0, this.length);
//     }

//     // Modified version of:
//     // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
//     fill(value) {
//         // Steps 1-2.
//         if (this == null) {
//             throw new TypeError('this is null or not defined');
//         }

//         var O = Object(this);

//         // Steps 3-5.
//         var len = O.length >>> 0;

//         // Steps 6-7.
//         var start = arguments[1];
//         var relativeStart = start >> 0;

//         // Step 8.
//         var k = relativeStart < 0 ?
//           Math.max(len + relativeStart, 0) :
//           Math.min(relativeStart, len);

//         // Steps 9-10.
//         var end = arguments[2];
//         var relativeEnd = end === undefined ?
//             len : end >> 0;

//         // Step 11.
//         var final = relativeEnd < 0 ?
//             Math.max(len + relativeEnd, 0) :
//             Math.min(relativeEnd, len);

//         // Step 12.
//         var index = k;
//         var change = []
//         while(index < final) {
//             change.push({
//                 item: value,
//                 index: index
//             });
//             index++;
//         }

//         this._onReplacing(change);

//         while (k < final) {
//             O[k] = value;
//             k++;
//         }

//         this._onReplaced(change);

//         // Step 13.
//         return O;
//     }

//     // Modified version of:
//     // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin
//     // [TODO]: Revisit the eventing from this
//     copyWithin(target, start/*, end*/) {
//         // Steps 1-2.
//         if (this == null) {
//             throw new TypeError('this is null or not defined');
//         }

//         var O = Object(this);

//         // Steps 3-5.
//         var len = O.length >>> 0;

//         // Steps 6-8.
//         var relativeTarget = target >> 0;

//         var to = relativeTarget < 0 ?
//             Math.max(len + relativeTarget, 0) :
//             Math.min(relativeTarget, len);

//         // Steps 9-11.
//         var relativeStart = start >> 0;

//         var from = relativeStart < 0 ?
//             Math.max(len + relativeStart, 0) :
//             Math.min(relativeStart, len);

//         // Steps 12-14.
//         var end = arguments[2];
//         var relativeEnd = end === undefined ? len : end >> 0;

//         var final = relativeEnd < 0 ?
//             Math.max(len + relativeEnd, 0) :
//             Math.min(relativeEnd, len);

//         // Step 15.
//         var count = Math.min(final - from, len - to);

//         // Steps 16-17.
//         var direction = 1;

//         if (from < to && to < (from + count)) {
//             direction = -1;
//             from += count - 1;
//             to += count - 1;
//         }

//         var tempCount = count;
//         var tempFrom = from;
//         var tempTo = to;
//         var adds = [];
//         var removes = [];
//         while (tempCount > 0) {
//             if (tempFrom in O) {
//                 adds.push({ item: O[tempFrom], index: tempTo });
//             } else {
//                 removes.push({ item: O[tempTo], index: tempTo });
//             }

//             tempFrom += direction;
//             tempTo += direction;
//             tempCount--;
//         }

//         if(adds.length > 0) {
//             this._onReplacing(adds);
//         }

//         // Step 18.
//         while (count > 0) {
//             if (from in O) {
//                 O[to] = O[from];
//             } else {
//                 delete O[to];
//           }

//             from += direction;
//             to += direction;
//             count--;
//         }

//         if(removes.length > 0) {
//             this._onReplaced(removes);
//         }

//         // Step 19.
//         return O;
//     }

//     pop() {
//         if(this.length == 0) {
//             return undefined;
//         }

//         var change = {
//             item: this[this.legnth - 1],
//             index: this.length - 1
//         }

//         this._onRemoving(change);
//         var result = pop.call(this);
//         this._onRemoved(change);
//         return result;
//     }

//     push(items) {
//         if(arguments.length == 0) {
//             return this.length;
//         }

//         var change = [];
//         for(var i = 0; i < arguments.length; ++i) {
//             change.push({
//                 item: arguments[i],
//                 index: this.length + i
//             });
//         }

//         this._onAdding(change);
//         var result = push.apply(this, change.map(current => current.item));
//         this._onAdded(change);

//         return result;
//     }

//     reverse() {
//         if(this.length == 0) {
//             return;
//         }

//         var change = [];
//         for(var i = 0; i < this.length; ++i) {
//             change.push({
//                 item: this[i],
//                 index: this.length - 1 - i
//             });
//         }


//         this._onMoving(change);
//         var result = reverse.call(this);
//         this._onMoved(change);
//         return result;
//     }

//     shift() {
//         if(this.length == 0) {
//             return;
//         }

//         var change = { iten: this[0], index: 0 };
//         this._onRemoving(change);
//         var result = shift.call(this);
//         this._onRemoved(change);
//         return result;
//     }

//     splice(start, deleteCount) {
//         if(start < 0) {
//             start = Math.max(0, this.length + start);
//         } else if (start > this.length) {
//             start = this.length;
//         }

//         if(deleteCount < 0) {
//             return [];            
//         } else if (deleteCount == 0) {
//             // Adding
//             if(arguments.length <= 2) {
//                 return [];
//             }

//             var change = [];
//             for(var i = 2; i < arguments.length; ++i) {
//                 change.push({
//                     item: arguments[i],
//                     index: start + (i - 2)
//                 });
//             }

//             if(change.length == 0) {
//                 return [];
//             }

//             this._onAdding(change);

//             var args = [];
//             for(var i = 0; i < arguments.length; ++i) {
//                 args.push(arguments[i]);
//             }

//             var result = splice.apply(this, args);

//             this._onAdded(change);

//             return result;

//         } else {
//             // Removing
//             var change = [];

//             deleteCount = deleteCount || this.length;

//             if((deleteCount + start) > this.length) {
//                 deleteCount = this.length - start;
//             }

//             for(var i = 0; i < deleteCount; i++) {
//                 change.push({
//                     item: this[start + i],
//                     index: start + i
//                 });
//             }

//             if(change.length == 0) {
//                 return [];
//             }

//             this._onRemoving(change);

//             var args = [];
//             for(var i = 0; i < arguments.length; i++) {
//                 args.push(arguments[i]);
//             }

//             var result = splice.apply(this, args);

//             this._onRemoved(change);

//             return result;
//         }
//     }

//     unshift() {
//         if(arguments.length == 0) {
//             return this.length;
//         }

//         var change = [];
//         for(var i = 0; i < arguments.length; ++i) {
//             change.push({
//                 item: arguments[i],
//                 index: arguments.length - 1 - i
//             });
//         }

//         var args = [];
//         for(var i = 0; i < arguments.length; i++) {
//             args.push(arguments[i]);
//         }
//         this._onAdding(change);
//         var result = unshift.apply(this, args);
//         this._onAdded(change);
//         return result;
//     }
// }

// ObservableCollection.events = events;


// //-----------------------------------------------------------------------
// // Keeps multiple ObservableCollections in sync by using the
// // provided transformations. Call dispose on the returned sync object
// // to discontinue syncing between the collections.
// //
// // options {Object}
// //  master: {Object - ObservableCollection}
// //  slave: (optional) {Object - ObservableCollection}
// //      This field is optional. If not provided, will create a new colection
// //      and sync that one with the provided master.
// //  addSlaveItem: { function(masterItem, masterItemIndex) }
// //  removeSlaveItem: { function(slaveItem) }
// //  compare: { function(masterItem, slaveItem) returns true if they are equal }
// //-----------------------------------------------------------------------
// var sync = function sync(options) {
//     var syncObj = { };

//     syncObj.master = options.master;
//     syncObj.slave = options.slave || create();

//     syncObj.addSlaveItem = options.addSlaveItem ||
//         function(masterItem, masterIndex) { this.slave.insert(masterItem, masterIndex); }.bind(syncObj),

//     syncObj.removeSlaveItem = options.removeSlaveItem ||
//         function(slaveItem) { this.slave.remove(slaveItem); }.bind(syncObj),

//     syncObj.items_added = function(items) {
//         var self = this;
//         items.forEach(function(item) {
//             self.addSlaveItem(item.item, item.index);
//         });
//     }.bind(syncObj);


//     syncObj.items_removed = function(items) {
//             if(items.length == 1) {
//                 this.removeSlaveItem(options.slave.at(item.index));
//                 return;
//             }

//             // Remove from the end of the array as it's a safe delete
//             // Sort by highest index first
//             items.sort(function(a, b) {
//                 if(a.index < b.index) return 1;
//                 if(a.index > b.index) return -1;
//                 return 0;
//             });

//             for(var i = 0; i < items.length; i++) {
//                 var item = items[i];
//                 this.removeSlaveItem(this.slave.at(item.index));
//             }
//         }.bind(syncObj);

//     syncObj.dispose = function() {
//             this.master.remove(events.added, this.items_added);
//             this.master.remove(events.removed, this.items_removed);
//         };


//     // Do the synching
//     for(var i = 0; i < syncObj.master.length; i++) {
//         var isInMasterRange = i < syncObj.master.length;
//         var isInSlaveRange = i < syncObj.slave.length;

//         // Add to the slave
//         if (isInMasterRange && !isInSlaveRange) {
//             syncObj.addSlaveItem(syncObj.master.at(i), i);
//             continue;
//         }

//         // Remove from slave
//         if (isInSlaveRange && !isInMasterRange) {
//             syncObj.removeSlaveItem(syncObj.slave.at(i));
//             syncObj.slave.RemoveAt(i);
//             --i;
//             continue;
//         }

//         // Compare and make sure they are equal
//         if (isInMasterRange && isInSlaveRange) {
//             // If they are not equal, replace the slave item
//             if (!syncObj.compare(syncObj.master.at(i), syncObj.slave.at(i)))
//             {
//                 syncObj.removeSlaveItem(syncObj.slave.at(i));
//                 syncObj.addSlaveItem(syncObj.master.at(i), i);
//             }
//         }
//     }

//     syncObj.master.on(events.added, syncObj.items_added);
//     syncObj.master.on(events.removed, syncObj.items_removed);

//     return syncObj;
// }

// module.exports = ObservableCollection;
// ObservableCollection.events = events;
// ObservableCollection.sync = sync;


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

// Consider:
// Adding a mixin method, that will add the methods for an
// Observable collection. Add the following functions for overriding:
//  - _onAdding
//  - _onAdded
//  - _onRemoving
//  - _onRemoved


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