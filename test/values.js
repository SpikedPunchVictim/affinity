var chai = require('chai');
var expect = chai.expect;
var gaia = require('../lib/index.js');
var types = gaia.types;
var Events = require('../lib/events.js');

// TODO: Create a test for each type of value a SimpleValue can be created with (ie string for DecimalValue)

function createTypeTest(typeName, createType, createValue1, createValue2, changeValue) {
    describe('# ' + typeName, () => {
        
        it('should be able to create a type', () => {
            var info = createType();
            expect(info).to.exist;
        });
        
        it('types should be equal', () => {
            var type1 = createType();
            var type2 = createType();
            expect(type1.equals(type2)).to.be.true;
        });
        
        it('should be able to create a value', () => {
            var value = createValue1();
            expect(value).to.exist;
        });
        
        it('should be able to test value equality', () => {
            var value1 = createValue1();
            var value2 = createValue1();
            expect(value1.equals(value2)).to.be.true;
            
            var value3 = createValue2();
            expect(value1.equals(value3)).to.be.false;
        });
        
        it('should be able to clone values', () => {
            var value = createValue1();
            expect(value).to.exist;
            
            var clone = value.clone();
            expect(clone).to.exist;
            expect(clone.equals(value)).to.be.true;
        });
        
        it('should raise valueChanging', done => {
            var value = createValue1();
            
            var spy = chai.spy();
            value.on(Events.valueChanging, spy);
            changeValue(value);
            setTimeout(() => { expect(spy).to.have.been.called(); done(); }, 25);
        });
        
        it('should raise valueChanged', done => {
            var value = createValue1();
            
            var spy = chai.spy();
            value.on(Events.valueChanged, spy);
            changeValue(value);
            setTimeout(() => { expect(spy).to.have.been.called(); done(); }, 25);
        });        
    });
}

describe('Types:', function() {
    createTypeTest(
        'bool',
        () => types.bool.type(),
        () => types.bool.value(false),
        () => types.bool.value(true),
        value => value.value = !value.value
    );
    
    createTypeTest(
        'decimal',
        () => types.decimal.type(),
        () => types.decimal.value(12.3),
        () => types.decimal.value(47.6),
        value => value.value = value.value + 1
    );
    
    createTypeTest(
        'int',
        () => types.int.type(),
        () => types.int.value(42),
        () => types.int.value(-42),
        value => value.value = value.value + 1
    );
    
    createTypeTest(
        'string',
        () => types.string.type(),
        () => types.string.value('Have you found the string?'),
        () => types.string.value('Have you seen the string?'),
        value => value.value = value.value + '...' 
    );
    
    createTypeTest(
        'uint',
        () => types.uint.type(),
        () => types.uint.value(18),
        () => types.uint.value(1080),
        value => value.value = value.value + 1
    );
    
    createTypeTest(
        'collection',
        () => types.collection.type(types.string.type()),
        () => types.collection.value(types.string.type()),
        () => types.collection.value(types.int.type()),
        col => col.add(types.string.value('added...'))
    );
});