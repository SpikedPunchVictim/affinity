"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RequestForChange_1 = require("./RequestForChange");
const collections_1 = require("./collections");
class ProjectContext {
    constructor(rfcSource) {
        this.rfcSource = rfcSource || new RequestForChange_1.RequestForChangeSource();
    }
}
class RootNamespace {
    constructor(context) {
        // models: IModelCollection
        // instances: IInstanceCollection
        this.name = '';
        this.qualifiedName = '';
        this.parent = null;
        this.context = context;
        this.children = new collections_1.NamespaceCollection(this, context);
    }
    move(name) {
        throw new Error(`Cannot move the Root Namespace`);
    }
    rename(name) {
        throw new Error(`Cannot rename the Root Namespace`);
    }
}
class Project {
    constructor(options) {
        this.context = new ProjectContext(options === null || options === void 0 ? void 0 : options.rfcSource);
        this.root = new RootNamespace(this.context);
    }
}
exports.Project = Project;
