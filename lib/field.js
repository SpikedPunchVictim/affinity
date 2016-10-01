'use strict';

var util = require('util');
var NamedObject = require('./namedObject.js');
var Commands = require('./commands.js');
var Member = require('./member.js');
var Events = require('./events.js');

class Field extends NamedObject {
    constructor(instance, member) {
        super(member.name);
        this._instance = instance;
        this._isInheriting = true;
        this._member = member;
        
        this._value = member.value.clone();
        this._value.on(Events.requestForChange, this._requestForChange.bind(this));
        this._value.on(Events.valueChanged, this._onValueChanged.bind(this));
        
        this._member.on(Events.member.valueChanged, this._onMemberValueChanged.bind(this));
        this._member.on(Events.member.nameChanged, this._memberNameChanged.bind(this));
    }
    
    dispose() {
        this.emit(Events.disposing, { source: this });
        this._value.off(Events.requestForChange, this._requestForChange);
        this._value.off(Events.valueChanged, this._onValueChanged);
        this._member.off(Events.member.valueChanged, this._onMemberValueChanged);
        this._member.off(Events.member.nameChanged, this._memberNameChanged);
        this.emit(Events.disposed, { source: this });
    }
    
    get instance() {
        return this._instance;
    }
    
    get context() {
        return this._instance.context;
    }
    
    get member() {
        return this._member;
    }
    
    get type() {
        return this.member.type;
    }
    
    get value() {
        return this._value;
    }
    
    set value(val) {
        if(this._value.equals(val)) {
            return;
        }
        
        if(!val) {
            throw new Error('Invalid value used to set a field');
        }
        
        var change = {
            field: this,
            from: this._value,
            to: val
        };
        
        this._value.off(Events.requestForChange, this._requestForChange);
        this._value.off(Events.valueChanged, this._onValueChanged);
        
        this._onValueChanging(change);        
        this._value.update(val);
        this._onValueChanged(change);

        this.emit(Events.field.valueChanged, change);
        this._value.on(Events.requestForChange, this._requestForChange.bind(this));
        this._value.on(Events.valueChanged, this._onValueChanged.bind(this));
    }
    
    get isInheriting() {
        return this._isInheriting;
    }
    
    reset() {
        this._onReset();        
    }
    
    _setIsInheriting(isInheriting) {
        if(this._isInheriting === isInheriting) {
            return;
        }
        
        // TODO: RFC on a reset?
        var change = { field: this };
        this.context.project.emit(Events.field.inheritedChanging, change);
        this.emit(Events.field.inheritedChanging, change);
        
        this._isInheriting = isInheriting;
        
        this.context.project.emit(Events.field.inheritedChanged, change);
        this.emit(Events.field.inheritedChanged, change);
    }
    
    _memberNameChanged(change) {
        this.name = change.to;
    }
    
    _onValueChanging(change) {
        this.context.project.emit(Events.field.valueChanging, change);
        this.emit(Events.field.valueChanging, change);
    }
    
    _onValueChanged(change) {
        if(!this.member.value.equals(change.to)) {
            this._setIsInheriting(false);
        }
        
        this.context.project.emit(Events.field.valueChanged, change);
        this.emit(Events.field.valueChanged, change);
    }
    
    _requestForChange(request) {
        request.field = this;
        this.context.project._onRequestForchange(request);
    }
    
    _onReset() {
        // Changing the value is done by implementers
        this.emit(Events.field.resetStart, this);
        this._setIsInheriting(true);
        this.emit(Events.field.resetEnd, this);
    }
    
    _onMemberValueChanged(change) {
        if(this._isInheriting) {
            this._onInheritedValueChanged(change);
        }
    }
    
    _onInheritedValueChanged(change) {
        this._value.applyChangeSet(change);
    }
}

module.exports = Field;