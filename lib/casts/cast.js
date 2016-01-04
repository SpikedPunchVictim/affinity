var Member = require('../member.js');

// Persistence layer
class Cast {
    constructor() {
        this._ignoredFields = [];
        
        for(let key in this) {
            this._ignoredFields.push(key);
        }
    }
    
    handle(eventName, handler) {
        this[eventName] = handler;
    }
    
    register(project) {
        for(let key in this) {
            if(this._ignoredFields.indexOf(key) >= 0) {
                continue;
            }
            
            project.on(key, this[key]);
        }
    }
    
    unregister(project) {
        for(let key in this) {
            if(this._ignoredFields.indexOf(key) >= 0) {
                continue;
            }
            
            project.off(key, this[key]);
        }      
    }
}

exports = Cast;