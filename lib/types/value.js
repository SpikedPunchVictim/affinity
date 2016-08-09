'use strict';
var Type = require('./type.js');

class Value {
   get type() {
      throw new Error('Not Implemented');
   }

   equals() {
      throw new Error('Unimplemented');
   }

   clone() {
      throw new Error('Unimplemented');
   }

   update(other) {
      throw new Error('Unimplemented');
   }

   /*
   * Determines if an object implements, what appears to be, a Value
   *
   * @params {Value} other
   * @returns true if appears to be a Value, otherwise false
   */
   static isValue(other) {
      return (typeof other === 'object') &&
         ("equals" in other) &&
         ("type" in other) &&
         ("clone" in other) &&
         ("update" in other) &&
         Type.isType(other.type);
   }
}

module.exports = Value;