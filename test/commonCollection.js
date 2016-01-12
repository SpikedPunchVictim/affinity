/*
var expect = require('chai').expect;
var util = require('util');
var _ = require('lodash');
var EventEmitter = require('../lib/eventEmitter');
var gaia = require('../lib/index.js');
var CommonCollection = require('../lib/collections/commonCollection.js');
var ObservableCollection = require('../lib/collections/observableCollection.js');
var helpers = require('../lib/helpers.js');


var events = {
    'adding': 'test-adding',
    'added': 'test-added',
    'removing': 'test-removing',
    'removed': 'test-removed'
}

var createCollection = function createCollection() {
    var coll = {};
    CommonCollection.mixin(coll);
    coll._onItemsAdding = function(items) { this.emit(events.adding, items); };
    coll._onItemsAdded = function(items) { this.emit(events.added, items); };
    coll._onItemsRemoving = function(items) { this.emit(events.removing, items); };
    coll._onItemsRemoved = function(items) { this.emit(events.removed, items); };
    coll.add = function(item) { this._items.add(item); };
    
    return coll;
}

// function TestCollection() {
//     //EventEmitter.mixin(this);
//     CommonCollection.mixin(this);

//     this.sync = helpers.events.forward({
//         source: this._items,
//         dest: this,
//         events: _.values(ObservableCollection.events)
//     });

//     this.sync.subscribe();
// }

// TestCollection.prototype.dispose = function dispose() {
//     this.sync.unsubscribe();
// }

// TestCollection.prototype.add = function add(item) {
//     this._items.add(item);
// }

function TestObject() {
    this.name = 'test-object';
}

/*
describe('commonCollection', function() {

    describe('#indexOf', function() {
        it('should return -1 when the item does not exist', function() {
            var collection = createCollection();
            expect(collection.indexOf(3)).to.be.equal(-1);
            collection.add(1);
            collection.add(2);
            expect(collection.indexOf(3)).to.be.equal(-1);
        });

        it('should return the item\'s index if it does exist', function() {
            var collection = createCollection();
            collection.add(1);
            expect(collection.indexOf(1)).to.be.equal(0);
            collection.add(2);
            expect(collection.indexOf(2)).to.be.equal(1);
        });
    });

    describe('#at', function() {
        it('should return the item at the specified index', function() {
            var collection = createCollection();
            collection.add(1);
            expect(collection.at(0)).to.be.equal(1);
            collection.add(2);
            expect(collection.at(1)).to.be.equal(2);

            var badCall = function() { collection.at(3); };
            expect(badCall).to.throw(RangeError);
        });
    });

    // helpers.validateEvent(o, 'adding', function() { o.add(1); }, done);

    describe('#remove', function() {
        it('should remove the item by strict equality for simple types', function() {
            var collection = createCollection();
            collection.add(1);
            expect(collection.remove(1)).to.be.true;
            expect(collection.remove(1)).to.be.false;
        });

        it('should remove the item by reference for objects', function() {
            var collection = createCollection();
            var obj = new TestObject();

            collection.add(obj);
            expect(collection.remove(obj)).to.be.true;
            expect(collection.remove(obj)).to.be.false;
        });

        it('should remove an item by predicate', function() {
            var collection = createCollection();
            var obj = new TestObject();
            obj.name = 'testme';
            
            var obj2 = new TestObject();
            obj2.name = 'thinkofmefondly';

            collection.add(obj);
            collection.add(obj2);

            expect(collection.at(0)).to.equal(obj);
            expect(collection.at(1)).to.equal(obj2);
            collection.remove(function(item, indx, collection) { return item.name === 'testme'; });
            expect(collection.at(0)).to.equal(obj2);
            expect(collection.length).to.equal(1);
        });

        it('should support custom predicates', function() {
            var collection = createCollection();

            var obj1 = {
                key1: 'key1',
                key2: 'key2'
            };

            var obj2 = {
                key1: 'key3',
                key2: 'key4'
            };

            collection.add(obj1);
            collection.add(obj2);

            expect(collection.remove(function(item) {
                return item.key1 === 'key3';
            })).to.be.true;

            expect(collection.remove(function(item) {
                return item.key1 === 'key3';
            })).to.be.false;

            expect(collection.at(0)).to.equal(obj1);
        });

        it('should generate a removing event', function(done) {
            var collection = createCollection();
            collection.add(1);
            collection.add(2);
            helpers.validateEvent(collection, 'removing', function() { collection.remove(1); }, function() {
                done();
            });
        });

        it('should generate a removed event', function(done) {
            var collection =createCollection();
            collection.add(1);
            collection.add(2);
            helpers.validateEvent(collection, 'removed', function() { collection.remove(1); }, function() {
                done();
            });
        });
    });

    describe('#splice', function() {
        it('should be able to add items', function() {
            var collection = createCollection();
            collection.splice(0, 0, 1);
            collection.splice(1, 0, 2);
            expect(collection.at(0)).to.equal(1);
            expect(collection.at(1)).to.equal(2);
        });

        it('should be able to remove items', function() {
            var collection = createCollection();
            collection.add(1);
            collection.add(2);
            collection.add(3);
            collection.add(4);

            collection.splice(1, 1);
            expect(collection.at(0)).to.equal(1);
            expect(collection.at(1)).to.equal(3);
            expect(collection.at(2)).to.equal(4);

            collection.splice(1, 1);
            expect(collection.at(0)).to.equal(1);
            expect(collection.at(1)).to.equal(4);
        });

        it('should generate an adding event', function(done) {
            var collection = createCollection();
            helpers.validateEvent(collection, 'adding', function() { collection.splice(1, 0, 2); },  function() {
                done();
            });
        });

        it('should generate an added event', function(done) {
            var collection = createCollection();
            helpers.validateEvent(collection, 'added', function() { collection.splice(1, 0, 2); },  function() {
                done();
            });
        });

        it('should generate an removing event', function(done) {
            var collection = createCollection();
            collection.add(1);
            helpers.validateEvent(collection, 'removing', function() { collection.remove(1); },  function() {
                done();
            });
        });

        it('should generate an removed event', function(done) {
            var collection = createCollection();
            collection.add(1);
            helpers.validateEvent(collection, 'removed', function() { collection.remove(1); },  function() {
                done();
            });
        });
    });

});
*/