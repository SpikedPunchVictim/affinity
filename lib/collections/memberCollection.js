var util = require('util');
var utility = require('../utility.js');
var EventEmitter = require('events').EventEmitter;
var Observablecollection = require('./observableCollection.js');
var Member = require('../member.js');

function MemberCollection() {
    EventEmiter.call(this);
    this._items = new Observablecollection();
    utility.forward(this._items, this);
}

util.inherits(MemberCollection, EventEmitter);

MemberCollection.prototype.add = function add(name, type, default) {
    var member = new Member(name, type, default);
    this._items.add(member);
    return member;
}