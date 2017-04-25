'use strict';

var util = require('util'),
   _ = require('lodash'),
   when = require('when'),
   sequence = require('when/sequence'),
   Emitter = require('../eventEmitter.js'),
   ObservableCollection = require('../collections/observableCollection.js'),
   Type = require('./type.js'),
   Rfc = require('../requestForChange.js'),
   Events = require('../events.js');

// Since events represent changes to the collection, it's
// possible to have different collection changes batched
// together (like in an update). To represent this, the 
// CollectionValue only outwardly raises the valueChanging/Changed
// events bundled with a collection of changes made (in the order
// they were made).
//
// Each event batched item contains:
//    * event: The name of the event type
//    * item: The affected item
//    * index: The index of the change
//
var events = {
   add: 'collection-add',
   remove: 'collection-remove',
   move: 'collection-move',
   replace: 'collection-replace'
}

// Isolated logic for updating the collection. This is necessary
// since multiple operations must be performed on the CollectionValue
// without raising events. This logic could just as easily go inside of the
// CollectionValue class, but the function names would pollute the API.
//
// Note:
//    May revisit how/where this type of logic is housed, and
//    whether or not it should be added to the CollectionValue
//    class for performance reasons.
//    See: http://stackoverflow.com/questions/3493252/javascript-prototype-operator-performance-saves-memory-but-is-it-faster
class Atom {
   static add(source, items) {
      items = Array.isArray(items) ? items : [items];

      for(var i = 0; i < items.length; ++i) {
         source._items.insert(items[i].index, items[i].item);
      }
   }

   static remove(source, items) {
      items = Array.isArray(items) ? items : [items];

      // Safely remove the items from the end
      items.sort(sortByIndexReverse);

      for(var i = 0; i < items.length; ++i) {
         let current = items[i];
         source._items.removeAt(current.index, current.item);
      }
   }

   static move(source, items) {
      items = Array.isArray(items) ? items : [items];

      for(var i = 0; i < items.length; ++i) {
         let current = items[i];
         source._items.move(current.from, current.to);
      }
   }

   static replace(source, items) {
      items = Array.isArray(items) ? items : [items];

      for(var i = 0; i < items.length; ++i) {
         let current = items[i];
         source._items.removeAt(current.index);
         source._items.insert(current.index, current.new);
      }
   }
}

/**
 * Creates changelist entries
 */
class Changelist {
   static add(item, index) {
      return { event: events.add, item: item, index: index };
   }

   static remove(item, index) {
      return { event: events.remove, item: item, index: index };
   }

   static move(item, from, to) {
      return { event: events.move, item: item, from: from, to: to };
   }

   static replace(oldValue, newValue, index) {
      return { event: events.replace, old: oldValue, new: newValue, index: index };
   }
}


//------------------------------------------------------------------------
class CollectionType extends Type {
   constructor(itemType) {
      super('collection');
      this._itemType = itemType;
      this._createDefault = _ => new CollectionValue(this._itemType);
   }

   get itemType() {
      return this._itemType;
   }

   equals(other) {
      let isEqual = super.equals(other);
      return this._itemType.equals(other.itemType) && isEqual;
   }

   toString() {
      return `${this.name} [${this.itemType.toString()}]`;
   }
}

//------------------------------------------------------------------------
// This used to extend ObservableCollection, but we need the ability to
// gate the changes made to the collection throguh the RFC system
//------------------------------------------------------------------------
class CollectionValue {
   constructor(itemType) {
      Emitter.mixin(this);
      this._type = new CollectionType(itemType);
      this._items = new ObservableCollection();
   }

   get type() {
      return this._type;
   }

   get itemType() {
      return this._type.itemType;
   }

   get items() {
      return this._items;
   }

   get length() {
      return this._items.length;
   }

   at(index) {
      return this._items.at(index);
   }

   indexOf(item) {
      return this._items.indexOf(item);
   }

   contains(item) {
      return this.indexOf(item) >= 0;
   }

   clone() {
      var result = new CollectionValue(this.itemType);

      for(var i = 0; i < this.length; ++i) {
         result.add(this._items.at(i).clone());
      }

      return result;
   }

