var util = require('util');
var _ = require('lodash');
var utility = require('../utility.js');
var EventEmitter = require('events').EventEmitter;
var Observablecollection = require('./observableCollection.js');
var Member = require('../modelMember.js');

module.exports = MemberCollection;

function MemberCollection(model) {
    EventEmitter.call(this);
    this.model = model;
    this.context = model.namespace.context;
    this._items = new Observablecollection();
    utility.forward(this._items, this);
}

util.inherits(MemberCollection, EventEmitter);

//------------------------------------------------------------------------
MemberCollection.prototype.add = function add(name, value) {
    if(_.isNull(value) || _.isUndefined(value)) {
        throw new Error('value must be valid when creating a new Member');
    }

    var member = new Member(this.model, name, value);
    this.context.project.emit('member-adding', { model: this.model, member: member });
    this._items.add(member);
    this.context.project.emit('member-added', { model: this.model, member: member });
    return member;
}

//------------------------------------------------------------------------
MemberCollection.prototype.remove = function remove(member) {
    if(_.isString(member)) {
        // Remove by name
        member = _.find(this._items, function(item) { return item.name === member; });
    } else if(member instanceof Member) {
        member = _.find(this._items, function(item) { return _.isEqual(member, item); });
    }

    if(_.isNull(member) || _.isUndefined(member)) {
        return false;
    }

    this.context.project.emit('member-removing', { model: model, member: member });
    this._items.remove(member);
    this.context.project.emit('member-removed', { model: model, member: member });
    return true;
}

//------------------------------------------------------------------------
// Sets the value of the Field with the specified name. Returns
// the field if it exists, otherwise returns undefined.
//------------------------------------------------------------------------
MemberCollection.prototype.set = function set(name, value) {
    var found = this.get(name);

    if(found) {
        found.value = value;
    }

    return found;
}

//------------------------------------------------------------------------
MemberCollection.prototype.get = function get(name) {
    var found = this._items.find(function(item) {
        return item.name === name;
    });

    return found;
}