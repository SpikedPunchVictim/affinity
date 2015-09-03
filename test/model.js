var expect = require('chai').expect;
var gaia = require('../lib/index.js');
var utility = require('../lib/utility.js');
var Model = gaia.Model;
var types = gaia.types;

function testCreatedType(createValue) {
    var proj = gaia.create();
    var model = proj.root.models.add('test');
    var name = 'name';
    var value = createValue();

    var member = model.members.add(name, value);
    expect(member.type.equals(value.type)).to.be.true;
    expect(member.value.equals(value)).to.be.true;    
}


describe('Model', function() {

    it('should be able to create a new Model', function() {
        // Test mutliple depths
        var proj = gaia.create();
        var model1 = proj.root.models.add('test');
        var model2 = proj.root.children.add('child').models.add('test2');
        expect(model1).to.be.instanceof(Model);
        expect(model2).to.be.instanceof(Model);
    });

    it('should be able to create member: bool', function() {
        testCreatedType(function() { return types.bool.create(); });
    });

    it('should be able to create member: collection', function() {
        testCreatedType(function() { return types.collection.create(types.string.type()); });
    });

    it('should be able to create member: decimal', function() {
        testCreatedType(function() { return types.decimal.create(); });
    });

    it('should be able to create member: string', function() {
        testCreatedType(function() { return types.string.create(); });
    });

    it('should be able to create member: int', function() {
        testCreatedType(function() { return types.int.create(); });
    });

    it('should be able to create member: uint', function() {
        testCreatedType(function() { return types.uint.create(); });
    });

    it('should raise an event on member change: adding', function(done) {
        var proj = gaia.create();
        var model = proj.root.models.add('test');

        // (emitter, event, triggerEvent, callback)
        utility.validateEvent(proj, Model.events.adding, function() { model.members.add('model1', ty); }, done);
    });

    it('should raise an event on member change: added', function(done) {
        var proj = gaia.create();
        var model = proj.root.models.add('test');

        // (emitter, event, triggerEvent, callback)
        utility.validateEvent(proj, Model.events.added, function() { model.members.add('member', types.string.create()); }, done);
    });

    it('should raise an event on member change: removing', function(done) {
        var proj = gaia.create();
        var model = proj.root.models.add('test');

        // (emitter, event, triggerEvent, callback)
        utility.validateEvent(proj, Model.events.removing, function() { proj.root.models.add('model1'); }, done);
    });

    it('should raise an event on member change: removing', function(done) {
        var proj = gaia.create();
        var model = proj.root.models.add('test');
        model.members.add('test');

        // (emitter, event, triggerEvent, callback)
        utility.validateEvent(proj, Model.events.removing, function() { model.members.remove('test'); }, done);
    });

    it('should raise an event on member change: removed', function(done) {
        var proj = gaia.create();
        var model = proj.root.models.add('test');
        model.members.add('test');

        // (emitter, event, triggerEvent, callback)
        utility.validateEvent(proj, Model.events.removed, function() { model.members.remove('test'); }, done);
    });


    // it('should have a children property', function() {
    //     expect(nspace).to.have.property('children');
    // });

    // it('should have the parent property', function() {
    //     expect(nspace).to.have.property('parent');
    // });

    // it('should have the proper parent', function() {        
    //     expect(nspace.parent).to.eql(proj.root);
    // });

    // it('new child should also have the proper parent', function() {
    //     var child = nspace.children.add('child');
    //     expect(child.parent).to.eql(nspace);
    //     nspace.children.remove(child);
    //     expect(nspace.children.find(child)).to.be.null;
    // });

    // it('should be able to find a namespace by name', function() {
    //     var child = nspace.children.add('child');
    //     expect(nspace.children.indexOf('child')).to.be.at.least(0);
    //     nspace.children.remove(child);
    //     expect(nspace.children.find(child)).to.be.null;
    // });

    // it('should be able to find a namespace by instance', function() {
    //     var child = nspace.children.add('child');
    //     expect(nspace.children.indexOf(child)).to.be.at.least(0);
    //     nspace.children.remove(child);
    //     expect(nspace.children.find(child)).to.be.null;
    // });

    // it('child can be deleted', function() {
    //     var child = nspace.children.add('child');
    //     expect(nspace.children.indexOf(child)).to.be.at.least(0);
    //     nspace.children.remove(child);
    //     expect(nspace.children.find(child)).to.be.null;
    // });
});