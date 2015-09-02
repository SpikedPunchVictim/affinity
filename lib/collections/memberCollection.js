var util = require('util');
var _ = require('lodash');
var EventEmitter = require('../eventEmitter.js');
var Observablecollection = require('./observableCollection.js');
var CommonCollection = require('./commonCollection.js');
var Member = require('../modelMember.js');

module.exports = MemberCollection;

//------------------------------------------------------------------------
// Events:
//  - model-member-adding
//  - model-member-added
//  - model-member-removing
//  - model-member-removed
//  - model-member-value-changed
//
//------------------------------------------------------------------------
function MemberCollection(model) {
    EventEmitter.mixin(this);

    this.model = model;

    Object.defineProperty(this, 'context', {
        get: function() {
            return this.model.context;
        }
    });

    CommonCollection.mixin(this, {
        addingEvent: MemberCollection.events.adding,
        addedEvent: MemberCollection.events.added,
        removingEvent: MemberCollection.events.removing,
        removedEvent: MemberCollection.events.removed,
        globalEmitter: this.context.project
    });

    this.on('model-member-added', function(items) {
        for(var i = 0; i < items.length; ++i) {
            items[i].on('value-changing', this._onValueChanging);
            items[i].on('value-changed', this._onValueChanged);
        }
    });

    this.on('model-member-removed', function(items) {
        for(var i = 0; i < items.length; ++i) {
            items[i].removeListener('value-changing', this._onValueChanging);
            items[i].removeListener('value-changed', this._onValueChanged);
        }
    });
}

//------------------------------------------------------------------------
// List of supported events
MemberCollection.events = {
    adding: 'model-member-adding',
    added: 'model-member-added',
    removing: 'model-member-removing',
    removed: 'model-member-removed',
    valueChanging: 'model-member-value-changing',
    valueChanged:'model-member-value-changed'
};


//------------------------------------------------------------------------
MemberCollection.prototype.add = function add(name, value) {
    if(_.isNull(value) || _.isUndefined(value)) {
        throw new Error('value must be valid when creating a new Member');
    }

    var member = new Member(this.model, name, value);
    var items = [{ item: member, index: this._items.length }];

    this._onAdding(items);
    this._items.add(member);
    this._onAdded(items);
    return member;
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

//------------------------------------------------------------------------
MemberCollection.prototype._onValueChanging = function _onValueChanging(changed) {
    this.emit(events.valueChanging, changed);
}

//------------------------------------------------------------------------
MemberCollection.prototype._onValueChanged = function _onValueChanged(changed) {
    this.emit(events.valueChanged, changed);
}