var util = require('util');
var NamedObject = require('./namedObject.js');
var utility = require('./utility.js');

module.exports = ModelMember;

function ModelMember(model, name, value) {
    NamedObject.mixin(this);
    utility.events.mixin(this);

    this.model = model;
    this._name = name;

    Object.defineProperty(this, 'context', {
        get: function() {
            return this.model.context;
        }
    });

    Object.defineProperty(this, 'type', {
        get: function() {
            return this._value.type;
        }
    });

    Object.defineProperty(this, 'value', {
        get: function() {
            return this._value.value;
        },

        set: function(value) {
            if(this._value && (value === this._value || this._value.equals(value))) {
                return;
            }

            // var changed = new commands.ChangeFieldValueCommand(this, value);
            // this.context.undoStack.push(changed);

            var valueChange = {
                member: this,
                from: this._value,
                to: value
            };

            if(this._value) {
                this._value.removeListener('value-changing', this._onValueChanged);
                this._value.removeListener('value-changed', this._onValueChanged);
            }

            this.context.project.emit('model-member-value-changing', valueChange);
            this.emit('value-changing', valueChange);

            this._value = value;

            if(this._value) {
                this._value.on('value-changing', this._onValueChanging.bind(this));
                this._value.on('value-changed', this._onValueChanged.bind(this));
            }

            this.context.project.emit('model-member-value-changed', valueChange);
            this.emit('value-changed', valueChange);
        }
    });

    this.value = value; 
}

//------------------------------------------------------------------------
ModelMember.prototype._onValueChanged = function _onValueChanged() {

}