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

var NamedObject = require('./namedObject.js');
var Events = require('./events.js');

// The QualifiedObject represents an object in the namespacing scheme

var QualifiedObject = function (_NamedObject) {
    (0, _inherits3.default)(QualifiedObject, _NamedObject);

    // parent: QualifiedObject
    //      This object's parent in the Qualified Tree
    function QualifiedObject(name, parent) {
        (0, _classCallCheck3.default)(this, QualifiedObject);

        var _this = (0, _possibleConstructorReturn3.default)(this, (QualifiedObject.__proto__ || Object.getPrototypeOf(QualifiedObject)).call(this, name));

        _this._parent = parent;
        return _this;
    }

    (0, _createClass3.default)(QualifiedObject, [{
        key: '_onParentChange',
        value: function _onParentChange(newParent) {
            this._parent = newParent;
        }
    }, {
        key: 'parent',
        get: function get() {
            return this._parent;
        },
        set: function set(value) {
            if (this._parent === value) {
                return;
            }

            var change = {
                from: this._parent,
                to: value
            };

            this.emit(Events.parentChanging, change);
            this._parent = value;
            this.emit(Events.parentChanged, change);
        }

        // Gets the Object's Qualified Name

    }, {
        key: 'qualifiedName',
        get: function get() {
            var results = [];
            results.push(this._name);

            var current = this._parent;

            while (current != null) {
                if (current.name.length > 0) {
                    results.unshift(current.name);
                }

                current = current.parent;
            }

            return results.join('.');
        }
    }]);
    return QualifiedObject;
}(NamedObject);

module.exports = QualifiedObject;