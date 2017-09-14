'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EventEmitter = require('./eventEmitter.js');
var Events = require('./events.js');

// This class is designed to be a mixin for classes that
// want support for a name field that raises events when 
// the name changes

var NamedObject = function () {
    function NamedObject(name) {
        (0, _classCallCheck3.default)(this, NamedObject);

        EventEmitter.mixin(this);
        this._name = name;
    }

    (0, _createClass3.default)(NamedObject, [{
        key: '_onNameChanging',
        value: function _onNameChanging(change) {
            this.emit(Events.nameChanging, change);
        }
    }, {
        key: '_onNameChanged',
        value: function _onNameChanged(change) {
            this.emit(Events.nameChanged, change);
        }
    }, {
        key: 'name',
        get: function get() {
            return this._name;
        },
        set: function set(value) {
            if (this._name === value) {
                return;
            }

            var change = {
                from: this._name,
                to: value
            };

            this._onNameChanging(change);
            this._name = value;
            this._onNameChanged(change);
        }
    }]);
    return NamedObject;
}();

module.exports = NamedObject;