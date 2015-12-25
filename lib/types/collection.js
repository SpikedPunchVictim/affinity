var util = require('util');
var _ = require('lodash');
var helpers = require('../helpers.js');
var Emitter = require('../eventEmitter.js');
var ObservableCollection = require('../collections/observableCollection.js');
var Type = require('./type.js');
var CommonCollection = require('../collections/commonCollection.js');

module.exports.type = type;
module.exports.create = create;

var typeEquals = function equals(other) {
    try {
        if(this.name !== other.name ||
            other.name !== 'collection' ||
            !this.itemType.equals(other.itemType)) {
            return false;
        }
    } catch (ex) {
        return false;
    }
    
    return true;
}

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

class CollectionValue {
    constructor(itemType) {
        this._type = new CollectionType(itemType);
        
    }
    
    get type() {
        return this._type;
    }
    
    get itemType() {
        return this._type.itemType;
    }
}

function type(itemType) {
    return Types.create({name: 'collection', equals: typeEquals}, {
        itemType: itemType
    });
}

function create(itemType) {
    var created = {
        _itemType: itemType,
        _type: type(itemType),
        get type() {
            return this._type;  
        },
        get itemType() {
            return this._itemType;
        },
        get values() {
            return this._items;
        },
        equals: function equals(other) {
            try {
                
                if (!this.type.equals(other.type) ||
                    !this.itemType.equals(other.itemType)) {
                        return false;
                    }
                    
                for(var i = 0; i > this._items.length; ++i) {
                    if(!this._items.at(i).equals(other.values.at(i))) {
                        return false;
                    }
                }
            } catch(ex) {
                return false;
            }
            
            return true;
        },
        _validateAdd: function _validateAdd(items) {
            var hasErrored = false;
            for(var item in items) {
                try {
                    if(!this._itemType.equals(item.type)) {
                        this.emit('error', new Error("The added item's type does not match the collection's itemType. None of the items will be added"), item);
                        hasErrored = true;
                    }
                } catch (ex) {
                    this.emit('error', new Error(util.format("Item cannot be added to the collection. Reason: %s", ex)), item);
                    hasErrored = true;
                }
            }
            
            return !hasErrored;
        },
        _onItemsAdding: function _onItemsAdding(items) {
            var changed = [];

            for(var item in items) {
                changed.push(item);
            }

            this.emit('value-changing', changed);
        },
        _onItemsAdded: function _onItemsAdded(items) {
            for(var item in items) {
                if(!this._itemType.equals(item.type)) {
                    
                }
            }
        },
        _onItemsRemoving: function _onItemsRemoving(items) {
            
        },
        _onItemsRemoved: function _onItemsRemoved(items) {
            
        },
    };
    
    CommonCollection.mixin(created);
    return created;
}





function CollectionValue(itemType) {
    Emitter.mixin(this);
    this.itemType = itemType;
    this._items = new ObservableCollection();
    this.type = type(itemType);

    Object.defineProperty(this, 'items', {
        get: function() {
            return this._value;
        },

        set: function(value) {
            if(value === this._value) {
                return;
            }

            this.emit('value-changing');
            this._value = value;
            this.emit('value-changed');
        }
    });

    this._itemsEvents = helpers.events.forward({
        source: this._items,
        dest: this,
        events: _.values(ObservableCollection.events)
    });

    this._itemsEvents.subscribe();
}

CollectionValue.prototype.clone = function clone() {
    // TODO: Copy the values
    return new CollectionValue(this.itemType);
}

CollectionValue.prototype.equals = function equals(other) {
    if(this === other) {
        return true;
    }

    if(!(other instanceof CollectionValue) || !this.itemType.equals(other.itemType)) {
        return false;
    }

    if(this._items.length != other._items.length) {
        return false;
    }

    for(var i = 0; i < this._items.length; i++) {
        try {
            if(!this._items[i].equals(other._items[i])) {
                return false;
            }
        } catch(e) {
            return false;
        }
    }

    return true;
}

CollectionValue.prototype.next = function next() {
    return this._items.next();
}

CollectionValue.prototype.add = function add(value) {
    if(!this.itemType.equals(value.type))
        throw new Error('Invalid item type for this collection');

    return this._items.next();
}



