var util = require('util');
var utility = require('../utility.js');
var EventEmitter = require('events').EventEmitter;
var Observablecollection = require('./observableCollection.js');
var Member = require('../member.js');

module.exports = FieldCollection;

function FieldCollection() {
    EventEmitter.call(this);
    this._items = new Observablecollection();
    utility.forward(this._items, this);
}

util.inherits(FieldCollection, EventEmitter);

FieldCollection.prototype.add = function add(name, type, value) {
    var member = new Member(name, type, value);
    this._items.add(member);
    return member;
}

//------------------------------------------------------------------------
// Sets the value of the Field with the specified name. Returns
// the field if it exists, otherwise returns undefined.
//------------------------------------------------------------------------
FieldCollection.prototype.set = function set(name, value) {
    var found = this._items.find(function(item) {
        return item.name === name;
    });

    if(found) {
        found.value = value;
    }

    return found;
}