"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Project {
    constructor() {
    }
    model(path) {
        let tokens = path.split('.');
        let current = this.root;
        for (let i = 0; i < tokens.length; ++i) {
            if (i == (tokens.length - 1)) {
                return current.models(tokens[i]);
            }
            else {
                current = current.children.get(tokens[i]);
            }
        }
        return undefined;
    }
}
exports.default = Project;
