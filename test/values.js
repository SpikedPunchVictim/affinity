'use strict';

var chai = require('chai'),
   spies = require('chai-spies'),
   expect = chai.expect,
   affinity = require('../lib/index.js'),
   types = affinity.types,
   Events = require('../lib/events.js'),
   testing = require('../lib/testing.js');

chai.use(spies);

let Fill = testing.fill;

/*
TODO:
   - Create a test for each type of value a SimpleValue can be created with (ie string for DecimalValue)
   - CollectionValue needs event tests
*/

function sharedBehaviorTest(proxy) {
   it('should be able to create a type', () => {
      var info = proxy.createType();
      expect(info).to.exist;
   });

   it('types should be equal', () => {
      var type1 = proxy.createType();
      var type2 = proxy.createType();
      expect(type1.equals(type2)).to.be.true;
   });

   it('should be able to create a value', () => {
      var value = proxy.createValue1();
      expect(value).to.exist;
   });

   it('should be able to test value equality', () => {
      var value1 = proxy.createValue1();
      var value2 = proxy.createValue1();
      expect(value1.equals(value2)).to.be.true;

      var value3 = proxy.createValue2();
      expect(value1.equals(value3)).to.be.false;
   });

   it('should be able to clone values', () => {
      var value = proxy.createValue1();
      expect(value).to.exist;

      var clone = value.clone();
      expect(clone).to.exist;
      expect(clone.equals(value)).to.be.true;
   });

   it('should raise valueChanging', function (done) {
      var value = proxy.createValue1();

      var spy = chai.spy();
      value.on(Events.valueChanging, spy);
      proxy.changeValue(value);
      setTimeout(() => { expect(spy).to.have.been.called(); done(); }, 25);
   });

   it('should raise valueChanged', function (done) {
      var value = proxy.createValue1();

      var spy = chai.spy();
      value.on(Events.valueChanged, spy);
      proxy.changeValue(value);
      setTimeout(() => { expect(spy).to.have.been.called(); done(); }, 25);
   });
}

//---------------------------------------------------------------------
function primitiveType(proxy) {
   it('should perform an update', function (done) {
      let value = proxy.createValue1();
      let other = proxy.createValue2();
      expect(value.equals(other)).to.be.false;
      value.update(other)
         .then(_ => expect(value.equals(other)).to.be.true)
         .then(_ => done());
   });
}

//---------------------------------------------------------------------
function collectionTests(proxy) {
   let events = types.collection.events;
   let collection = types.collection;
   let string = types.string;

   describe('# collection item types', function() {
      for(let type of Fill.types()) {
         it(`should have the correct itemType: ${type.toString()}`, function() {
            let coll = collection.value(type);
            expect(type.equals(coll.itemType)).to.be.true;
         });
      }
   });
   
   it('should be able to iterate over .items', function() {
      let coll = collection.value(types.string.type());
      coll.add(string.value('one'), string.value('two'), string.value('three'))
         .then(_ => {
            let index = 0;
            for(let it of coll) {
               expect(it).to.be.equal(coll.at(index++));
            }
         });
   });

   it('should be able to iterate over the collection value', function() {
      let coll = collection.value(types.string.type());
      let value1 = string.value('one');
      let value2 = string.value('two');
      let value3 = string.value('three');
      let values = [value1, value2, value3];
      coll.add(value1, value2, value3)
         .then(_ => {
            let index = 0;
            for(let it of coll) {
               expect(it).to.eql(values[index]);
               ++index;
            }
         })
   });

   it('at() and add()', function(done) {
      let coll = collection.value(types.string.type());
      let value1 = string.value('one');
      let value2 = string.value('two');
      let value3 = string.value('three');
      let values = [value1, value2, value3];
      coll.add(value1, value2, value3)
         .then(_ => {
            expect(coll.at(0)).to.eql(value1);
            expect(coll.at(1)).to.eql(value2);
            expect(coll.at(2)).to.eql(value3);
         })
         .then(_ => done())
         .catch(err => { done(err) });
   });

   it('update()', function(done) {
      let coll = collection.value(types.string.type());
      let value1 = string.value('one');
      let value2 = string.value('two');
      let value3 = string.value('three');
      let value4 = string.value('four');
      let value5 = string.value('five');
      let value6 = string.value('six');
      let value7 = string.value('seven');
      let values = [value1, value2, value3];
      coll.add(value1, value2, value3)
         .then(_ => {
            let coll2 = collection.value(string.type());
            return coll2.add(value4, value5, value6, value7)
               .then(_ => coll.update(coll2))
               .then(_ => {
                  expect(coll.at(0)).to.eql(value4);
                  expect(coll.at(1)).to.eql(value5);
                  expect(coll.at(2)).to.eql(value6);
                  expect(coll.at(3)).to.eql(value7);
               });
         })
         .then(_ => done())
         .catch(err => done(err));
   })

//    it('move()', function(done) {
//       let coll = collection.value(types.string.type());
//       let value1 = string.value('one');
//       let value2 = string.value('two');
//       let value3 = string.value('three');

//       coll.add(value1, value2, value3)
//          .then(_ => coll.move(0, 1))
//          .then(_ => {
//             expect(coll.at(0)).to.equal(value2);
//             expect(coll.at(1)).to.equal(value1);
//             return true;
//          })
//          .catch(err => done(err));
//    })

   it('clear()', function(done) {
      let coll = collection.value(types.string.type());
      let value1 = string.value('one');
      let value2 = string.value('two');
      let value3 = string.value('three');

      coll.add(value1, value2, value3)
         .then(_ => expect(coll.length).to.be.equal(3))
         .then(_ => coll.clear())
         .then(_ => expect(coll.length).to.be.equal(0))
         .then(_ => done())
         .catch(err => done(err));
   })

   it('remove()', function(done) {
      let coll = collection.value(types.string.type());
      let value1 = string.value('one');
      let value2 = string.value('two');
      let value3 = string.value('three');

      coll.add(value1, value2, value3)
         .then(_ => expect(coll.length).to.be.equal(3))
         .then(_ => coll.remove(value2))
         .then(_ => {
            expect(coll.length).to.be.equal(2);
            expect(coll.at(0)).to.be.equal(value1);
            expect(coll.at(1)).to.be.equal(value3);
         })
         .then(_ => done())
         .catch(err => done(err));
   })

   it('removeAt()', function(done) {
      let coll = collection.value(types.string.type());
      let value1 = string.value('one');
      let value2 = string.value('two');
      let value3 = string.value('three');

      coll.add(value1, value2, value3)
         .then(_ => expect(coll.length).to.be.equal(3))
         .then(_ => coll.removeAt(1))
         .then(_ => {
            expect(coll.length).to.be.equal(2);
            expect(coll.at(0)).to.be.equal(value1);
            expect(coll.at(1)).to.be.equal(value3);
         })
         .then(_ => done())
         .catch(err => done(err));
   })

   it('removeAll()', function(done) {
      let coll = collection.value(types.string.type());
      let value1 = string.value('one');
      let value2 = string.value('two');
      let value3 = string.value('three');

      coll.add(value1, value2, value3)
         .then(_ => expect(coll.length).to.be.equal(3))
         .then(_ => coll.removeAll(v => v.equals(value2)))
         .then(_ => {
            expect(coll.length).to.be.equal(2);
            expect(coll.at(0)).to.be.equal(value1);
            expect(coll.at(1)).to.be.equal(value3);
         })
         .then(_ => done())
         .catch(err => done(err));
   })





   describe('#events', function() {

   });

   // it(`should raise a ${events.add} event`, function(done) {
   //    types.collection.value(types.int.type());
   //    value.on(Events.valueChanged, spy);
   //    proxy.changeValue(value);
   //    setTimeout(() => { expect(spy).to.have.been.called(); done(); }, 25);
   // });
}

