var ObservableCollection = require('./lib/collections/observableCollection.js');
var gaia = require('./lib/index.js');

var o = new ObservableCollection();
o.splice(0, 0, 1);
o.splice(0, 0, 2);
o.splice(2, 0, 3, 4, 5)
o.splice(1, 0, 3);
o.splice(2, 0, 4);
o.splice(1, 1);
o.splice(0, 2);

o.addMany([1, 2, 3, 4, 5]);
o.removeMany([1, 2, 3, 4]);


//-----------------------------------------------------------------------------------
var expect = require('chai').expect;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var CommonCollection = require('./lib/collections/commonCollection.js');
var types = gaia.types;

var proj = gaia.create();
var model = proj.root.models.add('test');
var instance = proj.root.instances.add('test-instance', model);

var stringMember = model.members.add('stringMember', types.string.create());
var intMember = model.members.add('intMember', types.int.create());
var decimalMember = model.members.add('decimalMember', types.decimal.create());

expect(instance.members.at(0).modelMember).to.equal(stringMember);
expect(instance.members.at(1).modelMember).to.equal(intMember);
expect(instance.members.at(2).modelMember).to.equal(decimalMember);

model.members.remove(intMember);
expect(instance.members.at(0)).to.equal(stringMember);
expect(instance.members.at(1)).to.equal(decimalMember);
expect(instance.members.length).to.equal(2);

//----------------------------------------------------------------------------------

var coll = gaia.types.collection.create(gaia.types.string.type());

var proj = gaia.create();
var root = proj.root;

var types = gaia.types;
var value = gaia.types.string.create();

proj.root.children.on('adding', function(items) {
    console.log('Namespace <Root: adding>: %j', items);
});

var items = proj.root.children.add('Items');
var itemIndex = proj.root.children.indexOf('Items');

//-- Model
var item = root.models.add('Item');
item.on()

var iceSword = root.instances.add('Ice Sword', item);
console.log('Types: %j', gaia.types);

item.members.add('name', gaia.types.string.create('default'));
item.members.add('cost', types.decimal.create(0.0));
item.members.add('canSell', types.bool.create(true));


var iceSword = root.instances.add('Ice Sword', item);
iceSword.members.set('name', 'Ice Sword');
var name = iceSword.members.get('name');
name.reset();
iceSwords.reset('name'); // returns to default
