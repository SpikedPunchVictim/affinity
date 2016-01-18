'use strict';

var NamedObject = require('./namedObject.js').NamedObject;
var Commands = require('./commands.js');

var events = {
    nameChanging: 'member-name-changing',
    nameChanged: 'member-name-changed',
    requestForChange: 'member-request-for-change',
    valueChanging: 'member-value-changing',
    valueChanged: 'member-value-changed'
}

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
        this.context.project.emit(events.valueChanging, change);
        this.emit(events.valueChanging, change);
    }
    
    _onValuechanged(change) {
        this.context.project.emit(events.valueChanged, change);
        this.emit(events.valueChanged, change);
    }
    
    _onNameChanging(change) {
        super._onNameChanging(change);
        this.emit(events.nameChanging, change);
    }
    
    _onNameChanged(change) {
        super._onNameChanged(change);
        this.emit(events.nameChanged, change);
    }
}

exports.Member = Member;
exports.events = events;