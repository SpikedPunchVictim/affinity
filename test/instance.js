var expect = require('chai').expect;
var gaia = require('../lib/index.js');
var Instance = gaia.Instance;
var types = gaia.types;

function testMemberCreation(createValue) {
    var proj = gaia.create();
    var model = proj.root.models.add('test');
    var instance = proj.root.instances.add('test-instance', model)
    var name = 'test-member-name';
    var value = createValue();
    var member = model.members.add(name, value);
    var member = instance.members.get(name);

    var member = model.members.add(name, value);
    expect(member.name).to.equal(name);
    expect(member.name).to.equal(name);

    expect(member.value.equals(value)).to.be.true;
    expect(member.value.equals(value)).to.be.true;

    expect(member.type.equals(value.type)).to.be.true;
    expect(member.type.equals(value.type)).to.be.true; 
}

describe('Instance', function() {

    it('should be able to create a new Instance', function() {
        // Test mutliple depths
        var proj = gaia.create();
        var model = proj.root.models.add('test');
        var instance = proj.root.instances.add('test-instance', model)
        expect(instance).to.be.instanceof(Instance);
    });

    it('should be able to inherit member: bool', function() {
        testMemberCreation(function() { return gaia.types.bool.create(); });
    });

    // it('should be able to create member: collection', function() {
    //     testCreatedType(function() { return gaia.types.collection.create(gaia.types.string.type()); });
    // });

    // it('should be able to create member: decimal', function() {
    //     testCreatedType(function() { return gaia.types.decimal.create(); });
    // });

    // it('should be able to create member: string', function() {
    //     testCreatedType(function() { return gaia.types.string.create(); });
    // });


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