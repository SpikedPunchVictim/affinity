'use strict';

class Type {
    constructor(name) {
        this._name = name;
    }
    
    get name() {
        return this._name;
    }
    
    equals(other) {
        return this._name === other.name;
    }

	toString() {
      return this.name;
   }
}

module.exports = Type;