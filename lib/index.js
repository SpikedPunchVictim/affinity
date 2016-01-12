// definedTypes.forEach(function(type) {
//     if(path.extname(type) != '.js' || type === 'index.js') {
//         return;
//     }

//     var typeName = path.basename(type, '.js');
//     types[typeName] = require(path.join(typeDir, type));
// });

exports.Project = require('./project.js');
exports.create = exports.Project.create;
exports.open = exports.Project.open;
// exports.types = {
//     bool: simpleTypes.bool,
//     decimal: simpleTypes.decimal,
//     int: simpleTypes.int,
//     string: simpleTypes.string,
//     uint: simpleTypes.uint,
//     collection: collectionType
// }
exports.Instance = require('./instance.js');
exports.Field = require('./field.js');
exports.Model = require('./model.js');
exports.Member = require('./member.js');
exports.Namespace = require('./namespace.js');
exports.NamespaceCollection = require('./collections/namespaceCollection.js');
exports.ModelCollection = require('./collections/modelCollection.js');