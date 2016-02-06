'use strict';
var Instance = require('./lib/instance.js');
var Field = require('./lib/field.js');
var Model = require('./lib/model.js');
var Member = require('./lib/member.js');
var Namespace = require('./lib/namespace.js');
var NamespaceCollection = require('./lib/collections/namespaceCollection.js');
var ModelCollection = require('./lib/collections/modelCollection.js');
var types = require('./lib/types/index.js');
types.collection = require('./lib/types/collection.js');
var Project = require('./lib/project.js');
var Events = require('./lib/events.js');

module.exports.Instance = Instance;
module.exports.Field = Field;
module.exports.Model = Model;
module.exports.Member = Member;
module.exports.Namespace = Namespace;
module.exports.NamespaceCollection = NamespaceCollection;
module.exports.ModelCollection = ModelCollection;
module.exports.types = types;
module.exports.create = Project.create;
module.exports.Events = Events;

var gaia = {};

for(var exp in module.exports) {
    gaia[exp] = module.exports[exp];
}

module.exports.use = function use(plugin) {
    plugin.register(gaia);
}