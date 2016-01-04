'use strict';

var EventEmitter = require('../eventEmitter.js');

//------------------------------------------------------------------------
function toIterable(array) {
    return {
        next() {
            return this._index < array.length ?
                    { value: array[this._index++], done: false } :
                    { done: false };
        },
        _index: 0
    }
}

//------------------------------------------------------------------------
class Iterable {
    constructor(){
        this._items = [];
    }
    
    [Symbol.iterator]() {
        return toIterable(this._items);
    }
}

//------------------------------------------------------------------------
class MapIterable {
    constructor() {
        this._items = {};
    }
    
    get keys() {
        var results = [];
        for(var k of Object.keys(this._items)) {
            results.push(k);
        }
        return results;
    }
    
    get values() {
        var results = [];
        for(let key in this.keys) {
            results.push(this._items[key])
        }
        return results;                                                   
    }
    
    [Symbol.iterator]() {
        var results = [];
        for(var k of Object.keys(this._items)) {
            results.push(k);
        }
        
        return toIterable(results);
    }
}

//------------------------------------------------------------------------
class TypeFactory extends MapIterable {
    constructor() {
        super();
    }
    
    get names() {
        return Object.keys(this._items);
    }
    
    // onCreateType: function(name, options)
    // onCreateValue: function(name, options)
    define(name, onCreateType, onCreateValue) {
        this._items[name.toLowerCase()] = {
            name: name,
            type: onCreateType,
            create: onCreateValue
        };
    }
    
    create(name, options) {
        return this._items[name.toLowerCase()].create(options);
    }
    
    type(name, options) {
        return this._items[name.toLowerCase()].type(options);
    }
}

//------------------------------------------------------------------------
class QualifiedObjectFactory extends MapIterable {
    constructor() {
        super();
    }
    
    // onCreate: function(options) -> QualifiedObject
    define(typeName, onCreate) {
        this._items[typeName.toLowerCase()] = {
            name: typeName,
            create: onCreate
        };
    }

    isSupported(typeName) {
        return typeName.toLowerCase() in this._items;
    }
    
    create(typeName, options) {
        return this._items[typeName.toLowerCase()](options);
    }    
}

//------------------------------------------------------------------------
class MemberFactory extends MapIterable {
    constructor() {
        super();
        this._onRfc = ctx => {
          return {
              fulfill() {
                  
              },
              reject() {
                  
              }
          }  
        };
    }
    
    // onCreate(name, options)
    define(typeName, onCreate) {
        this._items[typeName.toLowerCase()] = {
            name: typeName,
            create: onCreate
        };
    }
    
    onRequestForChange(onRfc) {
        
    }
    
    isSupported(typeName) {
        return typeName.toLowerCase() in this._items;
    }
    
    create(typeName, options) {
        return this._items[typeName.toLowerCase()](options);
    }    
}

//------------------------------------------------------------------------
class FieldFactory extends MapIterable {
    constructor() {
        super();
    }
    
    // onCreate: function(name, options)
    define(typeName, onCreate) {
        this._items[typeName.toLowerCase()] = {
            name: typeName,
            create: onCreate
        };
    }
    
    isSupported(typeName) {
        return typeName.toLowerCase() in this._items;
    }
    
    create(typeName, options) {
        return this._items[typeName.toLowerCase()](options);
    }    
}


//------------------------------------------------------------------------
class Core {
    constructor() {
        EventEmitter.mixin(this);
        this._types = new TypeFactory();
        this._qualifiedObjects = new QualifiedObjectFactory();
        this._members = new MemberFactory();
        this._fields = new FieldFactory();
    }
    
    get types() {
        return this._types;
    }
    
    get qualifiedObjects() {
        return this._qualifiedObjects;
    }
    
    get members() {
        return this._members;
    }
    
    get fields() {
        return this._fields;
    }
    
    get events() {
        return {
          registerProject: 'core-register-project',
          unregisterProject: 'core-unregister-project'            
        };
    }
    
    register(project) {
        this.emit(this.events.registerProject, project);
    }
    
    unregister(project) {
        this.emit(this.events.unregisterProject, project);
    }
}

exports = Core;