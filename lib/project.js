'use strict';

var Emitter = require('./eventEmitter.js');
var Undo = require('undo.js');
var Namespace = require('./namespace.js');
var Events = require('./events.js');

class Project {
    constructor() {
        Emitter.mixin(this);
        
        this._undoStack = new Undo.Stack();        

        this._context = {
            project: this
        };
        
        this._root = new Namespace('', null, this._context); 
    }
    
    dispose() {

    }
    
    get root() {
        return this._root;
    }
    
    open() {
        this.emit(Events.project.open, this);
    }
    
    // Commits the project's changes
    commit() {
        this.emit(Events.project.commit, this);
    }
    
    _processRequestForchange(req) {
        // Raising the event will allow external processes to add their 'await' methods.
        this.emit(Events.requestForChange, req);
        var promise = req._settle();
        
        // TODO: Process RFCs. Rollback on fail.
        promise
            .then(_ => {
                req.fulfill();
            })
            .catch(err => {
                req.reject();
                this.emit('error', "Request for change failed");
            });
    }
}

function create() {
    return new Project();
}

function open() {
    // ...
}

module.exports = {
    create: function() {
        return new Project();
    },
    open: function() {
        //...
    }
}