var expect = require('chai').expect;
var gaia = require('../lib/index.js');
var Instance = gaia.Instance;
var types = gaia.types;

describe('Instance', function() {
    /*
        Test:
            - Removing mutliple members at the same time
            - Adding multiple members at the same time
            
        Field:
            - valueChanging/ed   
    */

    it('should be able to create a new Instance', () => {
        // Test mutliple depths
        var proj = gaia.create();
        var model = proj.root.models.new('test');
        var instance = proj.root.instances.new('test-instance', model)
        expect(instance).to.be.instanceof(Instance);
    });

    it('should remove a member when the Model\'s member is removed', function() {
        var proj = gaia.create();
        var model = proj.root.models.new('test');
        var instance = proj.root.instances.new('test-instance', model);

        var stringMember = model.members.new('string_name', types.string.create('new_string'));
        var intMember = model.members.new('int_name', types.int.create(12));
        var decimalMember = model.members.new('decimal_name', types.decimal.create(32.1));

        expect(instance.fields.at(0).member).to.equal(stringMember);
        expect(instance.fields.at(1).member).to.equal(intMember);
        expect(instance.fields.at(2).member).to.equal(decimalMember);

        model.members.remove(intMember);
        expect(instance.fields.at(0).member).to.equal(stringMember);
        expect(instance.fields.at(1).member).to.equal(decimalMember);
        expect(instance.fields.length).to.equal(2);
    });    

    it('field indexes should match their model member\'s counterpart', function() {
        var proj = gaia.create();
        var model = proj.root.models.new('test');
        var instance = proj.root.instances.new('test-instance', model);

        var stringMember = model.members.new('string', types.string.create());
        expect(instance.fields.at(0).member).to.equal(stringMember);

        var intMember = model.members.new('int', types.int.create());
        expect(instance.fields.at(1).member).to.equal(intMember);

        var decimalMember = model.members.new('decimal', types.decimal.create());        
        expect(instance.fields.at(2).member).to.equal(decimalMember);
    });
    
    it('moving members should move fields', function() {
        var proj = gaia.create();
        var model = proj.root.models.new('test');
        var instance = proj.root.instances.new('test-instance', model);

        var stringMember = model.members.new('string', types.string.create());
        expect(instance.fields.at(0).member).to.equal(stringMember);

        var intMember = model.members.new('int', types.int.create());
        expect(instance.fields.at(1).member).to.equal(intMember);

        var decimalMember = model.members.new('decimal', types.decimal.create());        
        expect(instance.fields.at(2).member).to.equal(decimalMember);
        
        model.members.move(0, 2);
        expect(instance.fields.at(0).member).to.equal(intMember);
        expect(instance.fields.at(1).member).to.equal(decimalMember);
        expect(instance.fields.at(2).member).to.equal(stringMember);
    });
    
    it('should have isInheriting set correctly', function() {
        var proj = gaia.create();
        var model = proj.root.models.new('test');
        var instance = proj.root.instances.new('test-instance', model);

        var stringMember = model.members.new('string', types.string.create());
        var stringField = instance.fields.get('string');
        expect(stringField.isInheriting).to.be.true;
        expect(stringField.value.equals(stringMember.value)).to.be.true;        

        var intMember = model.members.new('int', types.int.create());
        var intField = instance.fields.get('int');
        expect(intField.member).to.equal(intMember);

        var decimalMember = model.members.new('decimal', types.decimal.create());        
        expect(instance.fields.at(2).member).to.equal(decimalMember);
    });
});