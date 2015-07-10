var ObservableCollection = require('./lib/collections/observableCollection.js');
var gaia = require('./lib/index.js');

var proj = gaia.create();
var root = proj.root;

var types = gaia.types;

proj.root.children.on('items-adding', function(items) {
    console.log('Namespace <Root: items-adding>: %j', items);
});

var items = proj.root.children.add('Items');
proj.root.children.indexOf('Items');

var item = root.models.add('Item');
console.log('Types: %j', gaia.types);

item.members.add('name', gaia.types.string.create('default'));
item.members.add('cost', types.decimal.create(0.0));
item.members.add('canSell', types.bool.create(true));


var iceSword = root.instances.add('Ice Sword', item);
iceSword.fields.set('name', 'Ice Sword');
var name = iceSword.fields.get('name');
name.reset();
iceSwords.reset('name'); // returns to default
