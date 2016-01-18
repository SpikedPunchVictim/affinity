var deferred = require('deffered');

var events = {
    requestForChange: 'request-for-change'
}

//------------------------------------------------------------------------
// This class encapsulates a request for change
//------------------------------------------------------------------------
class RequestForChange {
    constructor(thisArg, context) {
        this._thisArg = thisArg;
        this._context = context;
        
        this._fullfilledHandles = [];
        this._rejectedHandles = [];
        this._onFulfilled = 0;
        this._onRejected = 0;
        this._awaits = [];
    }
    
    get context() {
        return this._context;
    }

    static get events() {
        return events;
    }
    
    // onAwait: function(context, promise)
    await(onAwait) {
        if(this._await == null) {
            // onAwait: function(promise)
            this._await = [onAwait];
        } else {
            // onAwait: function(promise)
            this._await.push(onAwait);
        }
        // External processes?
    }

    settle() {
        
    }
    
    fulfill() {
        var waiting = [];
        for(var doAwait in this._awaits) {
            var def = deferred();
            waiting.push(def);
            doAwait(this._context, def)
        }
        
        return deferred.map(waiting);
    }
    
    reject() {
        // TODO: Revisit
        for(let item in this._rejectedHandles) {
            item.handle(this._context).bind(item.thisArg);
        }
    }
    
    fulfilled(onFulfilled, thisArg) {
        this._onFulfilled.push({
            thisArg: thisArg,
            handle: onFulfilled
        });

        return this;
    }
    
    rejected(onRejected, thisArg) {
        this._rejectedHandles.push({
            thisArg: thisArg,
            handle: onRejected
        });

        return this;
    }    
}

module.exports = RequestForChange;