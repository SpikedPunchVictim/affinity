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
var Model = require('../model.js');
var Events = require('../events.js');

var ModelCollection = function (_NamedCollection) {
    (0, _inherits3.default)(ModelCollection, _NamedCollection);

    function ModelCollection(namespace) {
        (0, _classCallCheck3.default)(this, ModelCollection);

        var _this = (0, _possibleConstructorReturn3.default)(this, (ModelCollection.__proto__ || Object.getPrototypeOf(ModelCollection)).call(this));

        _this._namespace = namespace;
        return _this;
    }

    (0, _createClass3.default)(ModelCollection, [{
        key: 'new',
        value: function _new(name) {
            var model = new Model(name, this._namespace);
            this._add([{ item: model, index: this.length }]);
            return model;
        }
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
            this._emitEvent(Events.modelCollection.adding, items);
        }
    }, {
        key: '_onAdded',
        value: function _onAdded(items) {
            this._emitEvent(Events.modelCollection.added, items);
        }
    }, {
        key: '_onRemoving',
        value: function _onRemoving(items) {
            this._emitEvent(Events.modelCollection.removing, items);
        }
    }, {
        key: '_onRemoved',
        value: function _onRemoved(items) {
            this._emitEvent(Events.modelCollection.removed, items);
        }
    }, {
        key: '_onMoving',
        value: function _onMoving(items) {
            this._emitEvent(Events.modelCollection.moving, items);
        }
    }, {
        key: '_onMoved',
        value: function _onMoved(items) {
            this._emitEvent(Events.modelCollection.moved, items);
        }
    }, {
        key: '_onValidateAdding',
        value: function _onValidateAdding(items) {
            // Blank
        }
    }, {
        key: 'namespace',
        get: function get() {
            return this._namespace;
        }
    }, {
        key: 'context',
        get: function get() {
            return this.namespace.context;
        }
    }]);
    return ModelCollection;
}(NamedCollection);

module.exports = ModelCollection;