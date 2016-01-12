'use strict';
var Field = require('./field.js');


class SimpleField extends Field {
    constructor(instance, member) {
        super(instance, member);
        this._value = member.value;
    }
    
    get value() {
        return this._value;
    }
    
    set value(val) {
        if(!this.type.equals(val.type)) {
            this.emit('error', "The type being set does not match the Field's type");
        }
        
        if(this._value.equals(val)) {
            return;
        }
        
        var req = this._requestForChange({value: val});
        
        req.fulfilled(context => {
            if(this._isInheriting) {
                this._setIsInheriting(false);
            }
            
            var change = {
                from: this._value,
                to: context.value
            };
            
            this._onValueChanging(change);
            this._value = context.value;
            this._onValuechanged(change);            
        }, this);
    }
    
    _onReset() {
        super._onReset();
        
        var change = {
            from: this._value,
            to: this.member.value
        };
        
        this._onValueChanging(change);
        this._value = this.member.value;
        this._onValuechanged(change);
    }
}