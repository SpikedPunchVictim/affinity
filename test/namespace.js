var chai = require('chai');
var expect = chai.expect;
var spies = require('chai-spies');
var gaia = require('../lib/index.js');
var Namespace = gaia.Namespace;
var Events = require('../lib/events.js');

chai.use(spies);

describe('Namespace', function() {

    it('should create a new namespace on new()', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.new(name);
        expect(nspace).to.be.instanceof(Namespace);
        expect(proj.root.children.length).to.equal(1);
        expect(proj.root.children.at(0).name).to.be.equal(name);
    })

    it('should have a children property', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.new(name);
        expect(nspace).to.have.property('children');
    });

    it('should have the parent property', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.new(name);
        expect(nspace).to.have.property('parent');
    });

    it('should have the proper parent', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.new(name);    
        expect(nspace.parent).to.eql(proj.root);
    });

    it('new child should also have the proper parent', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.new(name);
        var child = nspace.children.new('child');
        expect(child.parent).to.eql(nspace);
        nspace.children.remove(child);
        expect(nspace.children.indexOf(child)).to.be.equal(-1);
    });

    it('should be able to find a namespace by name', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.new(name);
        var child = nspace.children.new('child');
        expect(nspace.children.indexByName('child')).to.be.at.least(0);
        expect(nspace.find('child')).to.be.eql(child);
        var grandChild = child.children.new('grand_child');
        expect(nspace.find('child.grand_child')).to.be.eql(grandChild);
        expect(proj.root.find('test.child.grand_child')).to.be.eql(grandChild);
    });

    it('should be able to find a namespace by instance', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.new(name);
        var child = nspace.children.new('child');
        expect(nspace.children.indexOf(child)).to.be.at.least(0);
        nspace.children.remove(child);
        expect(nspace.children.indexOf(child)).to.be.equal(-1);
    });

    it('child can be deleted', function() {
        var proj = gaia.create();
        var name = 'test';
        var nspace = proj.root.children.new(name);
        var child = nspace.children.new('child');
        expect(nspace.children.indexOf(child)).to.be.at.least(0);
        nspace.children.remove(child);
        expect(nspace.children.indexOf(child)).to.be.equal(-1);
    });
    
    it('child can be moved', function() {
        var proj = gaia.create();

        var zero = proj.root.children.new('zero');
        var one = proj.root.children.new('one');
        var two = proj.root.children.new('two');
        var three = proj.root.children.new('three');
        var four = proj.root.children.new('four');
        
        expect(proj.root.children.length).to.be.eql(5);
        proj.root.children.move(3, 1);
        expect(proj.root.children.at(0)).to.be.equal(zero);
        expect(proj.root.children.at(1)).to.be.equal(three);
        expect(proj.root.children.at(2)).to.be.equal(one);
        expect(proj.root.children.at(3)).to.be.equal(two);
        expect(proj.root.children.at(4)).to.be.equal(four);
    });
    
    it('model can be moved', function() {
        var proj = gaia.create();

        var zero = proj.root.models.new('zero');
        var one = proj.root.models.new('one');
        var two = proj.root.models.new('two');
        var three = proj.root.models.new('three');
        var four = proj.root.models.new('four');
        
        expect(proj.root.models.length).to.be.eql(5);
        proj.root.models.move(3, 1);
        expect(proj.root.models.at(0)).to.be.equal(zero);
        expect(proj.root.models.at(1)).to.be.equal(three);
        expect(proj.root.models.at(2)).to.be.equal(one);
        expect(proj.root.models.at(3)).to.be.equal(two);
        expect(proj.root.models.at(4)).to.be.equal(four);
    });
    
    it('instances can be moved', function() {
        var proj = gaia.create();

        var model = proj.root.models.new('model1');
        var zero = proj.root.instances.new('zero', model);
        var one = proj.root.instances.new('one', model);
        var two = proj.root.instances.new('two', model);
        var three = proj.root.instances.new('three', model);
        var four = proj.root.instances.new('four', model);
        
        expect(proj.root.instances.length).to.be.eql(5);
        proj.root.instances.move(3, 1);
        expect(proj.root.instances.at(0)).to.be.equal(zero);
        expect(proj.root.instances.at(1)).to.be.equal(three);
        expect(proj.root.instances.at(2)).to.be.equal(one);
        expect(proj.root.instances.at(3)).to.be.equal(two);
        expect(proj.root.instances.at(4)).to.be.equal(four);
    });
    
    describe('#Events', () => {
        
        /*
        childAdding: 'namespace-child-adding',
        childAdded: 'namespace-child-added',
        childMoving: 'namespace-child-moving',
        childMoved: 'namespace-child-moved',
        childRemoving: 'namespace-child-removing',
        childRemoved: 'namespace-child-removed',
        modelAdding: 'namespace-model-adding',
        modelAdded: 'namespace-model-added',
        modelMoving: 'namespace-model-moving',
        modelMoved: 'namespace-model-moved',
        modelRemoving: 'namespace-model-removing',
        modelRemoved: 'namespace-model-removed',
        instanceAdding: 'namespace-instance-adding',
        instanceAdded: 'namespace-instance-added',
        instanceMoving: 'namespace-instance-moving',
        instanceMoved: 'namespace-instance-moved',
        instanceRemoving: 'namespace-instance-removing',
        instanceRemoved: 'namespace-instance-removed'  
        */
        
        var tests = [
            {
                'desc': Events.namespace.childAdding + ' on new()',
                'event': Events.namespace.childAdding,
                'act': n => n.children.new('test')
            },
            {
                'desc': Events.namespace.childAdded + ' on new()',
                'event': Events.namespace.childAdded,
                'act': n => n.children.new('test')
            },
            {
                'desc': Events.namespace.childMoving + ' on move()',
                'event': Events.namespace.childMoving,
                'act': n => {
                    n.children.new('zero');
                    n.children.new('one');
                    n.children.new('two');
                    n.children.new('three');
                    n.children.new('four');
                    n.children.move(4, 1);                    
                }
            },
            {
                'desc': Events.namespace.childMoved + ' on move()',
                'event': Events.namespace.childMoved,
                'act': n => {
                    n.children.new('zero');
                    n.children.new('one');
                    n.children.new('two');
                    n.children.new('three');
                    n.children.new('four');
                    n.children.move(4, 1);                    
                }
            },
            {
                'desc': Events.namespace.childRemoving + ' on remove()',
                'event': Events.namespace.childRemoving,
                'act': n => {
                    var child = n.children.new('test');
                    n.children.remove(child);
                }
            },
            {
                'desc': Events.namespace.childRemoved + ' on remove()',
                'event': Events.namespace.childRemoved,
                'act': n => {
                    var child = n.children.new('test');
                    n.children.remove(child);
                }
            },            
            //-- Models
            {
                'desc': Events.namespace.modelAdding + ' on new()',
                'event': Events.namespace.modelAdding,
                'act': n => n.models.new('test')
            },
            {
                'desc': Events.namespace.modelAdded + ' on new()',
                'event': Events.namespace.modelAdded,
                'act': n => n.models.new('test')
            },
            {
                'desc': Events.namespace.modelMoving + ' on move()',
                'event': Events.namespace.modelMoving,
                'act': n => {
                    n.models.new('zero');
                    n.models.new('one');
                    n.models.new('two');
                    n.models.new('three');
                    n.models.new('four');
                    n.models.move(4, 1);                    
                }
            },
            {
                'desc': Events.namespace.modelMoved + ' on move()',
                'event': Events.namespace.modelMoved,
                'act': n => {
                    n.models.new('zero');
                    n.models.new('one');
                    n.models.new('two');
                    n.models.new('three');
                    n.models.new('four');
                    n.models.move(4, 1);                    
                }
            },
            {
                'desc': Events.namespace.modelRemoving + ' on remove()',
                'event': Events.namespace.modelRemoving,
                'act': n => {
                    var child = n.models.new('test');
                    n.models.remove(child);
                }
            },
            {
                'desc': Events.namespace.modelRemoved + ' on remove()',
                'event': Events.namespace.modelRemoved,
                'act': n => {
                    var child = n.models.new('test');
                    n.models.remove(child);
                }
            },
            //-- Instances
            {
                'desc': Events.namespace.instanceAdding + ' on new()',
                'event': Events.namespace.instanceAdding,
                'act': n => {
                    var model = n.models.new('model');
                    n.instances.new('test', model);
                }
            },
            {
                'desc': Events.namespace.instanceAdded + ' on new()',
                'event': Events.namespace.instanceAdded,
                'act': n => {
                    var model = n.models.new('model');
                    n.instances.new('test', model);
                }
            },
            {
                'desc': Events.namespace.instanceMoving + ' on move()',
                'event': Events.namespace.instanceMoving,
                'act': n => {
                    var model = n.models.new('model');
                    n.instances.new('zero', model);
                    n.instances.new('one', model);
                    n.instances.new('two', model);
                    n.instances.new('three', model);
                    n.instances.new('four', model);
                    n.instances.move(4, 1);                    
                }
            },
            {
                'desc': Events.namespace.instanceMoved + ' on move()',
                'event': Events.namespace.instanceMoved,
                'act': n => {
                    var model = n.models.new('model');
                    n.instances.new('zero', model);
                    n.instances.new('one', model);
                    n.instances.new('two', model);
                    n.instances.new('three', model);
                    n.instances.new('four', model);
                    n.instances.move(4, 1);                    
                }
            },
            {
                'desc': Events.namespace.instanceRemoving + ' on remove()',
                'event': Events.namespace.instanceRemoving,
                'act': n => {
                    var model = n.models.new('model');
                    var child = n.instances.new('test', model);
                    n.instances.remove(child);
                }
            },
            {
                'desc': Events.namespace.instanceRemoved + ' on remove()',
                'event': Events.namespace.instanceRemoved,
                'act': n => {
                    var model = n.models.new('model');
                    var child = n.instances.new('test', model);
                    n.instances.remove(child);
                }
            }
        ];

        tests.forEach(test => {
            it('should emit event ' + test.desc, () => {
                var spy = chai.spy();
                var proj = gaia.create();
                proj.root.on(test.event, spy);
                test.act(proj.root);
                expect(spy).to.have.been.called();
            });
        }); 
        
    });
});