'use strict';

var util = require('util');
var _ = require('lodash');
var ObservableCollection = require('../collections/observableCollection.js');
var TypeCommon = require('./type.js');
var Type = TypeCommon.Type;
var Commands = require('../commands.js');

var events = {
    rfcAdd: 'collection-request-for-change-add',
    rfcRemove: 'collection-request-for-change-remove',
    rfcMove: 'collection-request-for-change-move'
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
class CollectionValue extends ObservableCollection {
    constructor(options) {
        
        if(options == null || options.itemType == null) {
            throw Error('Must suplly an option with an itemType to create a collection')
        }
            
        super();
        this._type = new CollectionType(options.itemType);        
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
            result._addRfc(this._items[i].clone());
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
        super._onAdding(items);
        this.emit(events.valueChanging, items);
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



