module.exports.Instance = require('./lib/instance.js');
module.exports.Field = require('./lib/field.js');
module.exports.Model = require('./lib/model.js');
module.exports.Member = require('./lib/member.js');
module.exports.Namespace = require('./lib/namespace.js');
module.exports.NamespaceCollection = require('./lib/collections/namespaceCollection.js');
module.exports.ModelCollection = require('./lib/collections/modelCollection.js');
module.exports.types = require('./lib/types/index.js');
module.exports.types.collection = require('./lib/types/collection.js');

var Project = require('./lib/project.js');
module.exports.create = Project.create;