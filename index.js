'use strict';

var types = require('./lib/types/index.js');
types.collection = require('./lib/types/collection.js');

var Project = require('./lib/project.js');

module.exports = {
   Instance: require('./lib/instance.js'),
   Field: require('./lib/field.js'),
   Model: require('./lib/model.js'),
   Member: require('./lib/member.js'),
   Namespace: require('./lib/namespace.js'),
   NamespaceCollection: require('./lib/collections/namespaceCollection.js'),
   ModelCollection: require('./lib/collections/modelCollection.js'),
   Project: Project,
   Events: require('./lib/events.js'),
	types: types,
   create: Project.create,
   qpath: require('./lib/qpath.js'),
   test: require('./lib/testing.js')
}

var affinity = {};

for (var exp in module.exports) {
   affinity[exp] = module.exports[exp];
}

module.exports.use = function use(plugin) {
   plugin.register(affinity);
}