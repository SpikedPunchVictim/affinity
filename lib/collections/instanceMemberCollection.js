var util = require('util');
var _ = require('lodash');
var utility = require('../utility.js');
var EventEmitter = require('events').EventEmitter;
var ObservableCollection = require('./observableCollection.js');
var InstanceMember = require('../instanceMember.js');

module.exports = InstanceMemberCollection;

function InstanceMemberCollection(instance, model) {
    EventEmitter.call(this);
    this.instance = instance;
    this.model = model;
    this._items = new ObservableCollection();

    utility.forward(this._items, this);
}

util.inherits(InstanceMemberCollection, EventEmitter);

//------------------------------------------------------------------------
// Cleans up any outstanding references
//------------------------------------------------------------------------
InstanceMemberCollection.prototype.dispose = function dispose() {
    this.syncObj.dispose();
}

//------------------------------------------------------------------------
InstanceMemberCollection.prototype.add = function add(name, type, value) {
    var member = new InstanceMember(instance, member);
    this._items.add(member);
    return member;
}

//------------------------------------------------------------------------
// Sets the value of the Field with the specified name. Returns
// the field if it exists, otherwise returns undefined.
//------------------------------------------------------------------------
InstanceMemberCollection.prototype.set = function set(name, value) {
    var found = this.get(name);

    if(found) {
        found.value = value;
    }

    return found;
}

//------------------------------------------------------------------------
InstanceMemberCollection.prototype.get = function get(name) {
    var found = this._items.find(function(item) {
        return item.name === name;
    });

    return found;
}