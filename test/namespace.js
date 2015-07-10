var expect = require('chai').expect;
var gaia = require('../lib/index.js');
var Namespace = gaia.Namespace;

describe('Namespace', function() {
    var proj = gaia.create();
    var name = 'test';
    var nspace = proj.root.children.add(name);

    it('should create a new namespace on add()', function() {
        expect(nspace).to.be.instanceof(Namespace);
    })

    it('should have a children property', function() {
        expect(nspace).to.have.property('children');
    });

    it('should have the parent property', function() {
        expect(nspace).to.have.property('parent');
    });

    it('should have the proper parent', function() {        
        expect(nspace.parent).to.eql(proj.root);
    });

    it('new child should also have the proper parent', function() {
        var child = nspace.children.add('child');
        expect(child.parent).to.eql(nspace);
        nspace.children.remove(child);
        expect(nspace.children.find(child)).to.be.null;
    });

    it('should be able to find a namespace by name', function() {
        var child = nspace.children.add('child');
        expect(nspace.children.indexOf('child')).to.be.at.least(0);
        nspace.children.remove(child);
        expect(nspace.children.find(child)).to.be.null;
    });

    it('should be able to find a namespace by instance', function() {
        var child = nspace.children.add('child');
        expect(nspace.children.indexOf(child)).to.be.at.least(0);
        nspace.children.remove(child);
        expect(nspace.children.find(child)).to.be.null;
    });

    it('child can be deleted', function() {
        var child = nspace.children.add('child');
        expect(nspace.children.indexOf(child)).to.be.at.least(0);
        nspace.children.remove(child);
        expect(nspace.children.find(child)).to.be.null;
    });
});