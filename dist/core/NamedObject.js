"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NamedObject {
    constructor(name) {
        this.name = '';
        this.name = name;
    }
    rename(name) {
        return Promise.resolve(this);
    }
}
exports.NamedObject = NamedObject;
