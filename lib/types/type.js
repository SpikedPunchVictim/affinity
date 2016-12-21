'use strict';

class Type {
   constructor(name, createDefault) {
      this._name = name;

      // Allows for the developer to create a default value from the Type
      this._createDefault = createDefault;
   }

   get name() {
      return this._name;
   }

   default() {
      if(this._createDefault == null) {
         throw new Error(`No default specified for type ${this.name}`);
      }
      return this._createDefault();
   }

   equals(other) {
      return this._name === other.name;
   }

   /*
    * Determines if an object implements, what appears to be, a Type
    *
    * @params {Value} other
    * @returns true if appears to be a Type, otherwise false
    */
   static isType(other) {
      return (typeof other === 'object') &&
         ("name" in other) &&
         ("equals" in other);
   }

   toString() {
      return this.name;
   }

}

module.exports = Type;