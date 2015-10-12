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

    var modelMember = model.members.add(name, value);
    var instanceMember = instance.members.get(name);

    expect(modelMember.type.equals(value.type)).to.be.true;
    expect(modelMember.name).to.equal(name);
    expect(modelMember.value.equals(value)).to.be.true;

    expect(instanceMember.type.equals(value.type)).to.be.true; 
    expect(instanceMember.name).to.equal(name);   
    expect(instanceMember.value.equals(value)).to.be.true;
}

describe('Instance', function() {

    it('should be able to create a new Instance', function() {
        // Test mutliple depths
        var proj = gaia.create();
        var model = proj.root.models.add('test');
        var instance = proj.root.instances.add('test-instance', model)
        expect(instance).to.be.instanceof(Instance);
    });

    it('should remove a member when the Model\'s member is removed', function() {
        var proj = gaia.create();
        var model = proj.root.models.add('test');
        var instance = proj.root.instances.add('test-instance', model);

        // [REMOVE]
        console.log("types.String.create(): %j", types.String.create());
        
        var stringMember = model.members.add('stringMember', types.String.create());
        var intMember = model.members.add('intMember', types.Int.create());
        var decimalMember = model.members.add('decimalMember', types.Decimal.create());

        expect(instance.members.at(0).modelMember).to.equal(stringMember);
        expect(instance.members.at(1).modelMember).to.equal(intMember);
        expect(instance.members.at(2).modelMember).to.equal(decimalMember);

        model.members.remove(intMember);
        expect(instance.members.at(0).modelMember).to.equal(stringMember);
        expect(instance.members.at(1).modelMember).to.equal(decimalMember);
        expect(instance.members.length).to.equal(2);
    });

    it('should add a member when member is added to the Model', function() {
        var proj = gaia.create();
        var model = proj.root.models.add('test');
        var instance = proj.root.instances.add('test-instance', model);

        var stringMember = model.members.add('stringMember', types.String.create());
        expect(instance.members.at(0).modelMember).to.equal(stringMember);

        var intMember = model.members.add('intMember', types.int.create());
        expect(instance.members.at(1).modelMember).to.equal(intMember);

        var decimalMember = model.members.add('decimalMember', types.Decimal.create());        
        expect(instance.members.at(2).modelMember).to.equal(decimalMember);
    });

    it('InstanceMember indexes should match their model member\'s counterpart', function() {
        var proj = gaia.create();
        var model = proj.root.models.add('test');
        var instance = proj.root.instances.add('test-instance', model);

        var stringMember = model.members.add('stringMember', types.String.create());
        expect(instance.members.at(0).modelMember).to.equal(stringMember);

        var intMember = model.members.add('intMember', types.int.create());
        expect(instance.members.at(1).modelMember).to.equal(intMember);

        var decimalMember = model.members.add('decimalMember', types.Decimal.create());        
        expect(instance.members.at(2).modelMember).to.equal(decimalMember);
    });

    it('changing a value model member should also update the inheriting instances', function() {
        // Test both inheriting and non-inheriting instances
    });

    it('should no longer inherit when setting an instance member\'s value', function() {

    });

    describe('#Types', function() {
        it('should be able to inherit member: bool', function() {
            testMemberCreation(function() { return gaia.types.Bool.create(); });
        });

        it('should be able to create member: collection', function() {
            testMemberCreation(function() { return gaia.types.collection.create(gaia.types.String.type()); });
        });

        it('should be able to create member: decimal', function() {
            testMemberCreation(function() { return gaia.types.Decimal.create(); });
        });

        it('should be able to create member: string', function() {
            testMemberCreation(function() { return gaia.types.String.create(); });
        });
    });
});