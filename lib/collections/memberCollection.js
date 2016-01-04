'use strict';

var NamedCollection = require('./namedCollection.js');
var ModelMember = require('../modelMember.js');

var events = {
    adding: 'membercollection-member-adding',
    added: 'membercollection-member-added',
    moving: 'membercollection-member-moving',
    moved: 'membercollection-member-moved',
    removing: 'membercollection-member-removing',
    removed: 'membercollection-member-removed',
    valueChanging: 'membercollection-member-value-changing',
    valueChanged:'membercollection-member-value-changed'
}

class MemberCollection extends NamedCollection {
    constructor(model) {
        super();
        this.model = model;
    }

    get context() {
        return this.model.context;
    }
    
    addMember(typeName, name, options) {
        for(var core in this.context.project.cores) {
            core.
        }
    }

    _onAdding(items) {
        this._onValidateAdding(items);
        this.emit(events.adding, items);
    }
    _onAdded(items) {
        this.emit(events.added, items);
    }
    _onRemoving(items) {
        this.emit(events.removing, items);
    }
    _onRemoved(items) {
        this.emit(events.removed, items);
    }
    _onMoving(items) {
        this.emit(events.moving, items);
    }
    _onMoved(items) {
        this.emit(events.moved, items);
    }

    _onValidateAdding(items) {
        // Each item is expected to be a Member
    }
}

module.exports = {
    MemberCollection: MemberCollection,
    events: events
}

//------------------------------------------------------------------------
// Events:
//  - model-member-adding
//  - model-member-added
//  - model-member-removing
//  - model-member-removed
//  - model-member-value-changed
//
//------------------------------------------------------------------------
function MemberCollection2(model) {
    Emitter.mixin(this);
    CommonCollection.mixin(this);

    this.model = model;

    Object.defineProperty(this, 'context', {
        get: function() {
            return this.model.context;
        }
    });

    this._onItemsAdding = function(items) {
        this.context.project.emit(MemberCollection.events.adding, items);
        this.emit(MemberCollection.events.adding, items)
    }

    this._onItemsAdded= function(items) {

        for(var i = 0; i < items.length; ++i) {
            items[i].item.on(ModelMember.events.valueChanging, this._onValueChanging.bind(this));
            items[i].item.on(ModelMember.events.valueChanged, this._onValueChanging.bind(this));
        }

        this.context.project.emit(MemberCollection.events.added, items);
        this.emit(MemberCollection.events.added, items)
    }
    
    this._onItemsRemoving = function(items) {
        this.context.project.emit(MemberCollection.events.removing, items);
        this.emit(MemberCollection.events.removing, items)
    }
    
    this._onItemsRemoved = function(items) {

        for(var i = 0; i < items.length; ++i) {
            items[i].item.off(ModelMember.events.valueChanging, this._onValueChanging);
            items[i].item.off(ModelMember.events.valueChanged, this._onValueChanging);
        }

        this.context.project.emit(MemberCollection.events.removed, items);
        this.emit(MemberCollection.events.removed, items);
    }
}

//------------------------------------------------------------------------
// List of supported events
// MemberCollection.events = {
//     adding: 'model-member-adding',
//     added: 'model-member-added',
//     removing: 'model-member-removing',
//     removed: 'model-member-removed',
//     valueChanging: 'model-member-value-changing',
//     valueChanged:'model-member-value-changed'
// };

//------------------------------------------------------------------------
// MemberCollection.prototype.dispose = function dispose() {
//     var self = this;
//     for(var i = 0; i < this._items.length; ++i) {
//         this._items[i].off(ModelMember.events.valueChanging, this._onValueChanging);
//         this._items[i].off(ModelMember.events.valueChanged, this._onValueChanged);        
//     }
// }

//------------------------------------------------------------------------
// MemberCollection.prototype.add = function add(name, value) {
//     if(_.isNull(value) || _.isUndefined(value)) {
//         throw new Error('value must be valid when creating a new Member');
//     }

//     var member = Member.create(this.model, name, value);
//     var items = [{ item: member, index: this._items.length }];

//     this._onAdding(items);
//     this._items.add(member);
//     this._onAdded(items);
//     return member;
// }

//------------------------------------------------------------------------
// Sets the value of the Field with the specified name. Returns
// the field if it exists, otherwise returns undefined.
//------------------------------------------------------------------------
// MemberCollection.prototype.set = function set(name, value) {
//     var found = this.get(name);

//     if(found) {
//         found.value = value;
//     }

//     return found;
// }

//------------------------------------------------------------------------
// MemberCollection.prototype.get = function get(name) {
//     var found = this._items.find(function(item) {
//         return item.name === name;
//     });

//     return found;
// }

//------------------------------------------------------------------------
// MemberCollection.prototype._onValueChanging = function _onValueChanging(changed) {
//     this.emit(MemberCollection.events.valueChanging, changed);
// }

//------------------------------------------------------------------------
// MemberCollection.prototype._onValueChanged = function _onValueChanged(changed) {
//     this.emit(MemberCollection.events.valueChanged, changed);
// }

