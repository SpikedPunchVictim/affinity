'use strict';
var Field = require('./field.js');
var Collection = require('./types/collection.js');

class SimpleField extends Field {
    constructor(instance, member) {
        super(instance, member);
        this._value = member.value.clone();
    }
    
    get value() {
        return this._value;
    }
    
    set value(val) {
        if(!this.type.equals(val.type)) {
            this.emit('error', "The type being set does not match the Field's type");
            return;
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
    
    _onInheritedValueChanged(change) {
        this.value = change.to;
    }
}

//------------------------------------------------------------------------
class BoolField extends SimpleField {
    constructor(instance, member) {
        super(instance, member);
    }    
}

//------------------------------------------------------------------------
class DecimalField extends SimpleField {
    constructor(instance, member) {
        super(instance, member);
    } 
}

//------------------------------------------------------------------------
class IntField extends SimpleField {
    constructor(instance, member) {
        super(instance, member);
    } 
}

//------------------------------------------------------------------------
class StringField extends SimpleField {
    constructor(instance, member) {
        super(instance, member);
    } 
}

//------------------------------------------------------------------------
class UIntField extends SimpleField {
    constructor(instance, member) {
        super(instance, member);
    } 
}

//------------------------------------------------------------------------
class CollectionField extends Field {
    constructor(instance, member) {
        super(instance, member);
        this._value = member.value.clone();
    } 
}