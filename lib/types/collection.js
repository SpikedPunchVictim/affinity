'use strict';

var util = require('util');
var _ = require('lodash');
var ObservableCollection = require('../collections/observableCollection.js');
var Type = require('./type.js');
var Commands = require('../commands.js');
var RequestForChange = require('../requestForChange.js');

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
class CollectionValue {
    constructor(options) {
        
        if(options == null || options.itemType == null) {
            throw Error('Must suplly an option with an itemType to create a collection')
        }

        this._type = new CollectionType(options.itemType);
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

    _add(items) {
        for(let current in items) {
            if(!this.itemType.equals(current.item.type)) {
                throw new Error("Value being added does not match the Collection's itemType");
            }
        }

        var changed = {
            event: events.adding,
            changes: items
        };

        var request = this._toRfc(this, changed);

        request.fulfilled(changed => {

        })
        .rejected(changed => {

        });

    }

    _toRfc(event, changes) {
        var req = {
            event: event,
            changes: changes
        };

        return new RequestForChange(this, req);
    }


    /*
    
    add() {
        
    }


    move(from, to) {
        if((from < 0 || from >= this.length) ||
          (to < 0 || to >= this.length)) {
            return this.emit('error', util.format('Invaid indexes for moving from %s to %s', from, to));
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
            return false;
        }
        
        // Error?
        if(!_.isFunction(filter)) {
            return false;
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
            return false;
        }
        
        this._remove(toRemove);
        return true;  
    }
    */
    
    _onValidateAdding(items) {
        for(var item in items) {
            try {
                if(!this._itemType.equals(item.type)) {
                    this.emit('error', new Error("The added item's type does not match the collection's itemType. None of the items will be added"), item);
                    return false;
                }
            } catch (ex) {
                this.emit('error', new Error(util.format("Item cannot be added to the collection. Reason: %s", ex)), item);
                return false;
            }
        }
        
        return true;
    }

    _onAdding(items) {
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
}


exports = {
    // options:
    //  itemType: The type info for the contained values
    type(options) {
        return new CollectionType(options);
    },
    
    create(options) {
        return new CollectionValue(options);
    },
    
    events: events
}



