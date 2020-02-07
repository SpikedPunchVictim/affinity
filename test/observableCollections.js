'use strict';

const chai = require('chai');
const expect = require('chai').expect;
const assert = require('chai').assert;
const spies = require('chai-spies');
const ObservableCollection = require('../lib/collections/observableCollection.js');
const { EventEmitter } = require('../lib/eventEmitter.js');

chai.use(spies);

class TestObject extends EventEmitter {
    constructor(property1, property2, property3) {
        super()
        this.property1 = property1;
        this.property2 = property2;
        this.property3 = property3;
    }
    
    raiseEvent() {
        this.emit('event');
    }
}

describe('ObservableCollection', function() {

    it('should have 0 length when created', function() {
        var o = new ObservableCollection();
        expect(o).to.have.property('length');
        expect(o.length).to.equal(0);
    });

    it('should have the correct length when items are added or removed', function() {
        var o = new ObservableCollection();
        expect(o.length).to.equal(0);
        o.add(1);
        expect(o.length).to.equal(1);
        o.add(2);
        expect(o.length).to.equal(2);
        o.add(3, 4, 5);
        expect(o.length).to.equal(5);
        o.remove(2);
        expect(o.length).to.equal(4);
        o.remove(3, 1, 4);
        expect(o.length).to.equal(1);
    });

    it('indexOf() should report the correct index', () => {
        var o = new ObservableCollection();
        o.add(1);
        expect(o.indexOf(1)).to.be.eql(0);
        o.add(2);
        o.add(3);
        expect(o.indexOf(2)).to.be.eql(1);
        expect(o.indexOf(3)).to.be.eql(2);
        o.add(1);
        expect(o.indexOf(1)).to.be.eql(0);        
    });
    
    it('contains() should return true or false if the item exists in the collection', () => {
         var o = new ObservableCollection();
         o.add(1);
         o.add(2);
         o.add(3);
         expect(o.contains(1)).to.be.true;
         expect(o.contains(3)).to.be.true;
         expect(o.contains(4)).to.be.false;
    });
    
    it('find() should correctly find the first item', () => {
        var obj1 = new TestObject(1, 1, 1);
        var obj2 = new TestObject(2, 2, 2);
        var obj3 = new TestObject(3, 3, 3);
        
        var o = new ObservableCollection();
        o.add(obj1);
        o.add(obj2);
        o.add(obj3);
        
        var found = o.find((item, index, collection) => item.property1 === 2);
        expect(found).to.be.equal(obj2);
        found = o.find((item, index, collection) => item.property1 === 6);
        expect(found).not.to.exist;
    });
    
    it('filter() should correctly filter the contents', () => {
        var obj1 = new TestObject(1, 1, 1);
        var obj2 = new TestObject(2, 2, 2);
        var obj3 = new TestObject(3, 3, 3);
        
        var o = new ObservableCollection();
        o.add(obj1);
        o.add(obj2);
        o.add(obj3);
        
        var found = o.filter((item, index, collection) => item.property1 < 3);
        expect(found.indexOf(obj1)).to.be.at.least(0);
        expect(found.indexOf(obj2)).to.be.at.least(0);
        expect(found.indexOf(obj3)).to.be.below(0);
    });
  
    it('insert() should add the imtem at the correct index', () => {
        var obj1 = new TestObject(1, 1, 1);
        var obj2 = new TestObject(2, 2, 2);
        var obj3 = new TestObject(3, 3, 3);
        
        var o = new ObservableCollection();
        o.insert(0, obj1);
        expect(o.indexOf(obj1)).to.be.eql(0);
        o.insert(1, obj2);
        expect(o.indexOf(obj2)).to.be.eql(1);
        
        o.insert(0, obj3);
        expect(o.indexOf(obj3)).to.be.eql(0);
        expect(o.indexOf(obj1)).to.be.eql(1);
        expect(o.indexOf(obj2)).to.be.eql(2);
    });
    
    it('add() should correctly add items to the end', () => {
        var obj1 = new TestObject(1, 1, 1);
        var obj2 = new TestObject(2, 2, 2);
        var obj3 = new TestObject(3, 3, 3);
        
        var o = new ObservableCollection();
        o.add(obj1);
        expect(o.indexOf(obj1)).to.be.eql(0);
        o.add(obj2, obj3);
        expect(o.indexOf(obj2)).to.be.eql(1);
        expect(o.indexOf(obj3)).to.be.eql(2);
    });
    
    it('move() should correctly move items in the collection', () => {
        var obj1 = new TestObject(1, 1, 1);
        var obj2 = new TestObject(2, 2, 2);
        var obj3 = new TestObject(3, 3, 3);
        var obj4 = new TestObject(4, 4, 4);
        var obj5 = new TestObject(5, 5, 5);
        
        var o = new ObservableCollection();
        o.add(obj1);
        o.add(obj2);
        o.add(obj3);
        o.add(obj4);
        o.add(obj5);
        
        expect(o.indexOf(obj1)).to.be.eql(0);
        expect(o.indexOf(obj2)).to.be.eql(1);
        expect(o.indexOf(obj3)).to.be.eql(2);
        expect(o.indexOf(obj4)).to.be.eql(3);
        expect(o.indexOf(obj5)).to.be.eql(4);
        
        o.move(1, 3);
        expect(o.indexOf(obj1)).to.be.eql(0);
        expect(o.indexOf(obj3)).to.be.eql(1);
        expect(o.indexOf(obj4)).to.be.eql(2);
        expect(o.indexOf(obj2)).to.be.eql(3);
        expect(o.indexOf(obj5)).to.be.eql(4);
        
        // delete, then add
        o.move(3, 1);
        expect(o.indexOf(obj1)).to.be.eql(0);
        expect(o.indexOf(obj2)).to.be.eql(1);
        expect(o.indexOf(obj3)).to.be.eql(2);
        expect(o.indexOf(obj4)).to.be.eql(3);
        expect(o.indexOf(obj5)).to.be.eql(4);        
        
        var fn = () => o.move(7, 0);
        expect(fn).to.throw(Error);
        fn = () => o.move(0, 7);
        expect(fn).to.throw(Error);
    });
    
    it('clear() remove all items', () => {
        var obj1 = new TestObject(1, 1, 1);
        var obj2 = new TestObject(2, 2, 2);
        var obj3 = new TestObject(3, 3, 3);
        
        var o = new ObservableCollection();
        o.add(obj1);
        o.add(obj2);
        o.add(obj3);
        expect(o.length).to.be.eql(3);
        o.clear();
        expect(o.length).to.be.eql(0);
    });
    
    it('remove() should remove items', () => {
        var o = new ObservableCollection();
        o.add(1);
        o.add(2);
        o.add(3);
        o.add(4);
        o.add(5);
        expect(o.length).to.be.eql(5);
        o.remove(1);
        expect(o.indexOf(1)).to.be.below(0);
        o.remove(3, 5);
        expect(o.indexOf(2)).to.be.eql(0);
        expect(o.indexOf(4)).to.be.eql(1);
    }); 
    
    it('removeAt() should remove items correctly', () => {
        var o = new ObservableCollection();
        o.add(1);
        o.add(2);
        o.add(3);
        o.add(4);
        o.add(5);
        expect(o.length).to.be.eql(5);
        o.removeAt(3);
        expect(o.indexOf(4)).to.be.below(0);
        expect(o.indexOf(1)).to.be.eql(0);
        expect(o.indexOf(2)).to.be.eql(1);
        expect(o.indexOf(3)).to.be.eql(2);
        expect(o.indexOf(5)).to.be.eql(3);
        
        var fn = () => o.removeAt(6);
        expect(fn).to.throw(Error);
    });
    
    it('removeAll() should remove items correctly', () => {
        var o = new ObservableCollection();
        o.add(1);
        o.add(2);
        o.add(3);
        o.add(4);
        o.add(5);
        expect(o.length).to.be.eql(5);
        o.removeAll((item, index, collection) => item <=3 );
        expect(o.length).to.be.eql(2);
        expect(o.indexOf(4)).to.be.eql(0);
        expect(o.indexOf(5)).to.be.eql(1);
    });
    
    it('sub() should correctly subscribe to events', () => {
        var obj1 = new TestObject(1, 1, 1);
        var obj2 = new TestObject(2, 2, 2);
        var obj3 = new TestObject(3, 3, 3);
        
        var watcher = {
            adding: 0,
            added: 0,
            moving: 0,
            moved: 0,
            removing: 0,
            removed: 0
        };
        
        var o = new ObservableCollection();
        
        var sub = o.sub([
            { event: ObservableCollection.events.adding, handler: () => watcher.adding++  },
            { event: ObservableCollection.events.added, handler: () => watcher.added++  },
            { event: ObservableCollection.events.moving, handler: () => watcher.moving++  },
            { event: ObservableCollection.events.moved, handler: () => watcher.moved++  },
            { event: ObservableCollection.events.removing, handler: () => watcher.removing++  },
            { event: ObservableCollection.events.removed, handler: () => watcher.removed++  }            
        ]);
        
        o.add(obj1);
        expect(watcher.adding).to.be.eql(1);
        expect(watcher.added).to.be.eql(1);
        
        o.add(obj2);
        o.add(obj3);
        expect(watcher.adding).to.be.eql(3);
        expect(watcher.added).to.be.eql(3);
        
        o.move(1, 0);
        expect(watcher.moving).to.be.eql(1);
        expect(watcher.moved).to.be.eql(1);
        
        o.removeAt(0);
        expect(watcher.removing).to.be.eql(1);
        expect(watcher.removed).to.be.eql(1);
        
        // Validate the state
        expect(watcher.adding).to.be.eql(3);
        expect(watcher.added).to.be.eql(3);
        expect(watcher.moving).to.be.eql(1);
        expect(watcher.moved).to.be.eql(1);
        
        sub.off();
        
        o.add(new TestObject(4, 4, 4));
        o.move(2, 0);
        o.removeAt(0);
        
        expect(watcher.adding).to.be.eql(3);
        expect(watcher.added).to.be.eql(3);
        expect(watcher.moving).to.be.eql(1);
        expect(watcher.moved).to.be.eql(1);
        expect(watcher.removing).to.be.eql(1);
        expect(watcher.removed).to.be.eql(1);
    });
    
    it('subItems() should correctly subscribe to events', () => {
        var obj1 = new TestObject(1, 1, 1);
        var obj2 = new TestObject(2, 2, 2);
        var obj3 = new TestObject(3, 3, 3);
        
        var watcher = {
            adding: 0,
            added: 0,
            moving: 0,
            moved: 0,
            removing: 0,
            removed: 0
        };
        
        var o = new ObservableCollection();
        o.add(obj1);
        
        var count = 0;
        var sub = o.subItems([
            { event: 'event', handler: () => count++  }          
        ]);
        
        obj1.raiseEvent();        
        expect(count).to.be.eql(1);
        
        o.add(obj2);
        obj2.raiseEvent();        
        expect(count).to.be.eql(2);
        
        o.remove(obj1);
        obj1.raiseEvent();        
        expect(count).to.be.eql(2);
        
        sub.off();
        obj2.raiseEvent();
        expect(count).to.be.eql(2);        
    });
       
    describe('#Events', () => {
        var tests = [
            {
                'desc': ObservableCollection.events.adding + ' on add()',
                'sub': (o, cb) => o.on(ObservableCollection.events.adding, cb),
                'act': o => o.add(1, 2, 3)
            },
            {
                'desc': ObservableCollection.events.added + ' on add()',
                'sub': (o, cb) => o.on(ObservableCollection.events.added, cb),
                'act': o => o.add(1, 2, 3)
            },
            {
                'desc': ObservableCollection.events.moving + ' on move()',
                'sub': (o, cb) => o.on(ObservableCollection.events.moving, cb),
                'act': o => { o.add(1, 2, 3); o.move(1, 2); }
            },
            {
                'desc': ObservableCollection.events.moved + ' on move()',
                'sub': (o, cb) => o.on(ObservableCollection.events.moved, cb),
                'act': o => { o.add(1, 2, 3); o.move(1, 2); }
            },
            {
                'desc': ObservableCollection.events.removing + ' on remove()',
                'sub': (o, cb) => o.on(ObservableCollection.events.removing, cb),
                'act': o => { o.add(1, 2, 3); o.remove(1); }
            },
            {
                'desc': ObservableCollection.events.removed + ' on remove()',
                'sub': (o, cb) => o.on(ObservableCollection.events.removed, cb),
                'act': o => { o.add(1, 2, 3); o.remove(1); }
            },
            {
                'desc': ObservableCollection.events.adding + ' on insert()',
                'sub': (o, cb) => o.on(ObservableCollection.events.adding, cb),
                'act': o => o.insert(0, 2)
            },
            {
                'desc': ObservableCollection.events.added + ' on insert()',
                'sub': (o, cb) => o.on(ObservableCollection.events.added, cb),
                'act': o => o.insert(0, 2)
            },
            {
                'desc': ObservableCollection.events.removing + ' on clear()',
                'sub': (o, cb) => o.on(ObservableCollection.events.removing, cb),
                'act': o => { o.add(1, 2, 3); o.clear(); }
            },
            {
                'desc': ObservableCollection.events.removed + ' on clear()',
                'sub': (o, cb) => o.on(ObservableCollection.events.removed, cb),
                'act': o => { o.add(1, 2, 3); o.clear(); }
            },
            {
                'desc': ObservableCollection.events.removing + ' on removeAt()',
                'sub': (o, cb) => o.on(ObservableCollection.events.removing, cb),
                'act': o => { o.add(1, 2, 3); o.removeAt(0); }
            },
            {
                'desc': ObservableCollection.events.removed + ' on removeAt()',
                'sub': (o, cb) => o.on(ObservableCollection.events.removed, cb),
                'act': o => { o.add(1, 2, 3); o.removeAt(0); }
            },
            {
                'desc': ObservableCollection.events.removing + ' on removeAll()',
                'sub': (o, cb) => o.on(ObservableCollection.events.removing, cb),
                'act': o => { o.add(1, 2, 3); o.removeAll(item => item == 1); }
            },
            {
                'desc': ObservableCollection.events.removed + ' on removeAll()',
                'sub': (o, cb) => o.on(ObservableCollection.events.removed, cb),
                'act': o => { o.add(1, 2, 3); o.removeAll(item => item == 1); }
            }
        ];

        tests.forEach(test => {
            it('should emit event ' + test.desc, () => {
                var spy = chai.spy();
                var o = new ObservableCollection();
                o.add(1, 2, 3, 4, 5, 6);
                test.sub(o, spy);
                test.act(o);
                expect(spy).to.have.been.called();
            });
        });
    });
});