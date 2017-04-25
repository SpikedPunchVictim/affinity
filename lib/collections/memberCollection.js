'use strict';

var util = require('util');
var NamedCollection = require('./namedCollection.js');
var Member = require('../member.js');
var Events = require('../events.js');


class MemberCollection extends NamedCollection {
    constructor(model) {
        super();
        this.model = model;
        
        var self = this;
        this._subs = this.subItems([
            { event: Events.member.valueChanging, handler: change => self.emit(Events.memberCollection.valueChanging, change) },
            { event: Events.member.valueChanged, handler: change => self.emit(Events.memberCollection.valueChanged, change) }
        ]);
    }

    get context() {
        return this.model.context;
    }
    
    new(name, value) {
        if(!value) {
            throw new Error('Invalid value used for member creation.');
        }
       
        var member = new Member(this.model, name, value);
        this._add([{ item: member, index: this.length} ]);
        return member;
    }
    
    _onAdding(items) {
        super._onAdding(items);
        //this._onValidateAdding(items);
        this.emit(Events.memberCollection.adding, items);
    }

    _onAdded(items) {
        super._onAdded(items);
        this.emit(Events.memberCollection.added, items);
    }

    _onRemoving(items) {
        super._onRemoving(items);
        this.emit(Events.memberCollection.removing, items);
    }

    _onRemoved(items) {
        super._onRemoved(items);
        this.emit(Events.memberCollection.removed, items);
    }

    _onMoving(items) {
        super._onMoving(items);
        this.emit(Events.memberCollection.moving, items);
    }

    _onMoved(items) {
        super._onMoved(items);
        this.emit(Events.memberCollection.moved, items);
    }

    _onValidateAdding(items) {
        // Validate unique name
        for(let i = 0; i < items.length; ++i) {
            if(this.findByName(items[i].item.name)) {
                throw new Error('Cannot add members with the same name');
            }
        }
    }
}

module.exports = MemberCollection;