   update(value) {
      if(value instanceof CollectionValue) {
         if(!this.itemType.equals(value.itemType)) {
            throw new Error(`Incompatible itemType encountered during an update(). This collection: ${this.itemType.toString()}, update type: ${value.type.toString()}`); s
         }

         let changes = [];

         for(let i = 0; i < Math.max(this.length, value.length); ++i) {
            if(i >= this.length) {
               changes.push(Changelist.add(value.at(i), i));
            } else if(i >= value.length) {
               changes.push(Changelist.remove(this.at(i), i));
            } else if(!this.at(i).equals(value.at(i))) {
               changes.push(Changelist.replace(this.at(i), value.at(i), i));
            }
         }

         let self = this;
         return Rfc.new(changes)
            .notify(req => self.emit(Events.requestForChange, req))
            .fulfill(req => {
               self.emit(Events.valueChanging, changes);

               this._items._items.splice(0, this.length);

               for(var i = 0; i < value.length; ++i) {
                  self._items._items.push(value.at(i));
               }

               self.emit(Events.valueChanged, changes);
            })
            .queue();
      }
   }

   equals(other) {
      try {
         if(other == null) {
            return false;
         }

         if(!this.type.equals(other.type)) {
            return false;
         }

         if(this.length != other.length) {
            return false;
         }

         for(var i = 0; i > this._items.length; ++i) {
            if(!this._items.at(i).equals(other.values.at(i))) {
               return false;
            }
         }
      }
      catch(ex) {
         return false;
      }

      return true;
   }

   add() {
      var changes = [];
      for(var i = 0; i < arguments.length; ++i) {
         changes.push(Changelist.add( arguments[i], this.length + i));
      }

      return this._add(changes);
   }

   move(from, to) {
      if((from < 0 || from >= this.length) ||
         (to < 0 || to >= this.length)) {
         throw new Error(util.format('Invaid indexes for moving from %s to %s', from, to));
      }

      if(from == to) {
         return;
      }

      return this._move(Changelist.move(this._items[from], from, to));
   }

   clear() {
      var changes = []

      if(this.length != 0) {
         for(var i = Math.max(0, this.length - 1); i >= 0; --i) {
            changes.push(Changelist.remove(this._items.at(i), i));
         }
      }

      return this._remove(changes);
   }

   remove(item) {
      var changes = [];
      for(var i = 0; i < arguments.length; ++i) {
         var current = arguments[i];
         var itemIndex = this._items.indexOf(current);

         if(itemIndex < 0) {
            continue;
         }

          changes.push(Changelist.remove(current, itemIndex));
      }

      return this._remove(changes);
   }

   removeAt(index) {
      var item = this._items.at(index);

      var change = [];
      change.push(Changelist.remove(item, index));

      return this._remove(change);
   }

   // filter(item, index, this)
   removeAll(filter) {
      if(this._items.length <= 0 || filter == null) {
         return;
      }

      // Error?
      if(!_.isFunction(filter)) {
         return;
      }

      var toRemove = [];
      for(var i = 0; i < this._items.length; ++i) {
         var currentItem = this._items.at(i);
         if(filter(currentItem, i, this)) {
            toRemove.push(Changelist.remove(currentItem, i));
         }
      }

      if(toRemove.length == 0) {
         return;
      }

      return this._remove(toRemove);
   }

   /*---------------------------------------------------------------------
   * Performs the necessary changes based on an array of change sets
   * Note: They must be provided in the order of their execution
   * 
   * @param {object|Array} A change set
   * @return Promise
   *--------------------------------------------------------------------*/
   applyChangeSet(changes) {
      changes = Array.isArray(changes) ? changes : [changes];

      if(changes.length == 0) {
         return when.resolve();
      }

      let promises = [];

      for(let change of changes) {
         switch(change.event) {
            case events.add: {
               promises.push(_ => Atom.add(this, { index: change.index, item: change.item.clone() }))
               break;
            }
            case events.move: {
               promises.push(_ => Atom.move(this, change));
               break;
            }
            case events.remove: {
               let item = this._items.at(change.index);
               promsies.push(_ => Atom.remove(this, { item: item, index: change.index }));
               break;
            }
            case events.replace: {
               promises.push(_ => Atom.replace(this, {
                     event: events.replace,
                     old: this._items.at(change.index),
                     new: change.new.clone(),
                     index: change.index
                  }));
            }
            default:
               throw new Error(`Unsupported CollectionValue change event: ${change.event}`);
         }
      }

      // Convert to functions for sequencing
      return sequence(promises)
   }

