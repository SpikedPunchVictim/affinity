var chai = require('chai');
var expect = chai.expect;
var spies = require('chai-spies');
var gaia = require('../lib/index.js');
var Events = require('../lib/events.js');
var Model = gaia.Model;
var types = gaia.types;

chai.use(spies);

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
        var model1 = proj.root.models.new('test');
        var model2 = proj.root.children.new('child').models.new('test2');
        expect(model1).to.be.instanceof(Model);
        expect(model2).to.be.instanceof(Model);
    });
    
    describe('# Events', () => {
        var tests = [
          {
              event: Events.model.adding,
              sub: (model, spy) => model.on(Events.model.adding, spy),
              act: model => model.members.new('member1', types.string.create('test-me'))
          },
          {
              event: Events.model.added,
              sub: (model, spy) => model.on(Events.model.added, spy),
              act: model => model.members.new('member1', types.string.create('test-me'))
          },
          {
              event: Events.model.moving,
              sub: (model, spy) => model.on(Events.model.moving, spy),
              act: model => {
                  model.members.new('member1', types.string.create('test-me'));
                  model.members.new('member2', types.int.create(12));
                  model.members.move(0, 1);
              }
          },
          {
              event: Events.model.moved,
              sub: (model, spy) => model.on(Events.model.moved, spy),
              act: model => {
                  model.members.new('member1', types.string.create('test-me'));
                  model.members.new('member2', types.int.create(12));
                  model.members.move(0, 1);
              }
          },
          {
              event: Events.model.removing,
              sub: (model, spy) => model.on(Events.model.removing, spy),
              act: model => {
                  model.members.new('member1', types.string.create('test-me'));
                  model.members.removeAt(0);
              }
          },
          {
              event: Events.model.removed,
              sub: (model, spy) => model.on(Events.model.removed, spy),
              act: model => {
                  model.members.new('member1', types.string.create('test-me'));
                  model.members.removeAt(0);
              }
          },
          {
              event: Events.model.valueChanging,
              sub: (model, spy) => model.on(Events.model.valueChanging, spy),
              act: model => {
                  var mem = model.members.new('member1', types.string.create('test-me'));
                  mem.value.value = '2';
              }
          },
          {
              event: Events.model.valueChanged,
              sub: (model, spy) => model.on(Events.model.valueChanging, spy),
              act: model => {
                  var mem = model.members.new('member1', types.string.create('test-me'));
                  mem.value.value = '2';
              }
          }
        ];
                    
        tests.forEach(test => {
            it('should emit event ' + test.event, () => {
                var spy = chai.spy();
                var proj = gaia.create();
                var model = proj.root.models.new(test.event);
                test.sub(model, spy);
                test.act(model);
                setTimeout(() => { expect(spy).to.have.been.called(); done(); }, 10);
            });
        });
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