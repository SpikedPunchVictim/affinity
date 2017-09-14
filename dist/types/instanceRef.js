'use strict';

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Type = require('./type.js');
var Events = require('../events.js');

var InstanceRefType = function (_Type) {
    (0, _inherits3.default)(InstanceRefType, _Type);

    function InstanceRefType(model) {
        (0, _classCallCheck3.default)(this, InstanceRefType);
        return (0, _possibleConstructorReturn3.default)(this, (InstanceRefType.__proto__ || Object.getPrototypeOf(InstanceRefType)).call(this, 'instance-reference'));
    }

    return InstanceRefType;
}(Type);

var emptyInstance = {
    on: function on() {}
};

var InstanceRef = function () {
    function InstanceRef(model, instance) {
        (0, _classCallCheck3.default)(this, InstanceRef);

        this._type = new InstanceRefType(model);
        this._model = model;
        this._instance = instance || emptyInstance;
        this._instance.on(Events.disposed, this._onInstanceDisposed.bind(this));
    }

    (0, _createClass3.default)(InstanceRef, [{
        key: 'equals',
        value: function equals(other) {
            return other.type.equals(this._type) && this._instance === other.model;
        }
    }, {
        key: 'clone',
        value: function clone() {
            return new InstanceRef(this._instance);
        }
    }, {
        key: '_onInstanceDisposed',
        value: function _onInstanceDisposed() {
            this.emit(Events.valueChanging);
            this._instance.off(Events.disposed, this._onInstanceDisposed);
            this._instance = emptyInstance;
        }
    }, {
        key: 'instance',
        get: function get() {
            return this._instance;
        }
    }, {
        key: 'isEmpty',
        get: function get() {
            return this._instance === emptyInstance;
        }
    }], [{
        key: 'emptyInstance',
        get: function get() {
            return emptyInstance;
        }
    }]);
    return InstanceRef;
}();