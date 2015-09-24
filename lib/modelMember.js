var util = require('util');
var NamedObject = require('./namedObject.js');
var utility = require('./utility.js');
var Emitter = require('./eventEmitter.js');

module.exports = ModelMember;

function ModelMember(model, name, value) {
    NamedObject.mixin(this);
    Emitter.mixin(this);

    this.model = model;
    this._name = name;
    this.value = value;
}

ModelMember.prototype.dispose = function dispose() {
    this.value = null;
}

//------------------------------------------------------------------------
// List of supported events
ModelMember.events = {
    nameChanging: 'model-member-name-changing',
    nameChanged: 'model-member-name-changed',
    valueChanging: 'model-member-value-changing',
    valueChanged: 'model-member-value-changed'
}

//------------------------------------------------------------------------
Object.defineProperty(ModelMember.prototype, 'context', {
    get: function() {
        return this.model.context;
    }
});

//------------------------------------------------------------------------
Object.defineProperty(ModelMember.prototype, 'type', {
    get: function() {
        return this._value.type;
    }
});

//------------------------------------------------------------------------
Object.defineProperty(ModelMember.prototype, 'value', {
    get: function() {
        return this._value;
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
            this._value.off('value-changing', this._onValueChanging.bind(this));
            this._value.off('value-changed', this._onValueChanged.bind(this));
        }

        this.context.project.emit(ModelMember.events.valueChanging, valueChange);
        this.emit(ModelMember.events.valueChanging, valueChange);

        this._value.context = null;
        this._value = value;
        this._value.context = this.context;

        if(this._value) {
            this._value.on('value-changing', this._onValueChanging.bind(this));
            this._value.on('value-changed', this._onValueChanged.bind(this));
        }

        this.context.project.emit(ModelMember.events.valueChanged, valueChange);
        this.emit(ModelMember.events.valueChanged, valueChange);
    }
});

//------------------------------------------------------------------------
ModelMember.prototype._onNameChange = function _onNameChange(from, to) {
    model.context.project.emit(ModelMember.events.nameChanging);

    var command = new commands.SetModelMemberNameCommand(this, to);
    command.execute();
    model.context.undostack.add(command);

    model.context.project.emit(ModelMember.events.nameChanged);
}

//------------------------------------------------------------------------
ModelMember.prototype._onValueChanging = function _onValueChanging(change) {
    this.emit(ModelMember.events.valueChanging, change);
}

//------------------------------------------------------------------------
ModelMember.prototype._onValueChanged = function _onValueChanged(change) {
    this.emit(ModelMember.events.valueChanged, change);
}