var expect = require('chai').expect;
var assert = require('chai').assert;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var helpers = require('../lib/helpers.js');
var ObservableCollection = require('../lib/collections/observableCollection.js');

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
        expect(o).to.be.eql([5, 5, 5, 5]);
        o.fill(2, 1, 2);
        expect(o.length).to.be.equal(6);
        expect(o).to.be.eql([5, 1, 1, 5, 5, 5]);
    });

    describe('#Events', () => {



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

    it('should generate the event: adding ', function(done) {
        var o = ObservableCollection.create();
        helpers.validateEvent(o, 'adding', function() { o.add(1); }, done);
    });

    it('should generate the event: added ', function(done) {
        var o = ObservableCollection.create();
        helpers.validateEvent(o, 'added', function() { o.add(1); }, done);
    });

    it('should generate the event: removing ', function(done) {
        var o = ObservableCollection.create();
        o.add(1);
        helpers.validateEvent(o, 'removing', function() { o.remove(1); }, done);
    });

    it('should generate the event: removed ', function(done) {
        var o = ObservableCollection.create();
        o.add(1);
        helpers.validateEvent(o, 'removed', function() { o.remove(1); }, done);
    });

    it('should be able to use splice to add items', function() {
        // TODO
        //  - Test splice
        //  - Test events
        var o = ObservableCollection.create();
        o.splice(0, 0, 1);        
        expect(o.length).to.equal(1);
        expect(o.at(0)).to.equal(1);

        o.splice(1, 0, 2);
        expect(o.length).to.equal(2);
        expect(o.at(1)).to.equal(2);
    });

    it('should be able to use splice to remove items', function() {
        // TODO
        //  - Test splice
        //  - Test events
        var o = ObservableCollection.create();
        o.splice(0, 0, 1);
        expect(o.length).to.equal(1);
        expect(o.at(0)).to.equal(1);

        o.splice(1, 0, 2);
        expect(o.length).to.equal(2);
        expect(o.at(1)).to.equal(2);
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