'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Emitter = require('./eventEmitter.js');
var Undo = require('undo.js');
var Namespace = require('./namespace.js');
var Events = require('./events.js');
var Rfc = require('./requestForChange.js');
var Search = require('./search.js');

var Util = function () {
   function Util() {
      (0, _classCallCheck3.default)(this, Util);
   }

   (0, _createClass3.default)(Util, null, [{
      key: 'iterateFamily',
      value: /*#__PURE__*/_regenerator2.default.mark(function iterateFamily(parent, getSibling, getItems) {
         var children, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, child, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, sibling;

         return _regenerator2.default.wrap(function iterateFamily$(_context) {
            while (1) {
               switch (_context.prev = _context.next) {
                  case 0:
                     children = getItems(parent);

                     if (children) {
                        _context.next = 3;
                        break;
                     }

                     return _context.abrupt('return');

                  case 3:
                     _iteratorNormalCompletion = true;
                     _didIteratorError = false;
                     _iteratorError = undefined;
                     _context.prev = 6;
                     _iterator = children[Symbol.iterator]();

                  case 8:
                     if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                        _context.next = 15;
                        break;
                     }

                     child = _step.value;
                     _context.next = 12;
                     return child;

                  case 12:
                     _iteratorNormalCompletion = true;
                     _context.next = 8;
                     break;

                  case 15:
                     _context.next = 21;
                     break;

                  case 17:
                     _context.prev = 17;
                     _context.t0 = _context['catch'](6);
                     _didIteratorError = true;
                     _iteratorError = _context.t0;

                  case 21:
                     _context.prev = 21;
                     _context.prev = 22;

                     if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                     }

                  case 24:
                     _context.prev = 24;

                     if (!_didIteratorError) {
                        _context.next = 27;
                        break;
                     }

                     throw _iteratorError;

                  case 27:
                     return _context.finish(24);

                  case 28:
                     return _context.finish(21);

                  case 29:

                     //yield* children;

                     _iteratorNormalCompletion2 = true;
                     _didIteratorError2 = false;
                     _iteratorError2 = undefined;
                     _context.prev = 32;
                     _iterator2 = getSibling(parent)[Symbol.iterator]();

                  case 34:
                     if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                        _context.next = 40;
                        break;
                     }

                     sibling = _step2.value;
                     return _context.delegateYield(this.iterateFamily(sibling, getSibling, getItems), 't1', 37);

                  case 37:
                     _iteratorNormalCompletion2 = true;
                     _context.next = 34;
                     break;

                  case 40:
                     _context.next = 46;
                     break;

                  case 42:
                     _context.prev = 42;
                     _context.t2 = _context['catch'](32);
                     _didIteratorError2 = true;
                     _iteratorError2 = _context.t2;

                  case 46:
                     _context.prev = 46;
                     _context.prev = 47;

                     if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                     }

                  case 49:
                     _context.prev = 49;

                     if (!_didIteratorError2) {
                        _context.next = 52;
                        break;
                     }

                     throw _iteratorError2;

                  case 52:
                     return _context.finish(49);

                  case 53:
                     return _context.finish(46);

                  case 54:
                     return _context.abrupt('return');

                  case 55:
                  case 'end':
                     return _context.stop();
               }
            }
         }, iterateFamily, this, [[6, 17, 21, 29], [22,, 24, 28], [32, 42, 46, 54], [47,, 49, 53]]);
      })
   }]);
   return Util;
}();

var Project = function () {
   function Project() {
      (0, _classCallCheck3.default)(this, Project);

      Emitter.mixin(this);

      this._undoStack = new Undo.Stack();

      this._context = {
         project: this
      };

      this._root = new Namespace('', null, this._context);
      this._search = new Search(this);
   }

   (0, _createClass3.default)(Project, [{
      key: 'dispose',
      value: function dispose() {}
   }, {
      key: 'open',
      value: function open() {
         var _this = this;

         return Rfc.new({ project: this }).notify(function (req) {
            _this.emit(Events.project.openRequest, req);
            _this.emit(Events.requestForChange, req);
         }).queue();
      }

      // Commits the project's changes

   }, {
      key: 'commit',
      value: function commit() {
         var self = this;
         return Rfc.new({ project: this }).notify(function (req) {
            self.emit(Events.project.commitRequest, req);
            self.emit(Events.requestForChange, req);
         }).fulfill(function (req) {
            return true;
         }).queue();
      }
   }, {
      key: '_onRequestForchange',
      value: function _onRequestForchange(req) {
         this.emit(Events.requestForChange, req);
      }
   }, {
      key: 'root',
      get: function get() {
         return this._root;
      }
   }, {
      key: 'namespaces',
      get: function get() {
         return Util.iterateFamily(this.root, function (nspace) {
            return nspace.children;
         }, function (nspace) {
            return nspace.children;
         });
      }
   }, {
      key: 'models',
      get: function get() {
         return Util.iterateFamily(this.root, function (nspace) {
            return nspace.children;
         }, function (nspace) {
            return nspace.models;
         });
      }
   }, {
      key: 'instances',
      get: function get() {
         return Util.iterateFamily(this.root, function (nspace) {
            return nspace.children;
         }, function (nspace) {
            return nspace.instances;
         });
      }
   }, {
      key: 'search',
      get: function get() {
         return this._search;
      }
   }]);
   return Project;
}();

function create() {
   return new Project();
}

function open() {
   // ...
}

module.exports = {
   create: function create() {
      return new Project();
   },
   open: function open() {
      //...
   }
};