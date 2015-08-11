var util = require('util');
var NamedObject = require('./namedObject.js');
var commands = require('./commands.js');
var utility = require('./utility.js');
var Emitter = require('./eventEmitter.js');

module.exports = InstanceMember;

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