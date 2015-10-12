var fs = require('fs');
var path = require('path');
var simpleTypes = require('./types/simple.js');

console.log('simpleTypes: %j', simpleTypes)

// Read in types
var typeDir = path.join(__dirname, 'types');
var definedTypes = fs.readdirSync(typeDir);
var types = { };

// definedTypes.forEach(function(type) {
//     if(path.extname(type) != '.js' || type === 'index.js') {
//         return;
//     }

//     var typeName = path.basename(type, '.js');
//     types[typeName] = require(path.join(typeDir, type));
// });

var exports = module.exports;
exports.Project = require('./project.js');
exports.create = exports.Project.create;
exports.open = exports.Project.open;
exports.types = {
    Bool: simpleTypes.Bool,
    Decimal: simpleTypes.Decimal,
    Int: simpleTypes.Int,
    String: simpleTypes.String,
    UInt: simpleTypes.UInt
}
exports.Instance = require('./instance.js');
exports.InstanceMember = require('./instanceMember.js');
exports.Model = require('./model.js');
exports.ModelMember = require('./modelMember.js');
exports.Namespace = require('./namespace.js');
exports.NamespaceCollection = require('./collections/namespaceCollection.js');
exports.ModelCollection = require('./collections/modelCollection.js');