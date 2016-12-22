'use strict';

let expect = require('chai').expect;
let gaia = require('../lib/index.js');
let Instance = gaia.Instance;
let types = gaia.types;

describe('Fields', () => {
    
    it('should be created when a member is created', () => {
       let proj = gaia.create();
       let model = proj.root.models.new('test_me');
       let instance = proj.root.instances.new('test_instance', model);
       model.members.new('test_member', types.uint.value(9));
       let field = instance.fields.at(0);
       expect(field).to.exist;
    });
    
    it('should have equal value with it\'s member when created', () => {
       let proj = gaia.create();
       let model = proj.root.models.new('test_me');
       let instance = proj.root.instances.new('test_instance', model);
       let member = model.members.new('test_member', types.string.value('42 is the answer'));
       let field = instance.fields.at(0);
       expect(field.value.equals(member.value)).to.be.true;
       
       member.value.update('now for something completely different');
       expect(field.isInheriting).to.be.true;
    });
    
    it('should have equal value with it\'s member when the member\'s value changes', () => {
       let proj = gaia.create();
       let model = proj.root.models.new('test_me');
       let instance = proj.root.instances.new('test_instance', model);
       let member = model.members.new('test_member', types.string.value('42 is the answer'));
       let field = instance.fields.at(0);
       expect(field.value.equals(member.value)).to.be.true;
       
       member.value.update('now for something completely different');
       expect(field.isInheriting).to.be.true;
    });
    
    it('should have isInheriting set to true when changes are made to the member', () => {
       let proj = gaia.create();
       let model = proj.root.models.new('test_me');
       let instance = proj.root.instances.new('test_instance', model);
       let member = model.members.new('test_member', types.string.value('42 is the answer'));
       let field = instance.fields.at(0);
       expect(field.isInheriting).to.be.true;
       
       member.value.update('now for something completely different');
       expect(field.isInheriting).to.be.true;
    });
    
    it('should have isInheriting set to false when changes to the field are made', () => {
       let proj = gaia.create();
       let model = proj.root.models.new('test_me');
       let instance = proj.root.instances.new('test_instance', model);
       model.members.new('test_member', types.string.value('flesh wound'));
       let field = instance.fields.at(0);

       expect(field.isInheriting).to.be.true;
       field.value.update('now for something completely different');
       setTimeout(() => expect(field.isInheriting).to.be.false, 10);
    });
    
    it('should have a value equal to the member\'s when inheriting', function() {
        let proj = gaia.create();
        let model = proj.root.models.new('test');
        let instance = proj.root.instances.new('test-instance', model);

        let stringMember = model.members.new('string', types.string.value());
        let stringField = instance.fields.get('string');
        expect(stringField.isInheriting).to.be.true;
        expect(stringField.value.equals(stringMember.value)).to.be.true;        

        let intMember = model.members.new('int', types.int.value());
        let intField = instance.fields.get('int');
        expect(intField.member).to.equal(intMember);
        expect(intField.value.equals(intMember.value)).to.be.true;
    });
    
    it('should have a value not equal to the member\'s when not inheriting', function() {
        let proj = gaia.create();
        let model = proj.root.models.new('test');
        let instance = proj.root.instances.new('test-instance', model);

        let stringMember = model.members.new('string', types.string.value());
        let stringField = instance.fields.get('string');
        stringField.value.update('and now for something completely different');
        setTimeout(() => expect(stringField.isInheriting).to.be.false, 10);
        setTimeout(() => expect(stringField.value.equals(stringMember.value)).to.be.false, 10);
    });

    describe('# Types', function() {
        it('collection', function() {
            let proj = gaia.create();
            let model = proj.root.models.new('test');
            let instance = proj.root.instances.new('test-instance', model);

            let int = types.int;
        
            let collectionMember = model.members.new('collection', types.collection.value(int.type()));
            let collectionField = instance.fields.get('collection');

            let collection = types.collection.value(int.type());
            collection.add(int.value(0), int.value(1), int.value(3), int.value(4), int.value(5))

            collectionMember.value.update(collection);
            setTimeout(() => expect(collectionMember.value.length).to.have.lengthOf(5), 10);
            setTimeout(() => expect(collectionField.value.length).to.have.lengthOf(5), 10);

            setTimeout(() => expect(collectionField.value.at(0).value).to.equal(0), 10);
            setTimeout(() => expect(collectionField.value.at(1).value).to.equal(1), 10);
            setTimeout(() => expect(collectionField.value.at(2).value).to.equal(3), 10);
            setTimeout(() => expect(collectionField.value.at(3).value).to.equal(4), 10);
            setTimeout(() => expect(collectionField.value.at(4).value).to.equal(5), 10);
        });
    })
    
    // TODO: Add events (ie disposed/ing)
});