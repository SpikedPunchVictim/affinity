var expect = require('chai').expect;
var gaia = require('../../lib/index.js');

function validateTypeInterface(type) {
    expect(type).to.include.keys(['equals']);
}

function validateValueInterface(value) {
    expect(value.clone).to.exist;
    expect(value.equals).to.exist;
}

describe('Types:', function() {
    describe('strings', function() {            

        it('should have \'string\' as name', function() {
            var typeInfo = gaia.types.string.type();
            expect(typeInfo.name).eql('string');
        });

        it('should be able to create a value', function() {
            var value = gaia.types.string.create('test');
            expect(value.value).eql('test');
            expect(value.type.name).eql('string');
        });

        it('should create equal types', function() {
            var type1 = gaia.types.string.type();
            var type2 = gaia.types.string.type();
            expect(type1.equals(type2)).to.be.true;
        });

        it('should implement the type interface', function() {
            var typeInfo = gaia.types.string.type();
            validateTypeInterface(typeInfo);
        });

        it('should implement the value interface', function() {
            var value = gaia.types.string.create();
            validateValueInterface(value);
        });
    });

    // describe('collection', function() {
    //     it('should have \'collection\' as name', function() {
    //         var typeInfo = gaia.types.collection.type(gaia.types.string.type());
    //         expect(typeInfo.name).eql('collection');
    //     });

    //     it('should be able to create a value', function() {
    //         var typeInfo = gaia.types.collection.value(gaia.types.string.type());
    //         expect(value.value).eql('test');
    //         expect(value.type.name).eql('string');
    //     });
    // });
});

