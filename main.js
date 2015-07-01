var ObservableCollection = require('./lib/collections/observableCollection.js');
var Project = require('./lib/project.js')
var QualifiedObject = require('./lib/qualifiedObject.js');
var gaia = require('./lib/index.js');

var proj = gaia.create();
var root = proj.root;

proj.root.children.on('items-adding', function(items) {
    console.log('Namespace <Root: items-adding>: %j', items);
});

proj.root.children.add('Items');


var item = root.models.add('Item');
item.members.add('name', 'string', 'default');
item.members.add('cost', 'decimal', 0.0)
item.members.add('canSell', 'bool', true);


var iceSword = root.instances.add('Ice Sword', item);
iceSword.fields.set('name', 'Ice Sword');
var name = iceSword.fields.get('name');
name.reset();
iceSwords.reset('name'); // returns to default
