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
}

module.exports = Type;