'use strict';

var types = require('./types');

class Fill {
   /*
   * Returns an array of all known values set to their default
   * value.
   */
   static values() {
      let result = [];
      let primitives = [
         types.bool.value(),
         types.decimal.value(),
         types.string.value(),
         types.int.value(),
         types.uint.value()
      ];

      result = result.concat(primitives);

      primitives.forEach(val => {
         result.push(types.collection.value(val.type));
      });

      return result;
   }

   /*
   * Fills a model with members of every value type
   * 
   * @params {Model} mod The model to fill
   * @return {Object} An Object containing information on how the model was populated:
   *                 name {string} Member name
   *                 index {Number} The index of the member
   *                 value {Value} The value the member has been populated with
   */
   static model(mod) {
      let result = [];
      let index = 0;

      Fill.values().forEach(val => {
         let info = { name: `member_${index}`, index: index++, value: val };
         mod.members.new(info.name, val);
         result.push(info);
      });

      return result;
   }
}

module.exports = {
   fill: Fill
}