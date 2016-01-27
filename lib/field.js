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
        
        this._member.on(Events.member.valueChanged, this._onMemberValueChanged.bind(this));
        this._member.on(Events.member.nameChanged, this._memberNameChanged.bind(this));
    }
    
    dispose() {
        this._member.off(Events.member.valueChanged, this._onMemberValueChanged);
        this._member.off(Events.member.nameChanged, this._memberNameChanged);
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
        
        this.context.project.emit(Events.field.inheritedChanging, this);
        this.emit(Events.field.inheritedChanging, this);
        
        this._isInheriting = isInheriting;
        
        this.context.project.emit(Events.field.inheritedChanged, this);
        this.emit(Events.field.inheritedChanged, this);
    }
    
    _memberNameChanged(change) {
        this.name = change.to;
    }
    
    _onValueChanging(change) {
        this.context.project.emit(Events.field.valueChanging, change);
        this.emit(Events.field.valueChanging, change);
    }
    
    _onValuechanged(change) {
        this.context.project.emit(Events.field.valueChanged, change);
        this.emit(Events.field.valueChanged, change);
    }
    
    _requestForChange(context) {
        var request = new Commands.RequestForChange(this, context);
        request.field = this;
        this.context.project.emit(Events.field.requestForChange, request);
        request.fulfill();
    }
    
    _onReset() {
        // Changing the value is done by implementers
        this._setIsInheriting(true);
    }
    
    _onMemberValueChanged(change) {
        if(this._isInheriting) {
            this._onInheritedValueChanged(change);
        }
    }
    
    _onInheritedValueChanged(change) {
        // Subclasses will implement this
    }
}

module.exports = Field;

/*
//------------------------------------------------------------------------
//
// Project Events:
//  'instancemember-value-changing'
//      Raised before the field value changes
//
//  'instancemember-value-changed'
//      Raised after the field value has changed
//
//------------------------------------------------------------------------
function InstanceMember(instance, modelMember) {
    NamedObject.mixin(this);
    Emitter.mixin(this);

    this._name = modelMember.name;

    this.instance = instance;
    this.isInheriting = true;
    this.valueChangeForward = null;
    this.modelMember = modelMember;
    this._value = modelMember.value;

    this.modelMember.on('name-changed', this._onMemberNameChanged);

    var self = this;

    Object.defineProperty(this, 'modelMember', {
        get: function() {
            return this._modelMember;
        },
        set: function(value) {
            if(this._modelMember && value === this._modelMember) {
                return;
            }

            this._modelMember = value;

            if(this.isInheriting) {
                this.value = modelMember.value;
            }            
        }
    });

    Object.defineProperty(this, 'type', {
        get: function() { return self.modelMember.type; }
    });

    Object.defineProperty(this, 'value', {
        get: function() {
            return self._value;
        },

        set: function(value) {
            if(self._value && (value === self._value || self._value.equals(value))) {
                return;
            }

            var valueChange = {
                member: self,
                from: self._value,
                to: value
            };

            if(this._value) {
                this._value.removeListener('value-changed', this._onValueChanged.bind(this));
            }

            self.context.project.emit('instance-member-value-changing', valueChange);
            self.emit('value-changing', valueChange);

            self._value = value;

            if(this._value) {
                this._value.on('value-changed', this._onValueChanged.bind(this));
            }

            self.context.project.emit('instance-member-value-changed', valueChange);
            self.emit('value-changed', valueChange);
        }
    });

    this.modelMember = modelMember;
}

//------------------------------------------------------------------------
InstanceMember.prototype.dispose = function dispose() {
    this.modelMember.remove('name-changed', this._onMemberNameChanged);
}

//------------------------------------------------------------------------
InstanceMember.prototype._onNameChange = function _onNameChange(from, to) {
    instance.context.project.emit('instance-member-name-changing');

    var command = new commands.SetInstanceMemberNameCommand(this, to);
    command.execute();
    instance.context.undostack.add(command);

    instance.context.project.emit('instance-member-name-changed');
}

//------------------------------------------------------------------------
InstanceMember.prototype._onMemberNameChanged = function _onMemberNameChanged(changed) {
    this.name = changed.to;
}

//------------------------------------------------------------------------
InstanceMember.prototype._onValueChanged = function _onValueChanged(changed) {
    // TODO: Optimize registration to only those members that are inheriting
    if(this.isInheriting) {
        this.value = changed.to;
    }
}
*/