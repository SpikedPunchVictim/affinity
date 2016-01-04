var util = require('util');
var _ = require('lodash');
var helpers = require('../helpers.js');
var Emitter = require('../eventEmitter.js');
var ObservableCollection = require('../collections/observableCollection.js');
var TypeCommon = require('./common.js');
var Type = TypeCommon.Type;
var ModelMember = require('../modelMember.js');
var CommonCollection = require('../collections/commonCollection.js');
var Commands = require('../commands.js');

var events = {
    rfcAdd: 'collection-request-for-change-add',
    rfcRemove: 'collection-request-for-change-remove',
    rfcMove: 'collection-request-for-change-move'
}

//------------------------------------------------------------------------
class CollectionAddRfcCommand extends Commands.RfcCommand {
    constructor(collectionValue, items) {
        super();
        this._collectionValue = collectionValue;
        this._items = items;
    }
    
    apply() {
        this._collectionValue._addRfc(this._items);
    }
    
    unapply() {
        this._collectionValue._removeRfc(this._items);
    }
}

//------------------------------------------------------------------------
class CollectionRemoveRfcCommand extends Commands.RfcCommand {
    constructor(collectionValue, items) {
        super();
        this._collectionValue = collectionValue;
        this._items = items;
    }
    
    apply() {
        this._collectionValue._removeRfc(this._items);
    }
    
    unapply() {
        this._collectionValue._addRfc(this._items);
    }
}

//------------------------------------------------------------------------
class CollectionMoveRfcCommand extends Commands.RfcCommand {
    constructor(collectionValue, items) {
        super();
        this._collectionValue = collectionValue;
        this._items = items;
    }
    
    apply() {
        this._collectionValue._moveRfc(this._items);
    }
    
    unapply() {
        var undoMoves = this._items.map(item => {
            return {
                from: item.to,
                to: item.from,
                item: item
            }
        });
        
        this._collectionValue._moveRfc(undoMoves);
    }
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
    
    // Overwrite the base, and generate a request-for-change command
    _add(items) {
        this.emit(events.rfcAdd, new CollectionAddRfcCommand(this, items));
    }
    
    _remove(items) {
        this.emit(events.rfcRemove, new CollectionRemoveRfcCommand(this, items));
    }
    
    _move(items) {
        this.emit(events.rfcMove, new CollectionMoveRfcCommand(this, items));
    }
    
    _addRfc(items) {
        super._add(items);
    }
    
    _removeRfc(items) {
        super._remove(items);
    }
    
    _moveRfc(items) {
        super._move(items);
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



