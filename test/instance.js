'use strict';

var chai = require('chai');
var expect = chai.expect;
var spies = require('chai-spies');
var affinity = require('../lib/index.js');
var Events = require('../lib/events.js');
var Instance = affinity.Instance;
var types = affinity.types;

describe('Instance', function() {
    /*
        Test:
            - Removing mutliple members at the same time
            - Adding multiple members at the same time
            - Cannot add more fields than the model has
            - Field names must be unique
            
        Field:
            - valueChanging/ed   
    */

    it('should be able to create a new Instance', () => {
        // Test mutliple depths
        var proj = affinity.create();
        var model = proj.root.models.new('test');
        var instance = proj.root.instances.new('test-instance', model)
        expect(instance).to.be.instanceof(Instance);
    });

    it('should have matching fields for each model member (model created before)', () => {
        var proj = affinity.create();
        
        var model = proj.root.models.new('test');
        model.members.new('one', types.string.value());
        model.members.new('two', types.uint.value());
        model.members.new('three', types.int.value());
        model.members.new('four', types.bool.value());

        var instance = proj.root.instances.new('test-instance', model);
        expect(instance.fields.at(0).member).to.equal(model.members.at(0));
        expect(instance.fields.at(1).member).to.equal(model.members.at(1));
        expect(instance.fields.at(2).member).to.equal(model.members.at(2));
        expect(instance.fields.at(3).member).to.equal(model.members.at(3));

        expect(instance.fields.at(0)).to.exist;
        expect(instance.fields.at(1)).to.exist;
        expect(instance.fields.at(2)).to.exist;
        expect(instance.fields.at(3)).to.exist;
    });

    it('should remove a member when the Model\'s member is removed', function() {
        var proj = affinity.create();
        var model = proj.root.models.new('test');
        var instance = proj.root.instances.new('test-instance', model);

        var stringMember = model.members.new('string_name', types.string.value('new_string'));
        var intMember = model.members.new('int_name', types.int.value(12));
        var decimalMember = model.members.new('decimal_name', types.decimal.value(32.1));

        expect(instance.fields.at(0).member).to.equal(stringMember);
        expect(instance.fields.at(1).member).to.equal(intMember);
        expect(instance.fields.at(2).member).to.equal(decimalMember);

        model.members.remove(intMember);
        expect(instance.fields.at(0).member).to.equal(stringMember);
        expect(instance.fields.at(1).member).to.equal(decimalMember);
        expect(instance.fields.length).to.equal(2);
    });    

    it('field indexes should match their model member\'s counterpart', function() {
        var proj = affinity.create();
        var model = proj.root.models.new('test');
        var instance = proj.root.instances.new('test-instance', model);

        var stringMember = model.members.new('string', types.string.value());
        expect(instance.fields.at(0).member).to.equal(stringMember);

        var intMember = model.members.new('int', types.int.value());
        expect(instance.fields.at(1).member).to.equal(intMember);

        var decimalMember = model.members.new('decimal', types.decimal.value());        
        expect(instance.fields.at(2).member).to.equal(decimalMember);
    });
    
    it('moving members should move fields', function() {
        var proj = affinity.create();
        var model = proj.root.models.new('test');
        var instance = proj.root.instances.new('test-instance', model);

        var stringMember = model.members.new('string', types.string.value());
        expect(instance.fields.at(0).member).to.equal(stringMember);

        var intMember = model.members.new('int', types.int.value());
        expect(instance.fields.at(1).member).to.equal(intMember);

        var decimalMember = model.members.new('decimal', types.decimal.value());        
        expect(instance.fields.at(2).member).to.equal(decimalMember);
        
        model.members.move(0, 2);
        expect(instance.fields.at(0).member).to.equal(intMember);
        expect(instance.fields.at(1).member).to.equal(decimalMember);
        expect(instance.fields.at(2).member).to.equal(stringMember);
    });
    
    it('should have isInheriting set correctly', function() {
        var proj = affinity.create();
        var model = proj.root.models.new('test');
        var instance = proj.root.instances.new('test-instance', model);

        var stringMember = model.members.new('string', types.string.value());
        var stringField = instance.fields.get('string');
        expect(stringField.isInheriting).to.be.true;
        expect(stringField.value.equals(stringMember.value)).to.be.true;

        stringField.value.update(types.string.value('changed value'))
            .then(_ => {
                expect(stringField.isInheriting).to.be.false;

                var intMember = model.members.new('int', types.int.value());
                var intField = instance.fields.get('int');
                expect(intField.member).to.equal(intMember);

                var decimalMember = model.members.new('decimal', types.decimal.value());        
                expect(instance.fields.at(2).member).to.equal(decimalMember);
            });
    });
    
    describe('# Events', () => {
        var tests = [
          {
              event: Events.instance.fieldAdding,
              sub: (model, inst, spy) => inst.on(Events.instance.fieldAdding, spy),
              act: (model, inst) => {
                model.members.new('member1', types.string.value('test-me'));
              }
          },
          {
              event: Events.instance.fieldAdded,
              sub: (model, inst, spy) => inst.on(Events.instance.fieldAdded, spy),
              act: (model, inst) => model.members.new('member1', types.string.value('test-me'))
          },
          {
              event: Events.instance.fieldInheritedChanging,
              sub: (model, inst, spy) => inst.on(Events.instance.fieldInheritedChanging, spy),
              act: (model, inst) => {
                  model.members.new('member1', types.string.value('test-me'));
                  let field = inst.fields.get('member1');
                  field.value.update('another-value');
              }
          },
          {
              event: Events.instance.fieldInheritedChanged,
              sub: (model, inst, spy) => inst.on(Events.instance.fieldInheritedChanged, spy),
              act: (model, inst) => {
                  model.members.new('member1', types.string.value('test-me'));
                  let field = inst.fields.get('member1');
                  field.value.update('another-value');
              }
          },
          {
              event: Events.instance.fieldMoving,
              sub: (model, inst, spy) => inst.on(Events.instance.fieldMoving, spy),
              act: (model, inst) => {
                  model.members.new('member1', types.string.value('test-me'));
                  model.members.new('member2', types.string.value('test-me'));
                  model.members.move(0, 1);
              }
          },
          {
              event: Events.instance.fieldMoved,
              sub: (model, inst, spy) => inst.on(Events.instance.fieldMoved, spy),
              act: (model, inst) => {
                  model.members.new('member1', types.string.value('test-me'));
                  model.members.new('member2', types.string.value('test-me'));
                  model.members.move(0, 1);
              }
          },
          {
              event: Events.instance.fieldNameChanged,
              sub: (model, inst, spy) => inst.on(Events.instance.fieldNameChanged, spy),
              act: (model, inst) => {
                  var mem = model.members.new('member1', types.string.value('test-me'));
                  mem.name = 'another-name';
              }
          },
          {
              event: Events.instance.fieldRemoving,
              sub: (model, inst, spy) => inst.on(Events.instance.fieldRemoving, spy),
              act: (model, inst) => {
                  var mem = model.members.new('member1', types.string.value('test-me'));
                  model.members.remove(mem);
              }
          },
          {
              event: Events.instance.fieldRemoved,
              sub: (model, inst, spy) => inst.on(Events.instance.fieldRemoved, spy),
              act: (model, inst) => {
                  var mem = model.members.new('member1', types.string.value('test-me'));
                  model.members.remove(mem);
              }
          },
          {
              event: Events.instance.fieldResetStart,
              sub: (model, inst, spy) => inst.on(Events.instance.fieldResetStart, spy),
              act: (model, inst) => {
                  let mem = model.members.new('member1', types.string.value('test-me'));
                  let field = inst.fields.get('member1');
                  field.value.update('another-value');
                  field.reset();
              }
          },
          {
              event: Events.instance.fieldResetEnd,
              sub: (model, inst, spy) => inst.on(Events.instance.fieldResetEnd, spy),
              act: (model, inst) => {
                  let mem = model.members.new('member1', types.string.value('test-me'));
                  let field = inst.fields.get('member1');
                  field.value.update('another-value');
                  field.reset();
              }
          },
          {
              event: Events.instance.fieldValueChanging,
              sub: (model, inst, spy) => inst.on(Events.instance.fieldValueChanging, spy),
              act: (model, inst) => {
                  let mem = model.members.new('member1', types.string.value('test-me'));
                  let field = inst.fields.get('member1');
                  field.value.update('another-value');
              }
          },
          {
              event: Events.instance.fieldValueChanged,
              sub: (model, inst, spy) => inst.on(Events.instance.fieldValueChanged, spy),
              act: (model, inst) => {
                  let mem = model.members.new('member1', types.string.value('test-me'));
                  let field = inst.fields.get('member1');
                  field.value.update('another-value');
              }
          },
          {
              event: Events.disposing,
              sub: (model, inst, spy) => inst.on(Events.disposing, spy),
              act: (model, inst) => {
                  // Note: dispose with a field
                  let mem = model.members.new('member1', types.string.value('test-me'));
                  inst.dispose();
              }
          },
          {
              event: Events.disposed,
              sub: (model, inst, spy) => inst.on(Events.disposed, spy),
              act: (model, inst) => {
                  // Note: dispose with a field
                  let mem = model.members.new('member1', types.string.value('test-me'));
                  inst.dispose();
              }
          }
        ];
                    
        tests.forEach((test, index) => {
            it('should emit event ' + test.event, function(done) {
                let spy = chai.spy();
                let proj = affinity.create();
                let model = proj.root.models.new(test.event);
                let inst = proj.root.instances.new(test.event, model);
                test.sub(model, inst, spy);
                test.act(model, inst);
                setTimeout(() => {
                    expect(spy).to.have.been.called();
                    expect(spy).to.have.been.called.once;
                    done();
                }, 10);
            });
        });
    });
});