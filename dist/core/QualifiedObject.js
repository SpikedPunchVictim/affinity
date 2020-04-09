"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { RequestForChange } from './RequestForChange'
const NamedObject_1 = require("./NamedObject");
const ArgumentError_1 = require("../errors/ArgumentError");
class QualifiedObject extends NamedObject_1.NamedObject {
    constructor(parent, name) {
        super(name);
        if (parent == null) {
            throw new ArgumentError_1.ArgumentError(`parent must be valid`);
        }
        this._parent = parent;
    }
    get qualifiedName() {
        var results = new Array();
        results.push(this.name);
        let current = this.parent;
        while (current != null) {
            if (current.name.length > 0) {
                results.unshift(current.name);
            }
            current = current.parent;
        }
        return results.join('.');
    }
    get parent() {
        return this._parent;
    }
    move(name) {
        return Promise.resolve(this);
    }
}
exports.QualifiedObject = QualifiedObject;
