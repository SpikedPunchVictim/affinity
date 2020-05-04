import { IActionRouter } from "./ActionRouter"
import { IRfcAction } from "./Actions"

export type RfcHandler = (action: IRfcAction, err?: Error) => Promise<void>

export interface IRequestForChange {
   fulfill(handler: RfcHandler): IRequestForChange
   reject(handler: RfcHandler): IRequestForChange
   commit(): Promise<void>
}

export interface IRequestForChangeSource {
   create(action: IRfcAction): IRequestForChange
}

export class RequestForChangeSource implements IRequestForChangeSource {
   readonly router: IActionRouter
   
   constructor(router: IActionRouter) {
      this.router = router
   }

   create(action: IRfcAction): IRequestForChange {
      return new RequestForChange(action, this.router)
   }
}

export class RequestForChange implements IRequestForChange {
   readonly router: IActionRouter
   readonly action: IRfcAction
   private rejects: Array<RfcHandler>
   private fulfills: Array<RfcHandler>

   constructor(action: IRfcAction, router: IActionRouter) {
      this.action = action
      this.router = router
      this.fulfills = new Array<RfcHandler>()
      this.rejects = new Array<RfcHandler>()
   }

   fulfill(handler: RfcHandler): IRequestForChange {
      this.fulfills.push(handler)
      return this
   }
   
   reject(handler: RfcHandler): IRequestForChange {
      this.rejects.push(handler)
      return this
   }

   async commit(): Promise<void> {
      try {
         await this.router.raise(this.action)

         for(let handler of this.fulfills) {
            await handler(this.action)
         }
      } catch(err) {
         for(let handler of this.rejects) {
            await handler(this.action, err)
         }
      }
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