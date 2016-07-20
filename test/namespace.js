'use strict'

var chai = require('chai');
var expect = chai.expect;
var spies = require('chai-spies');
var gaia = require('../lib/index.js');
var Namespace = gaia.Namespace;
var Events = require('../lib/events.js');

chai.use(spies);

describe('Namespace', function() {

    it('should create a new namespace on new()', () => {
        let proj = gaia.create();
        let name = 'test';
        let nspace = proj.root.children.new(name);
        expect(nspace).to.be.instanceof(Namespace);
        expect(proj.root.children.length).to.equal(1);
        expect(proj.root.children.at(0).name).to.be.equal(name);
    });

    it('should support unique namespace names', () => {
        let proj = gaia.create();
        let name = 'test';
        let nspace = proj.root.children.new(name);
        expect(() => proj.root.children.new(name)).to.throw(Error);
    });

    it('should expand the Namespace when given a qualified path', () => {
        let proj = gaia.create();
        let name = 'test.me.please';
        
        let nspace = proj.root.expand(name);
        let parent = proj.search.namespace.find('test.me');
        let grandParent = proj.search.namespace.find('test');

        expect(nspace.parent).to.be.eql(parent);
        expect(parent.parent).to.be.eql(grandParent);
        expect(grandParent.parent).to.be.eql(proj.root);
    });

    it('should support getOrAdd', () => {
        let proj = gaia.create();
        let name = 'test';
        let nspace = proj.root.children.new(name);
        expect(proj.root.children.getOrAdd(name)).to.be.eql(nspace);
        expect(proj.root.children.getOrAdd('other_test')).not.to.be.eql(nspace);
        expect(proj.root.children.length).to.be.equal(2);
    });

    it('should have a children property', () => {
        let proj = gaia.create();
        let name = 'test';
        let nspace = proj.root.children.new(name);
        expect(nspace).to.have.property('children');
    });

    it('should have the parent property', () => {
        let proj = gaia.create();
        let name = 'test';
        let nspace = proj.root.children.new(name);
        expect(nspace).to.have.property('parent');
    });

    it('should have the proper parent', () => {
        let proj = gaia.create();
        let name = 'test';
        let nspace = proj.root.children.new(name);    
        expect(nspace.parent).to.eql(proj.root);
    });

    it('new child should also have the proper parent', () => {
        let proj = gaia.create();
        let name = 'test';
        let nspace = proj.root.children.new(name);
        let child = nspace.children.new('child');
        expect(child.parent).to.eql(nspace);
        nspace.children.remove(child);
        expect(nspace.children.indexOf(child)).to.be.equal(-1);
    });

    it('should be able to find a namespace by name', () => {
        let proj = gaia.create();
        let name = 'test';
        let nspace = proj.root.children.new(name);
        let child = nspace.children.new('child');

        expect(nspace.children.indexByName('child')).to.be.at.least(0);
        expect(proj.search.namespace.find('test.child')).to.be.eql(child);

        let grandChild = child.children.new('grand_child');

        expect(proj.search.namespace.find('test.child.grand_child')).to.be.eql(grandChild);
    });

    it('should be able to find a namespace by instance', () => {
        let proj = gaia.create();
        let name = 'test';
        let nspace = proj.root.children.new(name);
        let child = nspace.children.new('child');
        expect(nspace.children.indexOf(child)).to.be.at.least(0);
        nspace.children.remove(child);
        expect(nspace.children.indexOf(child)).to.be.equal(-1);
    });

    it('child can be deleted', () => {
        let proj = gaia.create();
        let name = 'test';
        let nspace = proj.root.children.new(name);
        let child = nspace.children.new('child');
        expect(nspace.children.indexOf(child)).to.be.at.least(0);
        nspace.children.remove(child);
        expect(nspace.children.indexOf(child)).to.be.equal(-1);
    });
    
    it('child can be moved', () => {
        let proj = gaia.create();

        let zero = proj.root.children.new('zero');
        let one = proj.root.children.new('one');
        let two = proj.root.children.new('two');
        let three = proj.root.children.new('three');
        let four = proj.root.children.new('four');
        
        expect(proj.root.children.length).to.be.eql(5);
        proj.root.children.move(3, 1);
        expect(proj.root.children.at(0)).to.be.equal(zero);
        expect(proj.root.children.at(1)).to.be.equal(three);
        expect(proj.root.children.at(2)).to.be.equal(one);
        expect(proj.root.children.at(3)).to.be.equal(two);
        expect(proj.root.children.at(4)).to.be.equal(four);
    });
    
    it('model can be moved', () => {
        let proj = gaia.create();

        let zero = proj.root.models.new('zero');
        let one = proj.root.models.new('one');
        let two = proj.root.models.new('two');
        let three = proj.root.models.new('three');
        let four = proj.root.models.new('four');
        
        expect(proj.root.models.length).to.be.eql(5);
        proj.root.models.move(3, 1);
        expect(proj.root.models.at(0)).to.be.equal(zero);
        expect(proj.root.models.at(1)).to.be.equal(three);
        expect(proj.root.models.at(2)).to.be.equal(one);
        expect(proj.root.models.at(3)).to.be.equal(two);
        expect(proj.root.models.at(4)).to.be.equal(four);
    });
    
    it('instances can be moved', () => {
        let proj = gaia.create();

        let model = proj.root.models.new('model1');
        let zero = proj.root.instances.new('zero', model);
        let one = proj.root.instances.new('one', model);
        let two = proj.root.instances.new('two', model);
        let three = proj.root.instances.new('three', model);
        let four = proj.root.instances.new('four', model);
        
        expect(proj.root.instances.length).to.be.eql(5);
        proj.root.instances.move(3, 1);
        expect(proj.root.instances.at(0)).to.be.equal(zero);
        expect(proj.root.instances.at(1)).to.be.equal(three);
        expect(proj.root.instances.at(2)).to.be.equal(one);
        expect(proj.root.instances.at(3)).to.be.equal(two);
        expect(proj.root.instances.at(4)).to.be.equal(four);
    });
    
    describe('#Events', () => {
       
        let tests = [
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
                    let child = n.children.new('test');
                    n.children.remove(child);
                }
            },
            {
                'desc': Events.namespace.childRemoved + ' on remove()',
                'event': Events.namespace.childRemoved,
                'act': n => {
                    let child = n.children.new('test');
                    n.children.remove(child);
                }
            },
            {
                'desc': Events.disposing + ' on new()',
                'event': Events.disposing,
                'act': n => n.dispose()
            },
            {
                'desc': Events.disposed + ' on new()',
                'event': Events.disposed,
                'act': n => n.dispose()
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
                    let child = n.models.new('test');
                    n.models.remove(child);
                }
            },
            {
                'desc': Events.namespace.modelRemoved + ' on remove()',
                'event': Events.namespace.modelRemoved,
                'act': n => {
                    let child = n.models.new('test');
                    n.models.remove(child);
                }
            },
            //-- Instances
            {
                'desc': Events.namespace.instanceAdding + ' on new()',
                'event': Events.namespace.instanceAdding,
                'act': n => {
                    let model = n.models.new('model');
                    n.instances.new('test', model);
                }
            },
            {
                'desc': Events.namespace.instanceAdded + ' on new()',
                'event': Events.namespace.instanceAdded,
                'act': n => {
                    let model = n.models.new('model');
                    n.instances.new('test', model);
                }
            },
            {
                'desc': Events.namespace.instanceMoving + ' on move()',
                'event': Events.namespace.instanceMoving,
                'act': n => {
                    let model = n.models.new('model');
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
                    let model = n.models.new('model');
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
                    let model = n.models.new('model');
                    let child = n.instances.new('test', model);
                    n.instances.remove(child);
                }
            },
            {
                'desc': Events.namespace.instanceRemoved + ' on remove()',
                'event': Events.namespace.instanceRemoved,
                'act': n => {
                    let model = n.models.new('model');
                    let child = n.instances.new('test', model);
                    n.instances.remove(child);
                }
            }
        ];

        tests.forEach(test => {
            it('should emit event ' + test.desc, () => {
                let spy = chai.spy();
                let proj = gaia.create();
                proj.root.on(test.event, spy);
                test.act(proj.root);
                expect(spy).to.have.been.called();
            });
        }); 
        
    });
});