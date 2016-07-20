var expect = require('chai').expect;
var gaia = require('../lib/index.js');
var Instance = gaia.Instance;
var types = gaia.types;

describe('Fields', () => {
    
    it('should be created when a member is created', () => {
       var proj = gaia.create();
       var model = proj.root.models.new('test_me');
       var instance = proj.root.instances.new('test_instance', model);
       model.members.new('test_member', types.uint.value(9));
       var field = instance.fields.at(0);
       expect(field).to.exist;
    });
    
    it('should have equal value with it\'s member when created', () => {
       var proj = gaia.create();
       var model = proj.root.models.new('test_me');
       var instance = proj.root.instances.new('test_instance', model);
       var member = model.members.new('test_member', types.string.value('42 is the answer'));
       var field = instance.fields.at(0);
       expect(field.value.equals(member.value)).to.be.true;
       
       member.value.value = 'now for something completely different';
       expect(field.isInheriting).to.be.true;
    });
    
    it('should have equal value with it\'s member when the member\'s value changes', () => {
       var proj = gaia.create();
       var model = proj.root.models.new('test_me');
       var instance = proj.root.instances.new('test_instance', model);
       var member = model.members.new('test_member', types.string.value('42 is the answer'));
       var field = instance.fields.at(0);
       expect(field.value.equals(member.value)).to.be.true;
       
       member.value.value = 'now for something completely different';
       expect(field.isInheriting).to.be.true;
    });
    
    it('should have isInheriting set to true when changes are made to the member', () => {
       var proj = gaia.create();
       var model = proj.root.models.new('test_me');
       var instance = proj.root.instances.new('test_instance', model);
       var member = model.members.new('test_member', types.string.value('42 is the answer'));
       var field = instance.fields.at(0);
       expect(field.isInheriting).to.be.true;
       
       member.value.value = 'now for something completely different';
       expect(field.isInheriting).to.be.true;
    });
    
    it('should have isInheriting set to false when changes to the field are made', () => {
       var proj = gaia.create();
       var model = proj.root.models.new('test_me');
       var instance = proj.root.instances.new('test_instance', model);
       model.members.new('test_member', types.string.value('flesh wound'));
       var field = instance.fields.at(0);

       expect(field.isInheriting).to.be.true;
       field.value.value = 'now for something completely different';
       setTimeout(() => expect(field.isInheriting).to.be.false, 10);
    });
    
    it('should have a value equal to the member\'s when inheriting', function() {
        var proj = gaia.create();
        var model = proj.root.models.new('test');
        var instance = proj.root.instances.new('test-instance', model);

        var stringMember = model.members.new('string', types.string.value());
        var stringField = instance.fields.get('string');
        expect(stringField.isInheriting).to.be.true;
        expect(stringField.value.equals(stringMember.value)).to.be.true;        

        var intMember = model.members.new('int', types.int.value());
        var intField = instance.fields.get('int');
        expect(intField.member).to.equal(intMember);
        expect(intField.value.equals(intMember.value)).to.be.true;
    });
    
    it('should have a value not equal to the member\'s when not inheriting', function() {
        var proj = gaia.create();
        var model = proj.root.models.new('test');
        var instance = proj.root.instances.new('test-instance', model);

        var stringMember = model.members.new('string', types.string.value());
        var stringField = instance.fields.get('string');
        stringField.value.value = 'and now for something completely different';
        setTimeout(() => expect(stringField.isInheriting).to.be.false, 10);
        setTimeout(() => expect(stringField.value.equals(stringMember.value)).to.be.false, 10);
    });
    
    // TODO: Add events (ie disposed/ing)
});