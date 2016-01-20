'use strict';

var Member = require('./member.js');
var Simple = require('./types/simple.js');
var Collection = require('./types/collection.js');
var Commands = require('./commands.js');

//------------------------------------------------------------------------
class SimpleMember extends Member {
    constructor(name, value) {
        super(name);
        this._value = this._createValue(value);
        this._value.on('value-changing', this._onValueChanging);
        this._value.on('value-changed', this._onValueChanged);
    }
    
    dispose() {
        super.dispose();
        this._value.off('value-changing', this._onValueChanging);
        this._value.off('value-changed', this._onValueChanged);
    }
    
    get value() {
        return this._value;
    }
    
    set value(val) {
        if(!this.type.equals(val.type)) {
            this.emit('error', "The type being set does not match the Member's type");
        }
        
        if(this._value.equals(val)) {
            return;
        }
        
        var req = this._requestForChange({value: val});
        
        req.fulfilled(context => {
            var change = {
                from: this._value,
                to: context.value
            };
            
            this._onValueChanging(change);
            this._value = context.value; 
            this._onValuechanged(change);
        });
    }
    
    _createValue(value) {
        throw new Error('Not implemented error')
    }
}

//------------------------------------------------------------------------
class BoolMember extends SimpleMember {
    constructor(name, value) {
        super(name, value || true);
    }
    
    get type() {
        return Simple.bool.type();
    }
    
    _createValue(value) {
        return Simple.bool.create(value);
    }  
}

//------------------------------------------------------------------------
class DecimalMember extends SimpleMember {
    constructor(name, value) {
        super(name, value || 0.0);
    }
    
    get type() {
        return Simple.decimal.type();
    }
    
    _createValue(value) {
        return Simple.decimal.create(value);
    }  
}

//------------------------------------------------------------------------
class IntMember extends SimpleMember {
    constructor(name, value) {
        super(name, value || 0);
    }
    
    get type() {
        return Simple.int.type();
    }
    
    _createValue(value) {
        return Simple.int.create(value);
    }  
}

//------------------------------------------------------------------------
class StringMember extends Member {
    constructor(name, value) {
        super(name, value || "");
    }
    
    get type() {
        return Simple.string.type();
    }
    
    _createValue(value) {
        return Simple.string.create(value);
    }
}

//------------------------------------------------------------------------
class UIntMember extends SimpleMember {
    constructor(name, value) {
        super(name, value || 0);
    }
    
    get type() {
        return Simple.uint.type();
    }
    
    _createValue(value) {
        return Simple.uint.create(value);
    }  
}

//------------------------------------------------------------------------
class CollectionMember extends Member {
    constructor(name, itemType) {
        super(name);
        this._value = Collection.create(itemType);
        this._type = Collection.type({itemType: itemType});
        
        this._value.on(Collection.events.rfcAdd, this._requestForChange);
        this._value.on(Collection.events.rfcRemove, this._requestForChange);
        this._value.on(Collection.events.rfcMove, this._requestForChange);
    }
    
    get type() {
        return this._type;
    }
    
    dispose() {
        super.dispose();
        this._value.off(Collection.events.rfcAdd, this._requestForChange);
        this._value.off(Collection.events.rfcRemove, this._requestForChange);
        this._value.off(Collection.events.rfcMove, this._requestForChange);
    }
    
    get value() {
        return this._value;
    }
}

module.exports = {
    BoolMember: BoolMember,
    DecimalMember: DecimalMember,
    IntMember: IntMember,
    StringMember: StringMember,
    UIntMember: UIntMember,
    CollectionMember: CollectionMember
}
