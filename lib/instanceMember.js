var EventEmitter = require('events').EventEmitter;
var util = require('util');
var NamedObject = require('./namedObject.js');
var commands = require('./commands.js');
var utility = require('./utility.js');

module.exports = InstanceMember;

//------------------------------------------------------------------------
//
// Project Events:
//  'field-value-changing'
//      Raised before the field value changes
//
//  'field-value-changed'
//      Raised after the field value has changed
//
//------------------------------------------------------------------------
function InstanceMember(instance, modelMember) {
    NamedObject.mixin(this);
    this._name = modelMember.name;

    this.instance = instance;
    this.modelMember = modelMember;
    this._value = modelMember.value;
    this.isInheriting = true;
    this.valueChangeForward = null;

    this.modelMember.on('name-changed', this._onMemberNameChanged);

    var self = this;

    Object.defineProperty(this, 'type', {
        get: function() { return self.modelMember.type; }
    });

    Object.defineProperty(this, 'value', {
        get: function() {
            return self._value;
        },

        set: function(value) {
            if(value === self._value || self._value.equals(value)) {
                return;
            }

            // var changed = new commands.ChangeFieldValueCommand(this, value);
            // this.context.undoStack.push(changed);

            var valueChange = {
                field: self,
                prev: self._value,
                next: value
            };

            self.context.project.emit('instancemember-value-changing', valueChange);

            if(self.valueChangeForward) {
                self.valueChangeForward.unsubscribe();
            }

            self._value = value;

            if(self.valueChangeForward) {
                self.valueChangeForward = utility.events.subscribe(['value-changing', 'value-changed'], self._value, self);
                self.valueChangeForward.subscribe();
            }

            self.context.project.emit('instancemember-value-changed', valueChange);
        }
    });
}

util.inherits(InstanceMember, EventEmitter);

//------------------------------------------------------------------------
InstanceMember.prototype.dispose = function dispose() {
    this.modelMember.remove('name-changed', this._onMemberNameChanged);
}

//------------------------------------------------------------------------
InstanceMember.prototype._onMemberNameChanged = function _onMemberNameChanged(changed) {
    this.name = changed.to;
}