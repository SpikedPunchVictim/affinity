'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var when = require('when');
var Events = require('./events.js');
var _ = require('lodash');

var requestQueue = [];

function processNext() {
   if (requestQueue.length > 0) {
      var rfc = requestQueue.shift();
      rfc.settle().tap(function (_) {
         return processNext();
      });
   }
}

var RequestForChange = function () {
   function RequestForChange(context) {
      (0, _classCallCheck3.default)(this, RequestForChange);

      this._context = context;
      this._notify = null;
      this._awaits = [];
      this._fulfills = [];
      this._rejects = [];
      this._defer = when.defer();
   }

   (0, _createClass3.default)(RequestForChange, [{
      key: 'notify',


      /*
      * Sets the method called when notifying the world of this change
      *
      * @params {function} onNotify(req) Called when notifying the world
      */
      value: function notify(onNotify) {
         this._notify = onNotify;
         return this;
      }

      /*
      * Sets the method called when fulling the request
      *
      * @params {function} onFulfill(req) Called when fulfilling the request
      */

   }, {
      key: 'fulfill',
      value: function fulfill(onFulfill) {
         this._fulfills.push(onFulfill);
         return this;
      }

      /*
      * Sets the method called when rejecting the request. Rejects occur
      * when a problem was encoutered during setlle().
      *
      * @params {function} onReject(req) Called when rejecting the request
      */

   }, {
      key: 'reject',
      value: function reject(onReject) {
         this.rejects.push(onReject);
         return this;
      }

      /*
      * External processes register their change methods with await().
      * The request and a supplied promise will be passed to the method
      * when a Request for Change is issued
      * 
      * @params {function} onAwait(req, cb)
      *  The function called before the request is fulfilled. If the supplied promise
      *  is rejected, then all of the rejected handlers are run, giving external processes
      *  an opportunity to recover from a failure.
      */
      //    await(onAwait) {
      //       this._awaits.push(onAwait);
      //       return this;
      //    }

      /*
      * Queues this request
      */

   }, {
      key: 'queue',
      value: function queue() {
         requestQueue.push(this);
         processNext();
         return this._defer.promise;
      }
   }, {
      key: 'settle',
      value: function settle() {
         var _this = this;

         if (this._notify) {
            this._notify(this);
         }

         var cb = function cb(defer, err) {
            if (err) {
               return defer.reject(err);
            }

            defer.resolve();
         };

         var promises = [];
         var _iteratorNormalCompletion = true;
         var _didIteratorError = false;
         var _iteratorError = undefined;

         try {
            for (var _iterator = this._awaits[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
               var doAwait = _step.value;

               var defer = when.defer();
               promises.push(defer.promise);
               doAwait(this.context, _.bind(cb, this, defer));
            }
         } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
         } finally {
            try {
               if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
               }
            } finally {
               if (_didIteratorError) {
                  throw _iteratorError;
               }
            }
         }

         var self = this;
         return when.all(promises).then(function (_) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
               for (var _iterator2 = self._fulfills[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var fulfill = _step2.value;

                  fulfill(self);
               }
            } catch (err) {
               _didIteratorError2 = true;
               _iteratorError2 = err;
            } finally {
               try {
                  if (!_iteratorNormalCompletion2 && _iterator2.return) {
                     _iterator2.return();
                  }
               } finally {
                  if (_didIteratorError2) {
                     throw _iteratorError2;
                  }
               }
            }

            _this._defer.resolve();

            return;
         }).catch(function (err) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
               for (var _iterator3 = self._rejects[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                  var reject = _step3.value;

                  reject(self);
               }
            } catch (err) {
               _didIteratorError3 = true;
               _iteratorError3 = err;
            } finally {
               try {
                  if (!_iteratorNormalCompletion3 && _iterator3.return) {
                     _iterator3.return();
                  }
               } finally {
                  if (_didIteratorError3) {
                     throw _iteratorError3;
                  }
               }
            }

            _this._defer.reject(err);
         }).finally(function (_) {
            return processNext();
         });
      }
   }, {
      key: 'context',


      /*
      * Gets the request's context.
      * 
      * @return {Object}
      */
      get: function get() {
         return this._context;
      }
   }], [{
      key: 'new',
      value: function _new(context) {
         return new RequestForChange(context);
      }
   }]);
   return RequestForChange;
}();

module.exports = RequestForChange;