describe('Types:', function () {
   //---------------------------------------------------------------------
   let boolProxy = {
      name: 'bool',
      createType: () => types.bool.type(),
      createValue1: () => types.bool.value(false),
      createValue2: () => types.bool.value(true),
      changeValue: value => value.update(!value.value)
   };

   describe('# bool', function () {
      sharedBehaviorTest(boolProxy);
      primitiveType(boolProxy);
   });

   //---------------------------------------------------------------------
   let decProxy = {
      name: 'decimal',
      createType: () => types.decimal.type(),
      createValue1: () => types.decimal.value(12.3),
      createValue2: () => types.decimal.value(47.6),
      changeValue: value => value.update(value.value + 1)
   };

   describe('# decimal', function () {
      sharedBehaviorTest(decProxy);
      primitiveType(decProxy);
   });

   //---------------------------------------------------------------------
   let intProxy = {
      name: 'int',
      createType: () => types.int.type(),
      createValue1: () => types.int.value(12),
      createValue2: () => types.int.value(-47),
      changeValue: value => value.update(value.value + 1)
   };

   describe('# int', function () {
      sharedBehaviorTest(intProxy);
      primitiveType(intProxy);
   });

   //---------------------------------------------------------------------
   let stringProxy = {
      name: 'string',
      createType: () => types.string.type(),
      createValue1: () => types.string.value('Have you found the string?'),
      createValue2: () => types.string.value('Have you seen the string?'),
      changeValue: value => value.update(value.value + '...')
   };

   describe('# string', function () {
      sharedBehaviorTest(stringProxy);
      primitiveType(stringProxy);
   });

   //---------------------------------------------------------------------
   let uintProxy = {
      name: 'uint',
      createType: () => types.uint.type(),
      createValue1: () => types.uint.value(18),
      createValue2: () => types.uint.value(1080),
      changeValue: value => value.update(value.value + 1)
   };

   describe('# uint', function () {
      sharedBehaviorTest(uintProxy);
      primitiveType(uintProxy);
   });


   //---------------------------------------------------------------------
   let collProxy = {
      name: 'collection',
      createType: () => types.collection.type(types.string.type()),
      createValue1: () => types.collection.value(types.string.type()),
      createValue2: () => types.collection.value(types.int.type()),
      changeValue: value => value.add(types.string.value('added'))
   };

   describe('# collection', function () {
      sharedBehaviorTest(collProxy);
      // Next: test the collection API
      collectionTests(collProxy);
   });
});