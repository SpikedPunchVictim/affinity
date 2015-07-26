var util = require('util');
var EventEmitter = require('events').EventEmitter
var Undo = require('undo.js');
var NamespaceCollection = require('./collections/namespaceCollection.js');
var Namespace = require('./namespace.js');

module.exports.create = create;
module.exports.open = open;

function create() {
    return new Project();
}

function open() {
    // ...
}

function Project() {
    EventEmitter.call(this);
    var self = this;
    this.undoStack = new Undo.Stack();

    this.context = {
        project: self,
        root: self.root,
        undoStack: this.undoStack
    }

    this.root = new Namespace('', null, this.context);
}

util.inherits(Project, EventEmitter);

