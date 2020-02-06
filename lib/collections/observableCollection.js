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

const { EventBus } = require('../eventEmitter')
class ObservableCollection {
   constructor() {
      // EventEmitter.mixin(this);
      EventBus.patch(this)
      this._items = [];
   }

   static get events() {
      return events;
   }

   get length() {
      return this._items.length;
   }

   at(index) {
      return this._items[index];
   }

   forEach(visit) {
      return this._items.forEach(visit)
   }

   map(visit) {
      return this._items.map(visit)
   }

   indexOf(item) {
      return this._items.indexOf(item);
   }

   contains(item) {
      return this.indexOf(item) >= 0;
   }

   // filter(item, index, collection)
   find(filter) {
      return _.find(this._items, filter, this);
   }

   // filter(item, index, collection)
   filter(filter) {
      return _.filter(this._items, filter, this);
   }

   insert(index, item) {
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

   add() {
      var change = [];
      for (var i = 0; i < arguments.length; ++i) {
         change.push({
            item: arguments[i],
            index: this.length + i
         });
      }

      this._add(change);
   }

   move(from, to) {
      if ((from < 0 || from >= this.length) ||
         (to < 0 || to >= this.length)) {
         throw new Error(`Invalid indexes for moving from ${from} to ${to}`);
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

   clear() {
      var change = []
      for (var i = 0; i < this._items.length; ++i) {
         change.push({
            item: this._items[i],
            index: i
         });
      }

      this._remove(change);
   }

   remove(item) {
      var change = []
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

   removeAt(index) {
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
   removeAll(filter) {
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
   sub(subs) {
      return EventEmitter.sub(this, subs);
   }

   // subscribes to all items (and future items) in collection
   subItems(subs) {
      var listener = new Listener(this);

      subs.forEach(item => {
         listener.on(item.event, item.handler);
      });

      return listener;
   }

   // Each item contains
   //  index: item's index
   //  item: the item
   //
   // Order is not necessary.
   _add(items) {
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
   _remove(items) {
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
   _move(items) {
      this._onMoving(items);

      for (var i = 0; i < items.length; ++i) {
         let current = items[i];
         this._items.splice(current.from, 1);
         this._items.splice(current.to, 0, current.item);
      }

      this._onMoved(items);
   }

   _onAdding(items) {
      this._onValidateAdding(items);
      this.emit(events.adding, items);
   }
   _onAdded(items) {
      this.emit(events.added, items);
   }
   _onRemoving(items) {
      this.emit(events.removing, items);
   }
   _onRemoved(items) {
      this.emit(events.removed, items);
   }
   _onMoving(items) {
      this.emit(events.moving, items);
   }
   _onMoved(items) {
      this.emit(events.moved, items);
   }

   _onValidateAdding(items) {
      // Blank
   }
}

// Expressing Symbol.iterator cannot be a lambda. It must be a 'function'.
ObservableCollection.prototype[Symbol.iterator] = function* () {
   yield* this._items;
}

//
// This class assists in subscribers interested in listening
// to events on the ObservableCollection as well as the items
// in the collection.
//
class Listener {
   constructor(observableCollection) {
      this._source = observableCollection;
      this._subscriptionMap = new Map();
      observableCollection.on(events.added, this._onAdded.bind(this));
      observableCollection.on(events.removed, this._onRemoved.bind(this));
   }

   get collection() {
      return this._source;
   }

   on(event, handler) {
      var key = event.toLowerCase();
      var handlers = null;

      handlers = this._subscriptionMap.get(key);

      if (!handlers) {
         handlers = [];
         this._subscriptionMap.set(key, handlers);
      }

      handlers.push(handler);

      for (var i = 0; i < this._source.length; ++i) {
         let current = this._source.at(i);
         current.on(event, handler);
      }
   }

   off() {
      for (var i = 0; i < this._source.length; ++i) {
         let current = this._source.at(i);

         this._subscriptionMap.forEach((handlers, event) => {
            handlers.forEach(h => current.off(event, h));
         });
      }
   }

   _onAdded(items) {
      for (var i = 0; i < items.length; ++i) {
         let current = items[i];

         this._subscriptionMap.forEach((handlers, event) => {
            handlers.forEach(h => current.item.on(event, h));
         });
      }
   }

   _onRemoved(items) {
      for (var i = 0; i < items.length; ++i) {
         let current = items[i];

         this._subscriptionMap.forEach((handlers, event) => {
            handlers.forEach(h => current.item.off(event, h));
         });
      }
   }
}

ObservableCollection.prototype.Listener = Listener;
module.exports = ObservableCollection;