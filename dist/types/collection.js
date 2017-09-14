'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
};
var Atom = function () {
   function Atom() {
      (0, _classCallCheck3.default)(this, Atom);
   }

   (0, _createClass3.default)(Atom, null, [{
      key: 'add',
      value: function add(source, items) {
         items = Array.isArray(items) ? items : [items];

         for (var i = 0; i < items.length; ++i) {
            source._items.insert(items[i].index, items[i].item);
         }
      }
   }, {
      key: 'remove',
      value: function remove(source, items) {
         items = Array.isArray(items) ? items : [items];

         // Safely remove the items from the end
         items.sort(sortByIndexReverse);

         for (var i = 0; i < items.length; ++i) {
            var current = items[i];
            source._items.removeAt(current.index, current.item);
         }
      }
   }, {
      key: 'move',
      value: function move(source, items) {
         items = Array.isArray(items) ? items : [items];

         for (var i = 0; i < items.length; ++i) {
            var current = items[i];
            source._items.move(current.from, current.to);
         }
      }
   }, {
      key: 'replace',
      value: function replace(source, items) {
         items = Array.isArray(items) ? items : [items];

         for (var i = 0; i < items.length; ++i) {
            var current = items[i];
            source._items.removeAt(current.index);
            source._items.insert(current.index, current.new);
         }
      }
   }]);
   return Atom;
}();

/**
 * Creates changelist entries
 */


var Changelist = function () {
   function Changelist() {
      (0, _classCallCheck3.default)(this, Changelist);
   }

   (0, _createClass3.default)(Changelist, null, [{
      key: 'add',
      value: function add(item, index) {
         return { event: events.add, item: item, index: index };
      }
   }, {
      key: 'remove',
      value: function remove(item, index) {
         return { event: events.remove, item: item, index: index };
      }
   }, {
      key: 'move',
      value: function move(item, from, to) {
         return { event: events.move, item: item, from: from, to: to };
      }
   }, {
      key: 'replace',
      value: function replace(oldValue, newValue, index) {
         return { event: events.replace, old: oldValue, new: newValue, index: index };
      }
   }]);
   return Changelist;
}();

//------------------------------------------------------------------------


var CollectionType = function (_Type) {
   (0, _inherits3.default)(CollectionType, _Type);

   function CollectionType(itemType) {
      (0, _classCallCheck3.default)(this, CollectionType);

      var _this = (0, _possibleConstructorReturn3.default)(this, (CollectionType.__proto__ || Object.getPrototypeOf(CollectionType)).call(this, 'collection'));

      _this._itemType = itemType;
      _this._createDefault = function (_) {
         return new CollectionValue(_this._itemType);
      };
      return _this;
   }

   (0, _createClass3.default)(CollectionType, [{
      key: 'equals',
      value: function equals(other) {
         var isEqual = (0, _get3.default)(CollectionType.prototype.__proto__ || Object.getPrototypeOf(CollectionType.prototype), 'equals', this).call(this, other);
         return this._itemType.equals(other.itemType) && isEqual;
      }
   }, {
      key: 'toString',
      value: function toString() {
         return this.name + ' [' + this.itemType.toString() + ']';
      }
   }, {
      key: 'itemType',
      get: function get() {
         return this._itemType;
      }
   }]);
   return CollectionType;
}(Type);

//------------------------------------------------------------------------
// This used to extend ObservableCollection, but we need the ability to
// gate the changes made to the collection throguh the RFC system
//------------------------------------------------------------------------


