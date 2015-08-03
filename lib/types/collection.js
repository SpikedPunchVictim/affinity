var util = require('util');
var utility = require('../utility.js');

module.exports.type = type;
module.exports.create = create;

// itemType: The itemType info
function create(itemType) {
    return new CollectionValue(itemType);
}

function type(itemType) {
    return {
        name: 'collection',
        itemType: itemType,
        equals: function equals(other) {
            if(!other.hasOwnProperty('name') || !other.hasOwnProperty('itemType')) {
                return false;
            }
            
            return other.name === 'collection' && other.itemType.equals(this.itemType);
        }
    }
}

function create(itemType) {
    return new CollectionValue(itemType);
}

function CollectionValue(itemType) {
    utility.events.mixin(this);
    this.itemType = itemType;
    this._items = [];
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
    if(!this.itemType.isValid(value))
    return this._items.next();
}



