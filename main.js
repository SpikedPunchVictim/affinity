var ObservableCollection = require('./lib/collections/observableCollection.js');
var gaia = require('./lib/index.js');

//-----------------------------------------------------------------------------------
var expect = require('chai').expect;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Emitter = require('./lib/eventEmitter.js');
var Model = gaia.Model;
var CommonCollection = require('./lib/collections/commonCollection.js');
var types = gaia.types;

var proj = gaia.create();
var model = proj.root.models.add('test');
var instance = proj.root.instances.add('test-instance', model)
var name = 'test-member-name';
var value = types.bool.create();

var member = model.members.add(name, value);
var n = member.name;
var memberType = member.type;
var instanceMember = instance.members.get(name);

console.log(member.type);

// (emitter, event, triggerEvent, callback)
//utility.validateEvent(proj, Model.events.adding, function() { model.members.add('model1', types.string.create()); }, done);

/*

var source = {
    items: new ObservableCollection()
}

forwarding(b, {
        from: source.items,
        to: source,
        events: [
            ['adding', ['item-adding', 'value-changing']],

        ]


        b.map('adding', ['item-adding', 'value-changing'])
                 .map('added', ['item-added', 'value-changed'])
                 .map('removing', ['item-removing', 'value-chaning'])
                 .map('removed', ['item-removed', 'value-changed'])
                 .build()
    });
*/

var str = types.string.create("alive?");



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
