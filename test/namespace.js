var expect = require('chai').expect;
var gaia = require('../lib/index.js');
var Namespace = gaia.Namespace;
var helpers = require('../lib/helpers.js');

describe('Namespace', function() {
    var proj = gaia.create();
    var name = 'test';
    var nspace = proj.root.children.add(name);

    it('should create a new namespace on add()', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.add(name);
        expect(nspace).to.be.instanceof(Namespace);
    })

    it('should have a children property', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.add(name);
        expect(nspace).to.have.property('children');
    });

    it('should have the parent property', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.add(name);
        expect(nspace).to.have.property('parent');
    });

    it('should have the proper parent', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.add(name);    
        expect(nspace.parent).to.eql(proj.root);
    });

    it('new child should also have the proper parent', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.add(name);
        var child = nspace.children.add('child');
        expect(child.parent).to.eql(nspace);
        nspace.children.remove(child);
        expect(nspace.children.find(child)).to.be.null;
    });

    it('should be able to find a namespace by name', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.add(name);
        var child = nspace.children.add('child');
        expect(nspace.children.indexByName('child')).to.be.at.least(0);
        nspace.children.remove(child);
        expect(nspace.children.find(child)).to.be.null;
    });

    it('should be able to find a namespace by instance', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.add(name);
        var child = nspace.children.add('child');
        expect(nspace.children.indexOf(child)).to.be.at.least(0);
        nspace.children.remove(child);
        expect(nspace.children.find(child)).to.be.null;
    });

    it('child can be deleted', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.add(name);
        var child = nspace.children.add('child');
        expect(nspace.children.indexOf(child)).to.be.at.least(0);
        nspace.children.remove(child);
        expect(nspace.children.find(child)).to.be.null;
    });

    it('should raise an event when a model is added', function(done) {
        var proj = gaia.create();
        // (emitter, event, triggerEvent, callback)
        helpers.validateEvent(proj, 'model-adding', function() { proj.root.models.add('model1'); }, function() {
            helpers.validateEvent(proj, 'model-added', function() { proj.root.models.add('model2'); }, done);
        });
    });
});