var CollectionValue = function () {
   function CollectionValue(itemType) {
      (0, _classCallCheck3.default)(this, CollectionValue);

      Emitter.mixin(this);
      this._type = new CollectionType(itemType);
      this._items = new ObservableCollection();
   }

   (0, _createClass3.default)(CollectionValue, [{
      key: 'at',
      value: function at(index) {
         return this._items.at(index);
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
   }, {
      key: 'clone',
      value: function clone() {
         var result = new CollectionValue(this.itemType);

         for (var i = 0; i < this.length; ++i) {
            result.add(this._items.at(i).clone());
         }

         return result;
      }
   }, {
      key: 'update',
      value: function update(value) {
         var _this2 = this;

         if (value instanceof CollectionValue) {
            if (!this.itemType.equals(value.itemType)) {
               throw new Error('Incompatible itemType encountered during an update(). This collection: ' + this.itemType.toString() + ', update type: ' + value.type.toString());s;
            }

            var changes = [];

            for (var i = 0; i < Math.max(this.length, value.length); ++i) {
               if (i >= this.length) {
                  changes.push(Changelist.add(value.at(i), i));
               } else if (i >= value.length) {
                  changes.push(Changelist.remove(this.at(i), i));
               } else if (!this.at(i).equals(value.at(i))) {
                  changes.push(Changelist.replace(this.at(i), value.at(i), i));
               }
            }

            var self = this;
            return Rfc.new(changes).notify(function (req) {
               return self.emit(Events.requestForChange, req);
            }).fulfill(function (req) {
               self.emit(Events.valueChanging, changes);

               _this2._items._items.splice(0, _this2.length);

               for (var i = 0; i < value.length; ++i) {
                  self._items._items.push(value.at(i));
               }

               self.emit(Events.valueChanged, changes);
            }).queue();
         }
      }
   }, {
      key: 'equals',
      value: function equals(other) {
         try {
            if (other == null) {
               return false;
            }

            if (!this.type.equals(other.type)) {
               return false;
            }

            if (this.length != other.length) {
               return false;
            }

            for (var i = 0; i > this._items.length; ++i) {
               if (!this._items.at(i).equals(other.values.at(i))) {
                  return false;
               }
            }
         } catch (ex) {
            return false;
         }

         return true;
      }
   }, {
      key: 'add',
      value: function add() {
         var changes = [];
         for (var i = 0; i < arguments.length; ++i) {
            changes.push(Changelist.add(arguments[i], this.length + i));
         }

         return this._add(changes);
      }
   }, {
      key: 'move',
      value: function move(from, to) {
         if (from < 0 || from >= this.length || to < 0 || to >= this.length) {
            throw new Error(util.format('Invaid indexes for moving from %s to %s', from, to));
         }

         if (from == to) {
            return;
         }

         return this._move(Changelist.move(this._items[from], from, to));
      }
   }, {
      key: 'clear',
      value: function clear() {
         var changes = [];

         if (this.length != 0) {
            for (var i = Math.max(0, this.length - 1); i >= 0; --i) {
               changes.push(Changelist.remove(this._items.at(i), i));
            }
         }

         return this._remove(changes);
      }
   }, {
      key: 'remove',
      value: function remove(item) {
         var changes = [];
         for (var i = 0; i < arguments.length; ++i) {
            var current = arguments[i];
            var itemIndex = this._items.indexOf(current);

            if (itemIndex < 0) {
               continue;
            }

            changes.push(Changelist.remove(current, itemIndex));
         }

         return this._remove(changes);
      }
   }, {
      key: 'removeAt',
      value: function removeAt(index) {
         var item = this._items.at(index);

         var change = [];
         change.push(Changelist.remove(item, index));

         return this._remove(change);
      }

      // filter(item, index, this)

   }, {
      key: 'removeAll',
      value: function removeAll(filter) {
         if (this._items.length <= 0 || filter == null) {
            return;
         }

         // Error?
         if (!_.isFunction(filter)) {
            return;
         }

         var toRemove = [];
         for (var i = 0; i < this._items.length; ++i) {
            var currentItem = this._items.at(i);
            if (filter(currentItem, i, this)) {
               toRemove.push(Changelist.remove(currentItem, i));
            }
         }

         if (toRemove.length == 0) {
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

   }, {
      key: 'applyChangeSet',
      value: function applyChangeSet(changes) {
         var _this3 = this;

         changes = Array.isArray(changes) ? changes : [changes];

         if (changes.length == 0) {
            return when.resolve();
         }

         var promises = [];

         var _iteratorNormalCompletion = true;
         var _didIteratorError = false;
         var _iteratorError = undefined;

         try {
            var _loop = function _loop() {
               var change = _step.value;

               switch (change.event) {
                  case events.add:
                     {
                        promises.push(function (_) {
                           return Atom.add(_this3, { index: change.index, item: change.item.clone() });
                        });
                        break;
                     }
                  case events.move:
                     {
                        promises.push(function (_) {
                           return Atom.move(_this3, change);
                        });
                        break;
                     }
                  case events.remove:
                     {
                        var item = _this3._items.at(change.index);
                        promsies.push(function (_) {
                           return Atom.remove(_this3, { item: item, index: change.index });
                        });
                        break;
                     }
                  case events.replace:
                     {
                        promises.push(function (_) {
                           return Atom.replace(_this3, {
                              event: events.replace,
                              old: _this3._items.at(change.index),
                              new: change.new.clone(),
                              index: change.index
                           });
                        });
                     }
                  default:
                     throw new Error('Unsupported CollectionValue change event: ' + change.event);
               }
            };

            for (var _iterator = changes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
               _loop();
            }

            // Convert to functions for sequencing
         } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
         } finally {
            try {
               if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
               }
            } finally {
               if (_didIteratorError) {
                  throw _iteratorError;
               }
            }
         }

         return sequence(promises);
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

   }, {
      key: '_add',
      value: function _add(items) {
         items = Array.isArray(items) ? items : [items];

         var _iteratorNormalCompletion2 = true;
         var _didIteratorError2 = false;
         var _iteratorError2 = undefined;

         try {
            for (var _iterator2 = items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
               var current = _step2.value;

               if (!this.itemType.equals(current.item.type)) {
                  throw new Error("Value being added does not match the Collection's itemType");
               }
            }
         } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
         } finally {
            try {
               if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
               }
            } finally {
               if (_didIteratorError2) {
                  throw _iteratorError2;
               }
            }
         }

         var self = this;
         return Rfc.new(items).notify(function (req) {
            return self.emit(Events.requestForChange, req);
         }).fulfill(function (req) {
            self.emit(Events.valueChanging, items);
            Atom.add(self, items);
            self.emit(Events.valueChanged, items);
         }).queue();
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

   }, {
      key: '_remove',
      value: function _remove(items) {
         items = Array.isArray(items) ? items : [items];

         var self = this;
         return Rfc.new(items).notify(function (req) {
            return self.emit(Events.requestForChange, req);
         }).fulfill(function (req) {
            self.emit(Events.valueChanging, items);
            Atom.remove(self, items);
            self.emit(Events.valueChanged, items);
         }).queue();
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

   }, {
      key: '_move',
      value: function _move(items) {
         items = Array.isArray(items) ? items : [items];

         var self = this;
         return Rfc.new(items).notify(function (req) {
            return self.emit(Events.requestForChange, req);
         }).fulfill(function (req) {
            self.emit(Events.valueChanging, items);
            Atom.move(self, items);
            self.emit(Events.valueChanged, items);
         }).queue();
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

   }, {
      key: '_replace',
      value: function _replace(items) {
         items = Array.isArray(items) ? items : [items];

         var self = this;
         return Rfc.new(items).notify(function (req) {
            return self.emit(Events.requestForChange, req);
         }).fulfill(function (req) {
            self.emit(Events.valueChanging, items);
            Atom.replace(self, items);
            self.emit(Events.valueChanged, items);
         }).queue();
      }
   }, {
      key: 'type',
      get: function get() {
         return this._type;
      }
   }, {
      key: 'itemType',
      get: function get() {
         return this._type.itemType;
      }
   }, {
      key: 'items',
      get: function get() {
         return this._items;
      }
   }, {
      key: 'length',
      get: function get() {
         return this._items.length;
      }
   }]);
   return CollectionValue;
}();

CollectionValue.prototype[Symbol.iterator] = /*#__PURE__*/_regenerator2.default.mark(function _callee() {
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

//------------------------------------------------------------------------
// Sorts a collection change set by index
//------------------------------------------------------------------------
function sortByIndex(a, b) {
   if (a.index > b.index) return 1;
   if (a.index < b.index) return -1;
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
   type: function type(itemType) {
      return new CollectionType(itemType);
   },
   value: function value(itemType) {
      return new CollectionValue(itemType);
   },


   events: events
};