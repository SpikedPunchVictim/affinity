var util = require('util');
var _ = require('lodash');
var utility = require('../utility.js');
var EventEmitter = require('events').EventEmitter;
var ObservableCollection = require('./observableCollection.js');
var CommonCollection = require('./commonCollection.js');
var InstanceMember = require('../instanceMember.js');

module.exports = InstanceMemberCollection;

function InstanceMemberCollection(instance, model) {
    EventEmitter.call(this);

    this.instance = instance;
    this.model = model;
    this._items = new ObservableCollection();

    utility.forward(this._items, this);

    Object.defineProperty(this, 'context', {
        get: function() {
            return this.instance.context;
        }
    });

    CommonCollection.mixin(this, {
        addingevent: 'instance-member-adding',
        addedEvent: 'instance-member-added',
        removingEvent: 'instance-member-removing',
        removedEvent: 'instance-member-removed',
        globalEmitter: this.context.project
    });
}

util.inherits(InstanceMemberCollection, EventEmitter);

//------------------------------------------------------------------------
InstanceMemberCollection.prototype.add = function add(name, type, value) {
    this.insert(name, type, value, this._items.length);
}

//------------------------------------------------------------------------
InstanceMemberCollection.prototype.insert = function insert(name, type, value, index) {
    var member = this.model.members.get(name);
    var instanceMember = new InstanceMember(this.instance, member);
    this._items.insert(instanceMember, index);
    return instanceMember;
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