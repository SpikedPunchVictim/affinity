'use strict';

var Emitter = require('./eventEmitter.js');
var Undo = require('undo.js');
var Namespace = require('./namespace.js');
var ObservableCollection = require('./collections/observableCollection.js');

var events = {
    commit: 'project=commit',
    open: 'project-open'
}

class Project {
    constructor() {
        Emitter.mixin(this);
        var self = this;
        this.undoStack = new Undo.Stack();
        this._cores = new ObservableCollection();
        this._casts = new ObservableCollection();
        
        this.casts.on(ObservableCollection.events.added, this._onCastAdded.bind(this));
        this.casts.on(ObservableCollection.events.removed, this._onCastRemoved.bind(this));

        this.context = {
            project: self,
            root: self.root,
            undoStack: this.undoStack
        };

        this.root = new Namespace('', null, this.context); 
    }
    
    dispose() {
        this.casts.off(ObservableCollection.events.added, this._onCastAdded.bind(this));
        this.casts.off(ObservableCollection.events.removed, this._onCastRemoved.bind(this));
    }
    
    get cores() {
        return this._cores;
    }
    
    get casts() {
        return this._casts;
    }
    
    get types() {
        var results = [];
        this._cores.forEach(core => {
           core.types.forEach(type => {
               results.push(type);
           })
        });
        
        return results;
    }
    
    open() {
        this.emit(events.open, this);
    }
    
    // Commits the porject's changes
    commit() {
        this.emit(events.commit, this);
    }
    
    _onCastAdded(items) {
        for(let item in items) {
            item.item.register(this);
        }
    }
    
    _onCastRemoved(items) {
        for(let item in items) {
            item.item.unregister(this);
        }  
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