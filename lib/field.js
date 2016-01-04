'use strict';

var util = require('util');
var NamedObject = require('./namedObject.js');
var Commands = require('./commands.js');
var Member = require('./member.js');
var Emitter = require('./eventEmitter.js');

var events = {
    inheritingChanged: 'field-inherited-changed',
    resetStart: 'field-reset-start',
    resetEnd: 'field-reset-end',
    requestForChange: 'field-request-for-change',
    valueChanging: 'field-value-changing',
    valueChanged: 'field-value-changed'
}

class Field extends NamedObject {
    constructor(instance, member) {
        super(member.name);
        this._instance = instance;
        this._isInheriting = true;
        this._member = member;
        
        this._member.on(Member.events.valueChanged, this._onMemberValueChanged);
    }
    
    dispose() {
        this._member.off(Member.events.valueChanged, this._onMemberValueChanged);
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
        
        this._isInheriting = isInheriting;
        this.context.project.emit(events.inheritingChanged, this);
        this.emit(events.inheritingChanged, this);
    }
    
    _onValueChanging(change) {
        this.context.project.emit(events.valueChanging, change);
        this.emit(events.valueChanging, change);
    }
    
    _onValuechanged(change) {
        this.context.project.emit(events.valueChanged, change);
        this.emit(events.valueChanged, change);
    }
    
    _requestForChange(context) {
        var request = new Commands.RequestForChange(this, context);
        request.field = this;
        this.context.project.emit(events.requestForChange, request);
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
        
    }
}

exports = Field;


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