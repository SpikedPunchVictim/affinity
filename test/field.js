'use strict';

let expect = require('chai').expect;
let affinity = require('../lib/index.js');
let Instance = affinity.Instance;
let types = affinity.types;

describe('Fields', () => {

   it('should be created when a member is created', () => {
      let proj = affinity.create();
      let model = proj.root.models.new('test_me');
      let instance = proj.root.instances.new('test_instance', model);
      model.members.new('test_member', types.uint.value(9));
      let field = instance.fields.at(0);
      expect(field).to.exist;
   });

   it('should have equal value with it\'s member when created', () => {
      let proj = affinity.create();
      let model = proj.root.models.new('test_me');
      let instance = proj.root.instances.new('test_instance', model);
      let member = model.members.new('test_member', types.string.value('42 is the answer'));
      let field = instance.fields.at(0);
      expect(field.value.equals(member.value)).to.be.true;

      member.value.update('now for something completely different');
      expect(field.isInheriting).to.be.true;
   });

   it('should have equal value with it\'s member when the member\'s value changes', () => {
      let proj = affinity.create();
      let model = proj.root.models.new('test_me');
      let instance = proj.root.instances.new('test_instance', model);
      let member = model.members.new('test_member', types.string.value('42 is the answer'));
      let field = instance.fields.at(0);
      expect(field.value.equals(member.value)).to.be.true;

      member.value.update('now for something completely different');
      expect(field.isInheriting).to.be.true;
   });

   it('should have isInheriting set to true when changes are made to the member', () => {
      let proj = affinity.create();
      let model = proj.root.models.new('test_me');
      let instance = proj.root.instances.new('test_instance', model);
      let member = model.members.new('test_member', types.string.value('42 is the answer'));
      let field = instance.fields.at(0);
      expect(field.isInheriting).to.be.true;

      member.value.update('now for something completely different');
      expect(field.isInheriting).to.be.true;
   });

   it('should have isInheriting set to false when changes to the field are made', () => {
      let proj = affinity.create();
      let model = proj.root.models.new('test_me');
      let instance = proj.root.instances.new('test_instance', model);
      model.members.new('test_member', types.string.value('flesh wound'));
      let field = instance.fields.at(0);

      expect(field.isInheriting).to.be.true;
      field.value.update('now for something completely different');
      setTimeout(() => expect(field.isInheriting).to.be.false, 10);
   });

   it('should have a value equal to the member\'s when inheriting', function() {
      let proj = affinity.create();
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
      let proj = affinity.create();
      let model = proj.root.models.new('test');
      let instance = proj.root.instances.new('test-instance', model);

      let stringMember = model.members.new('string', types.string.value());
      let stringField = instance.fields.get('string');
      stringField.value.update('and now for something completely different');
      setTimeout(() => expect(stringField.isInheriting).to.be.false, 10);
      setTimeout(() => expect(stringField.value.equals(stringMember.value)).to.be.false, 10);
   });

   describe('# Types', function() {
      it('collection', function(done) {
         let proj = affinity.create();
         let model = proj.root.models.new('test');
         let instance = proj.root.instances.new('test-instance', model);

         let int = types.int;

         let collectionMember = model.members.new('collection', types.collection.value(int.type()));
         let collectionField = instance.fields.get('collection');

         let collection = types.collection.value(int.type());
         
         collection.add(int.value(0), int.value(1), int.value(3), int.value(4), int.value(5))
            .then(_ => {
               return collectionMember.value.update(collection);
            })
            .then(_ => {
               expect(collectionMember.value).to.have.lengthOf(5);
               return;
            })
            .catch(err => done(err));

         collectionField.once(affinity.events.field.valueChanged, () => {
            expect(collectionField.value).to.have.lengthOf(5);

            expect(collectionField.value.at(0).value).to.equal(0);
            expect(collectionField.value.at(1).value).to.equal(1);
            expect(collectionField.value.at(2).value).to.equal(3);
            expect(collectionField.value.at(3).value).to.equal(4);
            expect(collectionField.value.at(4).value).to.equal(5);

            done();
         })
      });
   })

   // TODO: Add events (ie disposed/ing)
});