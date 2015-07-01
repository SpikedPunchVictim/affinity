var EventEmitter = require('events').Eventemitter;

module.exports.createInfo = createInfo;
module.exports.createValue = createValue;

function createInfo(itemTypeInfo) {
    return {
        name: "Collection",
        itemType: itemTypeInfo
    }
}

function createValue(itemTypeInfo) {
    return new CollectionValue(itemTypeInfo);
}

function CollectionValue(itemTypeInfo) {
    EventEmitter.call(this);
    this._itemTypeInfo = itemTypeInfo;
    this._items = [];
}

util.inherits(CollectionValue, EventEmitter);


CollectionValue.prototype.next = function next() {
    return this._items.next();
}

CollectionValue.prototype.add = function add(value) {
    if(!this._itemTypeInfo.isValid(value))
    return this._items.next();
}

Object.defineProperty(StringValue, 'value', {
    get: function() {
        return this._value;
    }

    set: function(value) {
        if(value === this._value) {
            return;
        }

        this.emit('value-changing');
        this._value = value;
        this.emit('value-changed');
    }
});