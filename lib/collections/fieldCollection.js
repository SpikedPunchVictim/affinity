'use strict';

var util = require('util');
var Emitter = require('../eventEmitter');
var NamedCollection = require('./namedCollection.js');
var Fields = require('../fields.js');

var events = {
    adding: 'fieldcollection-field-adding',
    added: 'fieldcollection-field-added',
    error: 'fieldcollection-error',
    moving: 'fieldcollection-field-moving',
    moved: 'fieldcollection-field-moved',
    removing: 'fieldcollection-field-removing',
    removed: 'fieldcollection-field-removed',
    valueChanging: 'fieldcollection-field-value-changing',
    valueChanged:'fieldcollection-field-value-changed'
}

class FieldCollection extends NamedCollection {
    constructor(instance) {
        super();
        this._instance = instance; 
    }
    
    get instance() {
        return this._instance;
    }
    
    get model() {
        return this._instance.model;
    }
    
    get context() {
        return this._instance.context;
    }
    
    new(typeName, name, options) {
        
    }
    
    // Returns the Field with the specified name
    get(name) {
        return this.find(field => field.name.toLowerCase() === name.toLowerCase());
    }

    _onAdding(items) {
        this._onValidateAdding(items);
        this.emit(events.adding, items);
    }
    _onAdded(items) {
        this.emit(events.added, items);
        items.forEach(item => {
           item.item.on() 
        });
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
        // Each item is expected to be a field
        
        // Validate unique name
        for(var it in items) {
            if(this.get(it.item.name) != null) {
                this.emit(events.error, new Error(util.format('Duplicate field name encountere when adding new field: %s', it.item.name)));
                return;
            }
        }
    }
}

module.exports = {
    FieldColection: FieldCollection,
    events: events
}



/*
function InstanceMemberCollection(instance, model) {
    Emitter.mixin(this);
    CommonCollection.mixin(this);

    this.instance = instance;
    this.model = model;

    Object.defineProperty(this, 'context', {
        get: function() {
            return this.instance.context;
        }
    });

    this._onItemsAdding = function(items) {
        this.context.project.emit(InstanceMemberCollection.events.adding, items);
        this.emit(InstanceMemberCollection.events.adding, items)
    }

    this._onItemsAdded= function(items) {
        this.context.project.emit(InstanceMemberCollection.events.added, items);
        this.emit(InstanceMemberCollection.events.added, items)
    }
    
    this._onItemsRemoving = function(items) {
        this.context.project.emit(InstanceMemberCollection.events.removing, items);
        this.emit(InstanceMemberCollection.events.removing, items)
    }
    
    this._onItemsRemoved = function(items) {
        this.context.project.emit(InstanceMemberCollection.events.removed, items);
        this.emit(InstanceMemberCollection.events.removed, items)
    }
}

//------------------------------------------------------------------------
// List of supported events
InstanceMemberCollection.events = {
    adding: 'instance-member-adding',
    added: 'instance-member-added',
    removing: 'instance-member-removing',
    removed: 'instance-member-removed',   
}

//------------------------------------------------------------------------
InstanceMemberCollection.prototype.add = function add(name, type, value) {
    this.insert(name, type, value, this._items.length);
}

//------------------------------------------------------------------------
InstanceMemberCollection.prototype.insert = function insert(name, type, value, index) {
    var member = this.model.members.get(name);
    var instanceMember = new InstanceMember(this.instance, member);

    var items = [{item: instanceMember, index: this._items.length}];

    this._onAdding(items);
    this._items.insert(instanceMember, index);
    this._onAdded(items);
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
*/