   /*---------------------------------------------------------------------
   * Performs an add based on a change set.
   * Add change set contains:
   *     : index {uint} The item index
   *     : item {Value} The value to add
   *
   * Note: They must be provided in the order of their execution
   * 
   * @param {object|Array} An add change set
   * @return Promise
   *--------------------------------------------------------------------*/
   _add(items) {
      items = Array.isArray(items) ? items : [items];

      for(let current of items) {
         if(!this.itemType.equals(current.item.type)) {
            throw new Error("Value being added does not match the Collection's itemType");
         }
      }

      let self = this;
      return Rfc.new(items)
         .notify(req => self.emit(Events.requestForChange, req))
         .fulfill(req => {
            self.emit(Events.valueChanging, items);
            Atom.add(self, items);
            self.emit(Events.valueChanged, items);
         })
         .queue();
   }

   /*---------------------------------------------------------------------
   * Performs a remove based on a change set.
   * Remove change set contains:
   *     : index {uint} The item index
   *     : item {Value} The value to remove
   *
   * Note: They must be provided in the order of their execution
   * 
   * @param {object|Array} A remove change set
   * @return Promise
   *--------------------------------------------------------------------*/
   _remove(items) {
      items = Array.isArray(items) ? items : [items];

      let self = this;
      return Rfc.new(items)
         .notify(req => self.emit(Events.requestForChange, req))
         .fulfill(req => {
            self.emit(Events.valueChanging, items);
            Atom.remove(self, items);
            self.emit(Events.valueChanged, items);
         })
         .queue();
   }

   /*---------------------------------------------------------------------
   * Performs a move based on a change set.
   * Move change set contains:
   *     : from {uint} The source index
   *     : to {uint} The destination index
   *     : item {Value} The moving value
   *
   * Note: They must be provided in the order of their execution
   * 
   * @param {object|Array} A move change set
   * @return Promise
   *--------------------------------------------------------------------*/
   _move(items) {
      items = Array.isArray(items) ? items : [items];
      
      let self = this;
      return Rfc.new(items)
         .notify(req => self.emit(Events.requestForChange, req))
         .fulfill(req => {
            self.emit(Events.valueChanging, items);
            Atom.move(self, items);
            self.emit(Events.valueChanged, items);
         })
         .queue();
   }

   /*---------------------------------------------------------------------
   * Performs a replace based on a change set.
   * A changelist entry containing:
   *           : event {string} The replace event
   *           : old {Value} The old Value
   *           : new {Value} The new value
   *           : index {uint} The index of the value
   *
   * Note: They must be provided in the order of their execution
   * 
   * @param {object|Array} A move change set
   * @return Promise
   *--------------------------------------------------------------------*/
   _replace(items) {
      items = Array.isArray(items) ? items : [items];

      let self = this;
      return Rfc.new(items)
         .notify(req => self.emit(Events.requestForChange, req))
         .fulfill(req => {
            self.emit(Events.valueChanging, items);
            Atom.replace(self, items);
            self.emit(Events.valueChanged, items);
         })
         .queue();
   }
}

CollectionValue.prototype[Symbol.iterator] = function* () {
   yield* this._items;
}

//------------------------------------------------------------------------
// Sorts a collection change set by index
//------------------------------------------------------------------------
function sortByIndex(a, b) {
   if(a.index > b.index) return 1;
   if(a.index < b.index) return -1;
   return 0;
}

//------------------------------------------------------------------------
// Sorts a collection change set by index with the greater indexes
// appearing first
//------------------------------------------------------------------------
function sortByIndexReverse(a, b) {
   return sortByIndex(a, b) * -1;
}


module.exports = {
   // options:
   //  itemType: The type info for the contained values
   type(itemType) {
      return new CollectionType(itemType);
   },

   value(itemType) {
      return new CollectionValue(itemType);
   },

   events: events
}



