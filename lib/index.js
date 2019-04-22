var types = require('./types/index.js');
types.collection = require('./types/collection.js');

var Project = require('./project.js');

module.exports = {
   Instance: require('./instance.js'),
   Field: require('./field.js'),
   Model: require('./model.js'),
   Member: require('./member.js'),
   Namespace: require('./namespace.js'),
   NamespaceCollection: require('./collections/namespaceCollection.js'),
   ObservableCollection: require('./collections/observableCollection.js'),
   ModelCollection: require('./collections/modelCollection.js'),
   Project: Project,
   Events: require('./events.js'),
	types: types,
   create: Project.create,
   utils: require('./utils.js'),
   test: require('./testing.js'),
   use: use
}

var affinity = {};

for (var exp in module.exports) {
   affinity[exp] = module.exports[exp];
}

function use(plugin) {
   plugin.register(module.exports);
}










// module.exports.Instance = require('./instance.js');
// module.exports.Field = require('./field.js');
// module.exports.Model = require('./model.js');
// module.exports.Member = require('./member.js');
// module.exports.Namespace = require('./namespace.js');
// module.exports.NamespaceCollection = require('./collections/namespaceCollection.js');
// module.exports.ModelCollection = require('./collections/modelCollection.js');
// module.exports.types = require('./types/index.js');
// module.exports.types.collection = require('./types/collection.js');
// module.exports.events = require('./events.js');

// var Project = require('./project.js');
// module.exports.create = Project.create;
// module.exports.utils = require('./utils.js');

// var affinity = {};

// for (var exp in module.exports) {
//    affinity[exp] = module.exports[exp];
// }

// function use(plugin) {
//    plugin.register(module.exports);
// }