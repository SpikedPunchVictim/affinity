'use strict';

var util = require('util');
var _ = require('lodash');
var ObservableCollection = require('../collections/observableCollection.js');
var Type = require('./type.js');
var RequestForChange = require('../requestForChange.js');
var Events = require('../events.js');

var events = {
    adding: 'collection-adding',
    added: 'collection-added',
    moving: 'collection-moving',
    moved: 'collection-moved',
    removing: 'collection-removing',
    removed: 'collection-removed'
}

//------------------------------------------------------------------------
class CollectionType extends Type {
    constructor(itemType) {
        super('collection');
        this._itemType = itemType;
    }
    
    get itemType() {
        return this._itemType;
    }
    
    equals(other) {
        let isEqual = super.equals(other);
        return this._itemType.equals(other.itemType) && isEqual;
    }
}

//------------------------------------------------------------------------
// This used to extend ObservableCollection, but we need the ability to
// gate the changes made to the collection throguh the RFC system
//------------------------------------------------------------------------
class CollectionValue {
    constructor(itemType) {
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
    
    clone() {
        var result = new CollectionValue(this.itemType);
        
        for(var i = 0; i < this.length; ++i) {
            result.add(this._items[i].clone());
        }
        
        return result;
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
        var change = [];
        for(var i=0; i < arguments.length; ++i) {
            change.push({
                item: arguments[i],
                index: this.length + i
            });
        }
        
        this._add(change);
    }
    
    move(from, to) {
        if((from < 0 || from >= this.length) ||
          (to < 0 || to >= this.length)) {
            throw new Error(util.format('Invaid indexes for moving from %s to %s', from, to));
          }

          if(from == to) {
            return;
          }

          var change = {
            from: from,
            to: to,
            item: this._items[from]
          };

          this._move(change);
    }
    
    clear() {
        var change = []
        for(var i = 0; i < this._items.length; ++i) {
            change.push({
                item: this._items[i],
                index: i
            });
        }
        
        this._remove(change);
    }

    remove(item) {
        var change = []
        for(var i = 0; i < arguments.length; ++i) {
            var current = arguments[i];
            var itemIndex = this._items.indexOf(current);

            if(itemIndex < 0) {
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
        var item = this._items[index];

        var change = [];
        change.push({
                item: item,
                index: index
            });
            
        this._remove(change);
    }
    
    removeAll(filter) {
        if(this._items.length <= 0 || filter == null || filter === undefined) {
            return;
        }
        
        // Error?
        if(!_.isFunction(filter)) {
            return;
        }
        
        var toRemove = [];
        for(var i = 0; i < this._items.length; ++i) {
            var currentItem = this._items[i];
            if(filter(currentItem, i, this)) {
                toRemove.push({
                    item: currentItem,
                    index: i
                });
            }
        }
        
        if(toRemove.length == 0) {
            return;
        }
        
        this._remove(toRemove);
    }

    _add(items) {
        for(let current in items) {
            if(!this.itemType.equals(current.item.type)) {
                throw new Error("Value being added does not match the Collection's itemType");
            }
        }

        var req = this._toRfc(events.adding, items);

        req.fulfilled(this, changed => {
            this.emit(events.adding, items);
            this.emit(Events.valueChanging, items);

            items.sort(sortByIndex);
                        
            for(var i = 0; i < items.length; ++i) {
                this._items.insert(items[i].index, items[i].item);
            }
            
            this.emit(events.added, items);
            this.emit(Events.valueChanged, items);
        });
        
        this.emit(Events.requestForChange, req);
    }
    
    _remove(items) {        
        var req = this._toRfc(events.removing, items);
        
        req.fullfilled(this, items => {
            this.emit(events.removing, items);
            this.emit(Events.valueChanging, items);
            
            // Safely remove the items from the end
            items.sort(sortByIndexReverse);
            
            for(var i = 0; i < items.length; ++i) {
                let current = items[i];
                this._items.removeAt(current.index, current.item);
            }
            
            this.emit(events.removed, items);
            this.emit(Events.valueChanged, items);          
        });
        
        this.emit(Events.requestForChange, req);
    }
    
    // Each item contains:
    //  from: from index
    //  to: to index
    //  item: the item
    //
    // They are provided in the order of their execution
    _move(items) {
        var req = this._toRfc(events.moving, items);
        
        req.fulfilled(this, items => {
            this.emit(events.moving, items);
            this.emit(Events.valueChanging, items);
            
            for(var i = 0; i < items.length; ++i) {
                let current = items[i];
                this._items.removeAt(current.from);
                this._items.insert(current.to, current.item);
            }
            
            this.emit(events.moved, items);
            this.emit(Events.valueChanging, items); 
        });
        
        this.emit(Events.requestForChange, req);
    }

    _toRfc(event, changes) {
        var req = {
            event: event,
            changes: changes
        };

        return new RequestForChange(this, req);
    }
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
    type(options) {
        return new CollectionType(options);
    },
    
    create(itemType) {
        return new CollectionValue(itemType);
    },
    
    events: events
}



