'use strict';

const types = require('./types');
const _ = require('lodash');

function getRandomString() {
   let result = "";
   _.times(_.random(3, 10), () => {
      let isUpper = (_.random(0, 128) % 2) == 0;
      let code = isUpper ? _.random(65, 90) : _.random(97, 122)
      result = `${result}${String.fromCharCode(code)}`
   })

   return result
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
      let collectionTypes = result.map(type => types.collection.type(type));
      result = result.concat(collectionTypes);
      
      // Nested Collection Types (ie collection<collection<string>>)
      result = result.concat(collectionTypes.map(type => types.collection.type(type)));

      return result;
   }

   static randomValues() {
      let result = [];
      let primitives = [
         types.bool.value(_.random(1, 2) % 2 == 0),
         types.decimal.value(_.random(0, 10000, true)),
         types.string.value(getRandomString()),
         types.int.value(_.random(-10000, 1000000)),
         types.uint.value(_.random(0, 1000000))
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

   static namespace(nspace, depth) {
      if(depth == null) {
         depth = 3
      }

      let models = 
         _.times(_.random(3, 12), () => nspace.models.new(getRandomString()))

      models.forEach(m => Fill.model(m))

      let instances = 
         _.times(_.random(2, 28), () => {
            return nspace.instances.new(getRandomString(), _.sample(models))
         })

      let nspaces = 
         _.times(_.random(1, 15), () => nspace.children.new(getRandomString()))

      if(depth > 0) {
         nspaces.forEach(n => Fill.namespace(n, depth - 1))
      }      
   }

   static project(proj, depth) {
      depth = depth || 3
      Fill.namespace(proj.root, depth)
   }
}

module.exports = {
   fill: Fill
}