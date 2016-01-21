'use strict';

var Emitter = require('./eventEmitter.js');
var Undo = require('undo.js');
var Namespace = require('./namespace.js');
var Events = require('./events.js');

class Project {
    constructor() {
        Emitter.mixin(this);
        var self = this;
        this.undoStack = new Undo.Stack();
        this.context = {
            project: self,
            root: self.root,
            undoStack: this.undoStack
        };

        this.root = new Namespace('', null, this.context); 
    }
    
    dispose() {

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