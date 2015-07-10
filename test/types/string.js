var expect = require('chai').expect;
var gaia = require('../../lib/index.js');

describe('Types', function() {
    var proj = gaia.create();
    var nspace = proj.root.children.add('test');

    describe('strings', function() {
        var typeInfo = gaia.types.string.createType();        

        it('should have \'string\' as name', function() {
            expect(typeInfo.name).eql('string');
        });

        it('should be able to create a value', function() {
            var value = gaia.types.string.create('test');
            expect(value.value).eql('test');
            expect(value.type.name).eql('string');
        });
    });

    describe('decimal', function() {

    });

    describe('should have a children property', function() {
        expect(nspace).to.have.property('children');
    });
});