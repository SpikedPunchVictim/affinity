'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NamedCollection = require('./namedCollection.js');
var Events = require('../events.js');

var NamespaceCollection = function (_NamedCollection) {
    (0, _inherits3.default)(NamespaceCollection, _NamedCollection);

    function NamespaceCollection(namespace) {
        (0, _classCallCheck3.default)(this, NamespaceCollection);

        var _this = (0, _possibleConstructorReturn3.default)(this, (NamespaceCollection.__proto__ || Object.getPrototypeOf(NamespaceCollection)).call(this));

        _this._namespace = namespace;
        return _this;
    }

    (0, _createClass3.default)(NamespaceCollection, [{
        key: 'new',
        value: function _new(name) {
            // Since these collections are both factories and collections,
            // we require the modules where we need them
            var Namespace = require('../namespace.js');

            if (this.findByName(name) != null) {
                throw new Error('Namespace name already exists. Namespaces must be unique.');
            }

            var nspace = new Namespace(name, this._namespace, this.context);
            this._add([{ item: nspace, index: this._items.length }]);
            return nspace;
        }

        /*
        * Gets or adds the specified namespace by name
        *
        * @param {string} name The Namespace's name
        * @return {Namespace} The Namespace with the specified name
        */

    }, {
        key: 'getOrAdd',
        value: function getOrAdd(name) {
            var found = this.findByName(name);
            if (found == null) {
                return this.new(name);
            }

            return found;
        }

        // Centralizing emitting events

    }, {
        key: '_emitEvent',
        value: function _emitEvent() {
            var args = [];
            for (var i = 0; i < arguments.length; ++i) {
                args[i] = arguments[i];
            }

            this.context.project.emit.apply(this.context.project, args);
            this.emit.apply(this, args);
        }
    }, {
        key: '_onAdding',
        value: function _onAdding(items) {
            this._onValidateAdding(items);
            this._emitEvent(Events.namespaceCollection.adding, items);
        }
    }, {
        key: '_onAdded',
        value: function _onAdded(items) {
            this._emitEvent(Events.namespaceCollection.added, items);
        }
    }, {
        key: '_onRemoving',
        value: function _onRemoving(items) {
            this._emitEvent(Events.namespaceCollection.removing, items);
        }
    }, {
        key: '_onRemoved',
        value: function _onRemoved(items) {
            this._emitEvent(Events.namespaceCollection.removed, items);
        }
    }, {
        key: '_onMoving',
        value: function _onMoving(items) {
            this._emitEvent(Events.namespaceCollection.moving, items);
        }
    }, {
        key: '_onMoved',
        value: function _onMoved(items) {
            this._emitEvent(Events.namespaceCollection.moved, items);
        }
    }, {
        key: '_onValidateAdding',
        value: function _onValidateAdding(items) {
            // Blank
        }
    }, {
        key: 'context',
        get: function get() {
            return this._namespace.context;
        }
    }, {
        key: 'namespace',
        get: function get() {
            return this._namespace;
        }
    }]);
    return NamespaceCollection;
}(NamedCollection);

module.exports = NamespaceCollection;