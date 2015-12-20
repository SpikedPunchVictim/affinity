'use strict';

var ObservableCollection = require('./observableCollection.js');

//
//  This collection represents a collections of Named items
//  (items with a 'name' property)
class NamedCollection extends ObservableCollection {
    constructor() {
        super();        
    }

    get length() {
        return this._items.length;
    }

    at(index) {
        return this._items[index];
    }

    find(name) {
        if(typeof(name) !== 'string') {
            return this.emit('error', util.format('Invalid name type passed to find()'));
        }

        if(name == null || typeof(name) !== 'string') {
            return null;
        }

        var self = this;

        for(var i = 0; i < this._items.length; ++i) {
            var item = this._items[i];
            if(item.name === name) {
                return item;
            }
        }

        return null;
    }

    indexByName(name) {
        if(!_.isString(name)) {
            return this.emit('error', 'indexByName expects a string argument');
        }

        for(var i = 0; i < this.length; ++i) {
            var current = this._items.at(i);
            if(current.name === name) {
                return i;
            }
        }
    }

    _onValidateItem(item) {
        try {
            var name = item.name;
        } catch(e) {
            this.emit('error', 'Cannot add item without a valid name property to a NamedCollection');
        }   
    }
}

module.exports = NamedCollection;