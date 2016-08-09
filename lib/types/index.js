var Type = require('./type.js'),
   Value = require('./value.js'),
   Simple = require('./simple.js'),
   Collection = require('./collection.js');

module.exports = {
   isType: Type.isType,
   isValue: Value.isValue,
   bool: Simple.bool,
   decimal: Simple.decimal,
   int: Simple.int,
   string: Simple.string,
   uint: Simple.uint,
   collection: Collection
}