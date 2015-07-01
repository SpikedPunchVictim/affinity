module.exports.ItemTypeInfo = ItemTypeInfo;

function ItemTypeInfo(name, isValidValue) {
    this._name;
}

Object.defineProperty(ItemTypeInfo, 'name', {
    get: function() {
        return this._value;
    }
});