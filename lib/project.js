'use strict';

var Emitter = require('./eventEmitter.js');
var Undo = require('undo.js');
var Namespace = require('./namespace.js');
var Events = require('./events.js');
var RequestForChange = require('./requestForChange.js');

class Util {
    static * iterateFamily(parent, getSibling, getItems) {
        var children = getItems(parent);
        
        if(!children) {
            return;
        }
        
        for(let child of children) {
            yield child;
        }
        
        //yield* children;
        
        for(let sibling of getSibling(parent)) {
            yield* this.iterateFamily(sibling, getSibling, getItems);
            // for(let grandChild of iterateFamily(child, getChildren)) {
            //     yield grandChild;
            // }
        }
        
        return;
    }
}

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
    
    get namespaces() {
        return Util.iterateFamily(this.root, nspace => nspace.children, nspace => nspace.children);
    }
    
    get models() {
        return Util.iterateFamily(this.root, nspace => nspace.children, nspace => nspace.models);
    }
    
    get instances() {
        return Util.iterateFamily(this.root, nspace => nspace.children, nspace => nspace.instances);
    }
    
    open() {
        var req = new RequestForChange({ project: this });
            
        this.emit(Events.project.openRequest, req);
        this._processRequestForchange(req);
    }
    
    // Commits the project's changes
    commit() {
        var req = new RequestForChange({ project: this });
            
        this.emit(Events.project.commitRequest, req);
        this._processRequestForchange(req);
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
                this.emit('error', "Request for change failed: %j", req.context);
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