'use strict';

const util = require('util');
const NamedCollection = require('./namedCollection.js');
const Field = require('../field.js');
const Events = require('../events.js');

class FieldCollection extends NamedCollection {
    constructor(instance) {
        super();
        this._instance = instance;
        this.context.eventRouter.join(this)
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
        super._onAdding(items);
        this.emit(Events.fieldCollection.adding, items);
    }
    _onAdded(items) {
        super._onAdded(items);
        this.emit(Events.fieldCollection.added, items);
    }
    _onRemoving(items) {
        super._onRemoving(items);
        this.emit(Events.fieldCollection.removing, items);
    }
    _onRemoved(items) {
        super._onRemoved(items);
        this.emit(Events.fieldCollection.removed, items);
    }
    _onMoving(items) {
        super._onMoving(items);
        this.emit(Events.fieldCollection.moving, items);
    }
    _onMoved(items) {
        super._onMoved(items);
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