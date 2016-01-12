'use strict';

var Emitter = require('./eventEmitter.js');
var Undo = require('undo.js');
var Namespace = require('./namespace.js').Namespace;
//var ObservableCollection = require('./collections/observableCollection.js');

var events = {
    commit: 'project=commit',
    open: 'project-open',
    requestForChange: 'project-request-for-change'
}

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
        this.emit(events.open, this);
    }
    
    // Commits the porject's changes
    commit() {
        this.emit(events.commit, this);
    }
    
    _processRequestForchange(req) {
        // Raising the event will allow external processes to add their 'await' methods.
        this.emit(events.requestForChange, req);
        var promise = req.fulfill();
        
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

exports.create = create;
exports.open = open;
exports.events = events;