'use strict';

var NamedObject = require('./namedObject.js');
var Commands = require('./commands.js');
var Events = require('./events.js');

//------------------------------------------------------------------------
class Member extends NamedObject {
    constructor(name) {
        super(name)
        this._model = null;
    }
    
    dispose() {
        this._model = null;
    }
    
    get model() {
        return this._model;
    }
    
    get context() {
        return this._model.context;
    }
    
    get type() {
        throw new Error('Not implemented error');
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
