'use strict';

var types = require('./types');

// From MDN:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
   return (Math.random() * getRandomInt(min, max)) + min;
}

function getRandomString() {
   let result = "";
   let count = getRandomInt(5, 35);
   for(let i = 0; i < count; ++i) {
      result = `${result}${"".charCodeAt(getRandomInt(0, 128))}`
   }
}

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
   * Returns an aray of all possible tyes
   */
   static types() {
      let result = [];
      let primitives = [
         types.bool.type(),
         types.decimal.type(),
         types.string.type(),
         types.int.type(),
         types.uint.type()
      ];

      result = result.concat(primitives);

      primitives.forEach(val => {
         result.push(types.collection.type(val.type));
      });

      return result;
   }

   static randomValues() {
      let result = [];
      let primitives = [
         types.bool.value(getRandomInt(1, 2) % 2 == 0),
         types.decimal.value(getRandomFloat(0, 10000)),
         types.string.value(getRandomString()),
         types.int.value(getRandomInt(-10000, 1000000)),
         types.uint.value(getRandomInt(0, 1000000))
      ];

      result = result.concat(primitives);

      primitives.forEach(val => {
         let collection = types.collection.value(val.type);
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