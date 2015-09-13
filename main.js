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
var Emitter = require('./lib/eventEmitter.js');
var Model = gaia.Model;
var CommonCollection = require('./lib/collections/commonCollection.js');
var types = gaia.types;

var proj = gaia.create();
var model = proj.root.models.add('test');

model.on(Model.events.valueChanging, function(change) {
    console.log('changing');
});

model.on(Model.events.valueChanged, function(change) {
    console.log('changed');
});


var member = model.members.add('test', types.string.create());
member.value.value = 'testme';
member.value.value = 'work-it-testme';

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
