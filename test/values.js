var chai = require('chai');
var expect = chai.expect;
var gaia = require('../lib/index.js');
var types = gaia.types;
var Events = require('../lib/events.js');

function validateTypeInterface(type) {
    expect(type).to.include.keys(['equals']);
}

function validateValueInterface(value) {
    expect(value.clone).to.exist;
    expect(value.equals).to.exist;
}

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
        
        it('should raise valueChanging', () => {
            var value = createValue1();
            
            var spy = chai.spy();
            value.on(Events.valueChanging, spy);
            changeValue(value);
            expect(spy).to.have.been.called();
        });
        
        it('should raise valueChanged', () => {
            var value = createValue1();
            
            var spy = chai.spy();
            value.on(Events.valueChanged, spy);
            changeValue(value);
            expect(spy).to.have.been.called();
        });        
    });
}

describe('Types:', function() {
    createTypeTest(
        'bool',
        () => types.bool.type(),
        () => types.bool.create(false),
        () => types.bool.create(true),
        value => value.value = !value.value
    );
    
    createTypeTest(
        'decimal',
        () => types.decimal.type(),
        () => types.decimal.create(12.3),
        () => types.decimal.create(47.6),
        value => value.value = value.value + 1
    );
    
    createTypeTest(
        'int',
        () => types.int.type(),
        () => types.int.create(42),
        () => types.int.create(-42),
        value => value.value = value.value + 1
    );
    
    createTypeTest(
        'string',
        () => types.string.type(),
        () => types.string.create('Have you found the string?'),
        () => types.string.create('Have you seen the string?'),
        value => value.value = value.value + '...' 
    );
    
    createTypeTest(
        'uint',
        () => types.uint.type(),
        () => types.uint.create(18),
        () => types.uint.create(1080),
        value => value.value = value.value + 1
    );
    
    createTypeTest(
        'collection',
        () => types.collection.type(types.string.type()),
        () => types.collection.create(types.string.type()),
        () => types.collection.create(types.int.type()),
        col => col.add('added...')
    )
});