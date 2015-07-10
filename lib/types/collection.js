var EventEmitter = require('events').EventEmitter;
var util = require('util');

module.exports.createType = createType;
module.exports.create = create;

// itemType: The itemType info
function create(itemType) {
    return new CollectionValue(itemType);
}

function createType(itemType) {
    return {
        name: 'collection',
        itemType: itemType,
        equals: function equals(typeInfo) {
            if(!typeInfo.hasOwnProperty('name') || !typeInfo.hasOwnProperty('itemType')) {
                return false;
            }
            
            return typeInfo.name === 'collection' && typeInfo.itemType.equals(this.itemType);
        }
    }
}

function create(itemType) {
    return new CollectionValue(itemType);
}

function CollectionValue(itemType) {
    EventEmitter.call(this);
    this._itemType = itemType;
    this._items = [];
}

util.inherits(CollectionValue, EventEmitter);


CollectionValue.prototype.next = function next() {
    return this._items.next();
}

CollectionValue.prototype.add = function add(value) {
    if(!this._itemType.isValid(value))
    return this._items.next();
}

Object.defineProperty(CollectionValue, 'value', {
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