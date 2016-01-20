var Simple = require('./simple.js');
var Collection = require('./collection.js');

module.exports = {
    bool: Simple.bool,
    decimal: Simple.decimal,
    int: Simple.int,
    string: Simple.string,
    uint: Simple.uint,
    collection: Collection
}