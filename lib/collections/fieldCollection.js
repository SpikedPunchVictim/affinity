'use strict';

var util = require('util');
var Emitter = require('../eventEmitter');
var NamedCollection = require('./namedCollection.js');
var Field = require('../field.js');
var Events = require('../events.js');

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
    
    new(member, index) {
        var field = new Field(this._instance, member);
        index = index ? index : this.length;
        this.insert(index, field);
        return field;
    }
    
    // Returns the Field with the specified name
    get(name) {
        return this.find(field => field.name.toLowerCase() === name.toLowerCase());
    }

    _onAdding(items) {
        this._onValidateAdding(items);
        this.emit(Events.fieldCollection.adding, items);
    }
    _onAdded(items) {
        this.emit(Events.fieldCollection.added, items);
    }
    _onRemoving(items) {
        this.emit(Events.fieldCollection.removing, items);
    }
    _onRemoved(items) {
        this.emit(Events.fieldCollection.removed, items);
    }
    _onMoving(items) {
        this.emit(Events.fieldCollection.moving, items);
    }
    _onMoved(items) {
        this.emit(Events.fieldCollection.moved, items);
    }

    _onValidateAdding(items) {
        // Each item is expected to be a field
        
        // Validate unique name
        for(var it of items) {
            if(!(it.item instanceof Field)) {
                throw new Error(util.format('Duplicate field name encountere when adding new field: %s', it.item.name));
            }
        }
    }
}

module.exports = FieldCollection;


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