'use strict';

var NamedObject = require('./namedObject.js');
var Commands = require('./commands.js');
var Events = require('./events.js');

//------------------------------------------------------------------------
class Member extends NamedObject {
    constructor(name, value) {
        super(name)
        this._model = null;
        
        // Setup value
        this._value = value;
        this._value.on(Events.requestForChange, this._requestForChange.bind(this));
        this._value.on(Events.valuechanging, this._onValueChanging.bind(this));
        this._value.on(Events.valueChanged, this._onValueChanged.bind(this));
    }
    
    dispose() {        
        this._value.off(Events.requestForChange, this._requestForChange);
        this._value.off(Events.valuechanging, this._onValueChanging);
        this._value.off(Events.valueChanged, this._onValueChanged);
        this._model = null;
    }
    
    get model() {
        return this._model;
    }
    
    get context() {
        return this._model.context;
    }
    
    get type() {
        return this._value.type();
    }
    
    get value() {
        return this._value;
    }
        
    _requestForChange(context) {
        var request = new Commands.RequestForChange(this, context);
        request.member = this;
        this.context.project._processRequestForchange(request);
    }
    
    _onValueChanging(change) {
        this.context.project.emit(Events.member.valueChanging, change);
        this.emit(Events.member.valueChanging, change);
    }
    
    _onValuechanged(change) {
        this.context.project.emit(Events.member.valueChanged, change);
        this.emit(Events.member.valueChanged, change);
    }
    
    _onNameChanging(change) {
        super._onNameChanging(change);
        this.emit(Events.member.nameChanging, change);
    }
    
    _onNameChanged(change) {
        super._onNameChanged(change);
        this.emit(Events.member.nameChanged, change);
    }
}

module.exports = Member;
