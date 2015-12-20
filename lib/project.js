'use strict';

var Emitter = require('./eventEmitter.js');
var Undo = require('undo.js');
var Namespace = require('./namespace.js');

class Project {
    constructor() {
        Emitter.mixin(this);
        var self = this;
        this.undoStack = new Undo.Stack();

        this.context = {
            project: self,
            root: self.root,
            undoStack: this.undoStack
        };

        this.root = new Namespace('', null, this.context); 
    }
}

function create() {
    return new Project();
}

function open() {
    // ...
}

module.exports.create = create;
module.exports.open = open;