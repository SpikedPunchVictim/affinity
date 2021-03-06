type RfcHandler = (context: IRfcContext) => void
type RfcChainCallback = (err?: Error) => void
type RfcChainHandler = (context: IRfcContext, callback: RfcChainCallback) => void

interface IRfcContext {
   readonly type: string
}

export interface IRequestForChange {
   notify(handler: RfcHandler): IRequestForChange
   chain(handler: RfcChainHandler): IRequestForChange // chain, join, await
   fulfill(handler: RfcHandler): IRequestForChange
   reject(handler: RfcHandler): IRequestForChange
   commit(): void
}

export class RequestForChange implements IRequestForChange {
   readonly context: IRfcContext

   constructor(context: IRfcContext) {
      this.context = context
   }

   notify(handler: RfcHandler): IRequestForChange {

   }

   chain(handler: RfcChainHandler): IRequestForChange {

   }

   fulfill(handler: RfcHandler): IRequestForChange {

   }
   
   reject(handler: RfcHandler): IRequestForChange {

   }

   commit(): void {
      
   }
}

/*

let change = {
   type: 'value-int',
   oldValue: 4
   newValue: 3
}

new RequestForChange(change)
   .notify(ctx => self.emit('request-for-change', ctx))
   .fulfill(ctx => {
      self.emit(Events.valueChanging, changed)
      self._value = val
      self.emit(Events.valueChanged, changed)
   })
   .commit()


*/


// 'use strict';

// var when = require('when');
// var _ = require('lodash');

// let requestQueue = [];

// function processNext() {
//    if (requestQueue.length > 0) {
//       let rfc = requestQueue.shift();
//       rfc.settle().tap(_ => processNext());
//    }
// }

// class RequestForChange {
//    constructor(context) {
//       this._context = context;
//       this._notify = null;
//       this._awaits = [];
//       this._fulfills = [];
//       this._rejects = [];
//       this._defer = when.defer();
//    }

//    static new(context) {
//       return new RequestForChange(context);
//    }

//    /*
//    * Gets the request's context.
//    * 
//    * @return {Object}
//    */
//    get context() {
//       return this._context;
//    }

//    /*
//    * Sets the method called when notifying the world of this change
//    *
//    * @params {function} onNotify(req) Called when notifying the world
//    */
//    notify(onNotify) {
//       this._notify = onNotify;
//       return this;
//    }

//    /*
//    * Sets the method called when fulling the request
//    *
//    * @params {function} onFulfill(req) Called when fulfilling the request
//    */
//    fulfill(onFulfill) {
//       this._fulfills.push(onFulfill);
//       return this;
//    }

//    /*
//    * Sets the method called when rejecting the request. Rejects occur
//    * when a problem was encoutered during setlle().
//    *
//    * @params {function} onReject(req) Called when rejecting the request
//    */
//    reject(onReject) {
//       this.rejects.push(onReject);
//       return this;
//    }

//    /*
//    * External processes register their change methods with await().
//    * The request and a supplied promise will be passed to the method
//    * when a Request for Change is issued
//    * 
//    * @params {function} onAwait(req, cb)
//    *  The function called before the request is fulfilled. If the supplied promise
//    *  is rejected, then all of the rejected handlers are run, giving external processes
//    *  an opportunity to recover from a failure.
//    */
//    await(onAwait) {
//       this._awaits.push(onAwait);
//       return this;
//    }

//    /*
//    * Queues this request
//    */
//    queue() {
//       requestQueue.push(this);
//       processNext();
//       return this._defer.promise;
//    }

//    /**
//     * Processes all requests currently waiting
//     */
//    settle() {
//       if (this._notify) {
//          this._notify(this);
//       }

//       let cb = function (defer, err) {
//          if (err) {
//             return defer.reject(err);
//          }

//          defer.resolve();
//       }

//       let promises = [];
//       for (let doAwait of this._awaits) {
//          let defer = when.defer();
//          promises.push(defer.promise);
//          doAwait(this.context, _.bind(cb, defer));
//       }

//       let self = this;
//       return when.all(promises)
//          .then(_ => {
//             for (let fulfill of self._fulfills) {
//                fulfill(self);
//             }

//             this._defer.resolve();

//             return;
//          })
//          .catch(err => {
//             for (let reject of self._rejects) {
//                reject(self);
//             }

//             this._defer.reject(err);
//          })
//          .finally(_ => processNext());
//    }
// }

// module.exports = RequestForChange;