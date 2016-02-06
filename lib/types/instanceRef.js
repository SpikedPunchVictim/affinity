'use strict';
var Type = require('./type.js');
var Events = require('../events.js');

class InstanceRefType extends Type {
    constructor(model) {
        super('instance-reference');
    }
}

var emptyInstance = {
    on: () => {}    
 };

class InstanceRef {
    constructor(model, instance) {
        this._type = new InstanceRefType(model);
        this._model = model;
        this._instance = instance || emptyInstance;
        this._instance.on(Events.disposed, this._onInstanceDisposed.bind(this));
    }
    
    get instance() {
        return this._instance;
    }

    static get emptyInstance() {
        return emptyInstance;
    }
    
    get isEmpty() {
        return this._instance === emptyInstance;
    }
    
    equals(other) {
        return (other.type.equals(this._type)) &&
                this._instance === other.model;        
    }
    
    clone() {
        return new InstanceRef(this._instance);
    }
    
    _onInstanceDisposed() {
        this.emit(Events.valueChanging, )
        this._instance.off(Events.disposed, this._onInstanceDisposed);
        this._instance = emptyInstance;
    }
}