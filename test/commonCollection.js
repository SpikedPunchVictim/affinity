var expect = require('chai').expect;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var gaia = require('../lib/index.js');
var CommonCollection = require('../lib/collections/commonCollection.js');
var ObservableCollection = require('../lib/collections/observableCollection.js');
var utility = require('../lib/utility.js');

function TestCollection() {
    EventEmitter.call(this);
    CommonCollection.mixin(this);
    this._items = new ObservableCollection();
    this.sync = utility.events.forward({
        source: this._items,
        dest: this,
        events: ObservableCollection.events
    });

    this.sync.subscribe();
}

util.inherits(TestCollection, EventEmitter);

TestCollection.prototype.dispose = function dispose() {
    this.sync.unsubscribe();
}

TestCollection.prototype.add = function add(item) {
    this._items.add(item);
}

function TestObject() {
    this.name = 'test-object';
}

describe('commonCollection', function() {

    describe('#indexOf', function() {
        it('should return -1 when the item does not exist', function() {
            var collection = new TestCollection();
            expect(collection.indexOf(3)).to.be.equal(-1);
            collection.add(1);
            collection.add(2);
            expect(collection.indexOf(3)).to.be.equal(-1);
            collection.dispose();
        });

        it('should return the item\'s index if it does exist', function() {
            var collection = new TestCollection();
            collection.add(1);
            expect(collection.indexOf(1)).to.be.equal(0);
            collection.add(2);
            expect(collection.indexOf(2)).to.be.equal(1);
            collection.dispose();
        });
    });

    describe('#at', function() {
        it('should return the item at the specified index', function() {
            var collection = new TestCollection();
            collection.add(1);
            expect(collection.at(0)).to.be.equal(1);
            collection.add(2);
            expect(collection.at(1)).to.be.equal(2);

            var badCall = function() { collection.at(3); };
            expect(badCall).to.throw(RangeError);
            collection.dispose();
        });
    });

    // utility.validateEvent(o, 'adding', function() { o.add(1); }, done);

    describe('#remove', function() {
        it('should remove the item by strict equality for simple types', function() {
            var collection = new TestCollection();
            collection.add(1);
            expect(collection.remove(1)).to.be.true;
            expect(collection.remove(1)).to.be.false;
            collection.dispose();
        });

        it('should remove the item by reference for objects', function() {
            var collection = new TestCollection();
            var obj = new TestObject();

            collection.add(obj);
            expect(collection.remove(obj)).to.be.true;
            expect(collection.remove(obj)).to.be.false;
            collection.dispose();
        });

        it('should support custom predicates', function() {
            var collection = new TestCollection();

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

            expect(collection.remove('key3', function(item) {
                return item.key1 === 'key3';
            })).to.be.true;

            expect(collection.remove('key3', function(item) {
                return item.key1 === 'key3';
            })).to.be.false;

            expect(collection.at(0)).to.equal(obj1);
            collection.dispose();
        });

        it('should generate a removing event', function(done) {
            var collection = new TestCollection();
            collection.add(1);
            collection.add(2);
            utility.validateEvent(collection, 'removing', function() { collection.remove(1); }, function() {
                collection.dispose();
                done();
            });
        });

        it('should generate a removed event', function(done) {
            var collection = new TestCollection();
            collection.add(1);
            collection.add(2);
            utility.validateEvent(collection, 'removed', function() { collection.remove(1); }, function() {
                collection.dispose();
                done();
            });
        });
    });

    describe('#splice', function() {
        it('should be able to add items', function() {
            var collection = new TestCollection();
            collection.splice(0, 0, 1);
            collection.splice(1, 0, 2);
            expect(collection.at(0)).to.equal(1);
            expect(collection.at(1)).to.equal(2);
            collection.dispose();
        });

        it('should be able to remove items', function() {
            var collection = new TestCollection();
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
            collection.dispose();
        });

        it('should generate an adding event', function(done) {
            var collection = new TestCollection();
            utility.validateEvent(collection, 'adding', function() { collection.add(1); },  function() {
                collection.dispose();
                done();
            });
        });

        it('should generate an added event', function(done) {
            var collection = new TestCollection();
            utility.validateEvent(collection, 'added', function() { collection.add(1); },  function() {
                collection.dispose();
                done();
            });
        });

        it('should generate an removing event', function(done) {
            var collection = new TestCollection();
            collection.add(1);
            utility.validateEvent(collection, 'removing', function() { collection.remove(1); },  function() {
                collection.dispose();
                done();
            });
        });

        it('should generate an removed event', function(done) {
            var collection = new TestCollection();
            collection.add(1);
            utility.validateEvent(collection, 'removed', function() { collection.remove(1); },  function() {
                collection.dispose();
                done();
            });
        });
    });

});