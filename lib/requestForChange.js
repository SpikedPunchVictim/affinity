'use strict';

var Q = require('q');
var Events = require('./events.js');


//------------------------------------------------------------------------
// This class encapsulates a request for change
//------------------------------------------------------------------------
class RequestForChange {
    constructor(thisArg, context) {
        this._thisArg = thisArg;
        this._context = context;
        
        this._fullfillHandlers = [];
        this._rejectedHandlers = [];
        this._settlingPromise = null;
        
        this._awaits = null;
    }
    
    get context() {
        return this._context;
    }
    
    // onAwait: function(context, promise)
    await(onAwait) {
        if(this._awaits == null) {
            // onAwait: function(promise)
            this._awaits = [onAwait];
        } else {
            // onAwait: function(promise)
            this._awaits.push(onAwait);
        }
    }
    
    // onFullfilled: function(context)
    fulfilled(thisArg, onFulfilled) {
        this._fullfillHandlers.push({
            thisArg: thisArg,
            handle: onFulfilled
        });

        return this;
    }
    
    // onRejected: function(err, context)
    rejected(thisArg, onRejected) {
        this._rejectedHandlers.push({
            thisArg: thisArg,
            handle: onRejected
        });

        return this;
    }

    _settle() {
        if(this._settlingPromise) {
            return this._settlingPromise;    
        }
        
        var promises = [];
        
        for(let doAwait in this._awaits) {
            var promise = Q.defer();
            promises.push(promise);
            doAwait(this.context, promise);
        }
        
        this._settlingPromise = Q.all(promises)
        .then(() => {
            this._fulfill();
        })
        .catch(err => {
            this._reject(err); 
        });
        
        return this._settlingPromise;
    }
    
    _fulfill() {        
        for(let current of this._fullfillHandlers) {
            current.handle.call(current.thisArg, this.context);
        }
    }
    
    _reject(err) {
        for(let current in this._rejectedHandlers) {
            current.handle.call(current.thisArg, err, this.context);
        }
    }
}

module.exports = RequestForChange;