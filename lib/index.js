// definedTypes.forEach(function(type) {
//     if(path.extname(type) != '.js' || type === 'index.js') {
//         return;
//     }

//     var typeName = path.basename(type, '.js');
//     types[typeName] = require(path.join(typeDir, type));
// });


// module.exports.create = exports.Project.create;
// module.exports.open = exports.Project.open;
// exports.types = {
//     bool: simpleTypes.bool,
//     decimal: simpleTypes.decimal,
//     int: simpleTypes.int,
//     string: simpleTypes.string,
//     uint: simpleTypes.uint,
//     collection: collectionType
// }
module.exports.Instance = require('./instance.js');
module.exports.Field = require('./field.js');
module.exports.Model = require('./model.js');
module.exports.Member = require('./member.js');
module.exports.Namespace = require('./namespace.js');
module.exports.NamespaceCollection = require('./collections/namespaceCollection.js');
module.exports.ModelCollection = require('./collections/modelCollection.js');
module.exports.types = require('./types/index.js');
var Project = require('./project.js');

module.exports.create = Project.create;