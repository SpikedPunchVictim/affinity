module.exports = Namespace;

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var QualifiedObject = require('./qualifiedObject.js');
var NamespaceCollection = require('./collections/namespaceCollection.js');
var ModelCollection = require('./collections/modelCollection.js');
var InstanceCollection = require('./collections/instanceCollection.js');


function Namespace(name, parent, project) {
    QualifiedObject.mixin(this);
    this._parent = parent;
    this._name = name;
    this.project = project;
    this.children = new NamespaceCollection(this);
    this.models = new ModelCollection(this);
    this.instances = new InstanceCollection(this);
}

util.inherits(Namespace, EventEmitter);