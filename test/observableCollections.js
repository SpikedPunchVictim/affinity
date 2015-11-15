var chai = require('chai')
var expect = require('chai').expect;
var assert = require('chai').assert;
var spies = require('chai-spies');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var helpers = require('../lib/helpers.js');
var ObservableCollection = require('../lib/collections/observableCollection.js');

chai.use(spies);

describe('ObservableCollection', function() {

    it('should have 0 length when created', function() {
        var o = ObservableCollection.create();
        expect(o).to.have.property('length');
        expect(o.length).to.equal(0);
    });

    it('should have the correct length when items are added to it', function() {
        var o = ObservableCollection.create();
        expect(o.length).to.equal(0);
        o.add(1);
        expect(o.length).to.equal(1);
        o.add(2);
        expect(o.length).to.equal(2);
        o.add(3, 4, 5);
        expect(o.length).to.equal(5);
    });

    it('supports remove()', () => {
        var o = ObservableCollection.create();
        o.add(5, 3, 3, 4, 2, 6);
        expect(o.length).to.be.equal(6);
        o.remove(4);
        expect(o.length).to.be.equal(5);
        expect(o).to.be.eql([5, 3, 3, 2, 6]);
        o.remove(3, 6);
        expect(o.length).to.be.equal(3);
        expect(o).to.be.eql([5, 3, 2]);
    });

    it('supports fill()', () => {
        var o = ObservableCollection.create();
        o.fill(5, 0, 3);
        expect(o.length).to.be.equal(0);
        o.push(1, 2, 3, 4);
        o.fill(5, 0, 3);
        expect(o).to.be.eql([5, 5, 5, 4]);
        o.fill(2, 1, 2);
        expect(o.length).to.be.equal(4);
        expect(o).to.be.eql([5, 2, 5, 4]);
    });

    it('supports copyWithin()', () => {
        var o = ObservableCollection.create();
        o.add(1, 2, 3, 4, 5, 6);
        expect(o).to.be.eql([1, 2, 3, 4, 5, 6]);
        o.copyWithin(1, 2, 4);
        expect(o).to.be.eql([ 1, 3, 4, 4, 5, 6 ]);
        o.copyWithin(0, -3, 5);
        expect(o).to.be.eql([  4, 5, 4, 4, 5, 6 ]);
        o.copyWithin(0, 2, -1);
        expect(o).to.be.eql([ 4, 4, 5, 4, 5, 6 ]);
    });

    it('supports pop()', () => {
        var o = ObservableCollection.create();
        o.add(1, 2, 3, 4, 5, 6);
        expect(o).to.be.eql([1, 2, 3, 4, 5, 6]);
        expect(o.pop()).to.be.equal(6)
        expect(o).to.be.eql([1, 2, 3, 4, 5])
    });

    it('supports push()', () => {
        var o = ObservableCollection.create();
        expect(o.push(1, 2, 3, 4, 5, 6)).to.be.equal(6);
        expect(o).to.be.eql([1, 2, 3, 4, 5, 6]);
        expect(o.push(7, 8)).to.be.equal(8);
        expect(o).to.be.eql([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('supports push()', () => {
        var o = ObservableCollection.create();
        expect(o.push(1, 2, 3, 4, 5, 6)).to.be.equal(6);
        o.reverse();
        expect(o).to.be.eql([6, 5, 4, 3, 2, 1]);
    });

    it('supports shift()', () => {
        var o = ObservableCollection.create();
        expect(o.push(1, 2, 3, 4, 5, 6)).to.be.equal(6);
        expect(o.shift()).to.be.eql(1);
        expect(o).to.be.eql([2, 3, 4, 5, 6]);
        o.clear();
        expect(o.shift()).to.be.undefined;
    });

    it('supports splice()', () => {
        var o = ObservableCollection.create();

        // Posivitve start
        o.push(1, 2, 3, 4, 5, 6);
        expect(o.splice(1, 2)).to.be.eql([2, 3]);
        expect(o).to.be.eql([1, 4, 5, 6]);
        
        // Negative start
        o.clear();
        o.push(1, 2, 3, 4, 5, 6);
        expect(o.splice(-3, 3)).to.be.eql([4, 5, 6]);
        expect(o).to.be.eql([1, 2, 3]);

        // Adding items
        o.clear();
        o.splice(0, 0, 1, 2, 3, 4, 5, 6);
        expect(o).to.be.eql([1, 2, 3, 4, 5, 6]);
        o.clear()
        o.push(1, 2, 3, 4, 5, 6);
        expect(o.splice(1, 0, 7, 8, 9)).to.be.eql([]);
        expect(o).to.be.eql([ 1, 7, 8, 9, 2, 3, 4, 5, 6 ]);

        // Delete count higher than array.length
        o.clear();
        o.push(1, 2, 3, 4, 5, 6);
        expect(o.splice(2, 16)).to.be.eql([3, 4, 5, 6]);
        expect(o).to.be.eql([1, 2]);

        // No delete count specified
        o.clear();
        o.push(1, 2, 3, 4, 5, 6);
        expect(o.splice(2)).to.be.eql([3, 4, 5, 6]);
        expect(o).to.be.eql([1, 2]);

        // 0 delete count
        o.clear();
        o.push(1, 2, 3, 4, 5, 6);
        expect(o.splice(2, 0)).to.be.eql([]);
        expect(o).to.be.eql([1, 2, 3, 4, 5, 6]);
    });

    it('supports unshift()', () => {
        var o = ObservableCollection.create();
        expect(o.unshift(1, 2, 3, 4, 5, 6)).to.be.equal(6);
        expect(o.unshift(0, 0)).to.be.eql(8);
        expect(o).to.be.eql([0, 0, 1, 2, 3, 4, 5, 6]);
    });

    describe('#Events', () => {
        var tests = [
            {
                'desc': 'adding on add()',
                'sub': (o, cb) => o.on('adding', cb),
                'act': o => o.add(1, 2, 3)
            },
            {
                'desc': 'added on add()',
                'sub': (o, cb) => o.on('added', cb),
                'act': o => o.add(1, 2, 3)
            },
            {
                'desc': 'removing on remove()',
                'sub': (o, cb) => o.on('removing', cb),
                'act': o => { o.add(1, 2, 3); o.remove(1); }
            },
            {
                'desc': 'removed on remove()',
                'sub': (o, cb) => o.on('removed', cb),
                'act': o => { o.add(1, 2, 3); o.remove(1); }
            },
            {
                'desc': 'removing on clear()',
                'sub': (o, cb) => o.on('removing', cb),
                'act': o => { o.add(1, 2, 3); o.clear(); }
            },
            {
                'desc': 'removed on clear()',
                'sub': (o, cb) => o.on('removed', cb),
                'act': o => { o.add(1, 2, 3); o.clear(); }
            },
            {
                'desc': 'replacing on fill()',
                'sub': (o, cb) => o.on('replacing', cb),
                'act': o => { o.add(1, 2, 3); o.fill(4, 0, 2); }
            },
            {
                'desc': 'replaced on fill()',
                'sub': (o, cb) => o.on('replaced', cb),
                'act': o => { o.add(1, 2, 3); o.fill(1, 3); }
            },
            {
                'desc': 'removing on pop()',
                'sub': (o, cb) => o.on('removing', cb),
                'act': o => { o.add(1, 2, 3); o.pop(); }
            },
            {
                'desc': 'removed on pop()',
                'sub': (o, cb) => o.on('removed', cb),
                'act': o => { o.add(1, 2, 3); o.pop(); }
            },
            {
                'desc': 'adding on push()',
                'sub': (o, cb) => o.on('adding', cb),
                'act': o => { o.push(1, 2, 3); }
            },
            {
                'desc': 'added on push()',
                'sub': (o, cb) => o.on('added', cb),
                'act': o => { o.push(1, 2, 3); }
            },
            {
                'desc': 'moving on reverse()',
                'sub': (o, cb) => o.on('moving', cb),
                'act': o => { o.add(1, 2, 3); o.reverse(); }
            },
            {
                'desc': 'moved on reverse()',
                'sub': (o, cb) => o.on('moved', cb),
                'act': o => { o.add(1, 2, 3); o.reverse(); }
            },
            {
                'desc': 'removing on shift()',
                'sub': (o, cb) => o.on('removing', cb),
                'act': o => { o.add(1, 2, 3); o.shift(); }
            },
            {
                'desc': 'removed on shift()',
                'sub': (o, cb) => o.on('removed', cb),
                'act': o => { o.add(1, 2, 3); o.shift(); }
            },
            {
                'desc': 'adding on splice()',
                'sub': (o, cb) => o.on('adding', cb),
                'act': o => o.splice(0, 0, 1, 2, 3)
            },
            {
                'desc': 'added on splice()',
                'sub': (o, cb) => o.on('added', cb),
                'act': o => o.splice(0, 0, 1, 2, 3)
            },
            {
                'desc': 'removing on splice()',
                'sub': (o, cb) => o.on('removing', cb),
                'act': o => o.splice(0, 2)
            },
            {
                'desc': 'removed on splice()',
                'sub': (o, cb) => o.on('removed', cb),
                'act': o => o.splice(0, 2)
            },
            {
                'desc': 'adding on unshift()',
                'sub': (o, cb) => o.on('adding', cb),
                'act': o => o.unshift(0, 2)
            },
            {
                'desc': 'added on unshift()',
                'sub': (o, cb) => o.on('added', cb),
                'act': o => o.unshift(0, 2)
            }

        ];

        tests.forEach(test => {
            it('should emit event ' + test.desc, () => {
                var spy = chai.spy();
                var o = ObservableCollection.create();
                o.add(1, 2, 3, 4, 5, 6);
                test.sub(o, spy);
                test.act(o);
                expect(spy).to.have.been.called();
            });
        });
    });

    it('should have the correct length when items are removed', function() {
        var o = ObservableCollection.create();
        o.add(1, 2, 3, 4, 5);
        expect(o.length).to.equal(5);
        o.remove(1);
        expect(o.length).to.equal(4);
        o.remove(2);
        expect(o.length).to.equal(3);
        o.remove(3, 4, 5);
        expect(o.length).to.equal(0);
    });

    it('should be able to use splice to add items', function() {
        // TODO
        //  - Test splice
        //  - Test events
        var o = ObservableCollection.create();
        o.splice(0, 0, 1);        
        expect(o.length).to.equal(1);
        expect(o[0]).to.equal(1);

        o.splice(1, 0, 2);
        expect(o.length).to.equal(2);
        expect(o[1]).to.equal(2);
    });

    it('should be able to use splice to remove items', function() {
        // TODO
        //  - Test splice
        //  - Test events
        var o = ObservableCollection.create();
        o.splice(0, 0, 1);
        expect(o.length).to.equal(1);
        expect(o[0]).to.equal(1);

        o.splice(1, 0, 2);
        expect(o.length).to.equal(2);
        expect(o[1]).to.equal(2);
    });

    it('the splice method should raise events when adding items', function(done) {
        var o = ObservableCollection.create();
        helpers.validateEvent(o, 'added', function() { o.splice(0, 0, 1); }, done);
    });

    it('the splice method should raise events when removing items', function(done) {
        var o = new ObservableCollection.create();
        o.splice(0, 0, 1);
        helpers.validateEvent(o, 'removed', function() { o.splice(0, 1); }, done);
    });
});