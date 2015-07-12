var NamedObject = require('./namedObject.js');

function Field(instance, member) {
    NamedObject.mixin(this);
    this.instance = instance;
    this.name = member.name;
    this.member = member;
    this.type = member.type;
    this._value = member.value;
    this.isInheriting = true;

    Object.defineProperty(this, 'value', {
        get: function() {
            return this._value;
        },

        set: function(value) {
            if(value === this._value || this._value.equals(value)) {
                return;
            }


        }
    });
}