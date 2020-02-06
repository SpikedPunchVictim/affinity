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

function use(plugin) {
   plugin.register(module.exports);
}