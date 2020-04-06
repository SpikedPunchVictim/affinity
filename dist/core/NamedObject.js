"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NamedObject {
    constructor(name) {
        this._name = '';
        this._name = name;
    }
    get name() {
        return this._name;
    }
    set name(value) {
    }
    getName() {
        return this._name;
    }
}
exports.NamedObject = NamedObject;
