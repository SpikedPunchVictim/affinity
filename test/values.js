'use strict';

var chai = require('chai');
var expect = chai.expect;
var gaia = require('../lib/index.js');
var types = gaia.types;
var Events = require('../lib/events.js');
var testing = require('../lib/testing.js');

let Fill = testing.fill;

// TODO: Create a test for each type of value a SimpleValue can be created with (ie string for DecimalValue)

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
   });
});