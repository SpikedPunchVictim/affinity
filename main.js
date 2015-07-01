var ObservableCollection = require('./lib/collections/observableCollection.js');
var Project = require('./lib/project.js')
var QualifiedObject = require('./lib/qualifiedObject.js');
var gaia = require('./lib/index.js');

var proj = gaia.create();

proj.root.on('items-adding', function(items) {
    console.log('Namespace <Root: items-adding>: %j', items);
});

proj.root.add('Items');


