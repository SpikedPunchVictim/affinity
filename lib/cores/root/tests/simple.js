var chai = require('chai');
var expect = require('chai').expect;
var spies = require('chai-spies');
var Simple = require('../simple.js');
var util = require('util');

chai.use(spies);

function validateTypeInterface(type) {
    expect(type).to.include.keys(['equals']);
}

function validateValueInterface(value) {
    expect(value.clone).to.exist;
    expect(value.equals).to.exist;
}

/*
    options:
        typeName : The name of the type
        createType() : lambda to create the type info
        createValue() : lambda to create a value
        nativeEquivalent : The native equivalent of the value createValue returns
        differentValue : A different native value of the same type
*/
function testType(options) {
    it(util.format('should have %s as name', options.typeName), function() {
        var typeInfo = options.createType();
        expect(typeInfo.name).eql(options.typeName);
    });

    it('should be able to create a value', function() {
        var value = options.createValue();
        expect(value.value).eql(options.nativeEquivalent);
        expect(value.type.name).eql(options.typeName);
    });

    it('should create equal types', function() {
        var type1 = options.createType();
        var type2 = options.createType();
        expect(type1.equals(type2)).to.be.true;
    });

    it('should implement the type interface', function() {
        var typeInfo = options.createType();
        validateTypeInterface(typeInfo);
    });

    it('should implement the value interface', function() {
        var value = options.createValue();
        validateValueInterface(value);
    });

    it('should raise the value-changing event', function(done) {
        var value = options.createValue();
        var spy = chai.spy();
        value.on('value-changing', spy);
        value.value = options.differentValue;
        value.off('value-changing', spy);
        expect(spy).to.have.been.called();
    });

    it('should raise the value-changed event', function(done) {
        var value = options.createValue();
        var spy = chai.spy();
        value.on('value-changed', spy);
        value.value = options.differentValue;
        value.off('value-changed', spy);
        expect(spy).to.have.been.called();
    }); 
}

describe('Types:', function() {
    
    // typeName, createType, createValue, nativeEquivalent, differentValue
    var tests = {
        'bool': {
            typeName: 'bool',
            createType: () => Simple.bool.type(),
            createValue: () => Simple.bool.create(true),
            nativeEquivalent: true,
            differentValue: false
        },
        'decimal': {
            typeName: 'decimal',
            createType: () => Simple.decimal.type(),
            createValue: () => Simple.decimal.create(1.2),
            nativeEquivalent: 1.2,
            differentValue: 4.201
        },
        'int': {
            typeName: 'int',
            createType: () => Simple.int.type(),
            createValue: () => Simple.int.create(16),
            nativeEquivalent: 16,
            differentValue: 1005
        },
        'string': {
            typeName: 'string',
            createType: () => Simple.string.type(),
            createValue: () => Simple.string.create('test'),
            nativeEquivalent: 'test',
            differentValue: 'other'
        },
        'uint': {
            typeName: 'uint',
            createType: () => Simple.uint.type(),
            createValue: () => Simple.uint.create(12),
            nativeEquivalent: 12,
            differentValue: 420
        }
    }
    
    for(var key in tests) {
        var options = tests[key];
        testType(options);
    }
});

