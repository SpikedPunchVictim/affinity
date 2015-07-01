var util = require('util');
var EventEmitter = require('events').EventEmitter
var NamespaceCollection = require('./collections/namespaceCollection.js');

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
    this.root = new NamespaceCollection('', null);
}

util.inherits(Project, EventEmitter);

