'use strict';

var _ = require('lodash');
var MemberCollection = require('./collections/memberCollection.js');
var QualifiedObject = require('./qualifiedObject.js');
var Events = require('./events.js');

class Model extends QualifiedObject {
    constructor(name, namespace) {
        super(name, namespace);

        this._members = new MemberCollection(this);
        
        // Forward events
        var self = this;
        this._sub = this._members.sub([
            { event: Events.memberCollection.adding, handler: items => self._emitEvent(Events.model.memberAdding, items) },
            { event: Events.memberCollection.added, handler: items => self._emitEvent(Events.model.memberAdded, items) },
            { event: Events.memberCollection.moving, handler: items => self._emitEvent(Events.model.memberMoving, items) },
            { event: Events.memberCollection.moved, handler: items => self._emitEvent(Events.model.memberMoved, items) },
            { event: Events.memberCollection.removing, handler: items => self._emitEvent(Events.model.memberRemoving, items) },
            { event: Events.memberCollection.removed, handler: items => self._emitEvent(Events.model.memberRemoved, items) }
        ]);
        
        this._subItems = this._members.subItems([
            { event: Events.member.valueChanging, handler: items => self._emitEvent(Events.model.valueChanging, items) },
            { event: Events.member.valueChanged, handler: items => self._emitEvent(Events.model.valueChanged, items) }
        ]);
    }

    get context() {
        return this.parent.context;
    }
    
    dispose() {
        this._emitEvent(Events.disposing, { source: this });
        this._sub.off();
        this._sub = null;
        
        this._subItems.off();
        this._subItems = null;
        this._emitEvent(Events.disposed, { source: this });
    }
    
    get members() {
        return this._members;
    }
    
    _emitEvent(...args) {        
        this.context.project.emit.apply(this.context.project, args);
        this.emit.apply(this, args);
    }
}

module.exports = Model;
