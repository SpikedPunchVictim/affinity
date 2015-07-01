var util = require('util');
var EventEmitter = require('events').EventEmitter
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
    this.root = new Namespace('', null);
}

util.inherits(Project, EventEmitter);

