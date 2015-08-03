var expect = require('chai').expect;
var gaia = require('../../lib/index.js');
var utility = require('../../lib/utility.js');

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

        it('should raise the value-changing event', function(done) {
            var value = gaia.types.string.create();
            utility.validateEvent(value, 'value-changing', function() { value.value = 'new'; }, done);
        });

        it('should raise the value-changed event', function(done) {
            var value = gaia.types.string.create();
            utility.validateEvent(value, 'value-changed', function() { value.value = 'new'; }, done);
        });
    });
});

