"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QualifiedObject_1 = require("./QualifiedObject");
const MemberCollection_1 = require("./collections/MemberCollection");
class ModelEdit {
}
exports.ModelEdit = ModelEdit;
class Model extends QualifiedObject_1.QualifiedObject {
    constructor(parent, name, context) {
        super(parent, name);
        this.context = context;
        this.members = new MemberCollection_1.MemberCollection(this, this.context);
    }
    on(handler) {
    }
    apply(model) {
        return Promise.resolve(this);
    }
}
exports.Model = Model;
/*
let rfc = model.rfc()

model.members

model.add({
   cost: 0,
   size: 3,
   name: ''
})


*/
