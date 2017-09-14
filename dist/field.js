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

var util = require('util');
var NamedObject = require('./namedObject.js');
var Commands = require('./commands.js');
var Member = require('./member.js');
var Events = require('./events.js');

var Field = function (_NamedObject) {
    (0, _inherits3.default)(Field, _NamedObject);

    function Field(instance, member) {
        (0, _classCallCheck3.default)(this, Field);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Field.__proto__ || Object.getPrototypeOf(Field)).call(this, member.name));

        _this._instance = instance;
        _this._isInheriting = true;
        _this._member = member;

        _this._value = member.value.clone();
        _this._value.on(Events.requestForChange, _this._requestForChange.bind(_this));
        _this._value.on(Events.valueChanging, _this._onValueChanging.bind(_this));
        _this._value.on(Events.valueChanged, _this._onValueChanged.bind(_this));

        _this._member.on(Events.member.valueChanged, _this._onMemberValueChanged.bind(_this));
        _this._member.on(Events.member.nameChanged, _this._memberNameChanged.bind(_this));
        return _this;
    }

    (0, _createClass3.default)(Field, [{
        key: 'dispose',
        value: function dispose() {
            this.emit(Events.disposing, { source: this });
            this._value.off(Events.requestForChange, this._requestForChange);
            this._value.off(Events.valueChanged, this._onValueChanged);
            this._member.off(Events.member.valueChanged, this._onMemberValueChanged);
            this._member.off(Events.member.nameChanged, this._memberNameChanged);
            this.emit(Events.disposed, { source: this });
        }
    }, {
        key: 'reset',
        value: function reset() {
            this._onReset();
        }
    }, {
        key: '_setIsInheriting',
        value: function _setIsInheriting(isInheriting) {
            if (this._isInheriting === isInheriting) {
                return;
            }

            // TODO: RFC on a reset?
            var change = { field: this };
            this.context.project.emit(Events.field.inheritedChanging, change);
            this.emit(Events.field.inheritedChanging, change);

            this._isInheriting = isInheriting;

            this.context.project.emit(Events.field.inheritedChanged, change);
            this.emit(Events.field.inheritedChanged, change);
        }
    }, {
        key: '_memberNameChanged',
        value: function _memberNameChanged(change) {
            this.name = change.to;
        }
    }, {
        key: '_onValueChanging',
        value: function _onValueChanging(change) {
            this.context.project.emit(Events.field.valueChanging, change);
            this.emit(Events.field.valueChanging, change);
        }
    }, {
        key: '_onValueChanged',
        value: function _onValueChanged(change) {
            if (!this.member.value.equals(this.value)) {
                this._setIsInheriting(false);
            }

            this.context.project.emit(Events.field.valueChanged, change);
            this.emit(Events.field.valueChanged, change);
        }
    }, {
        key: '_requestForChange',
        value: function _requestForChange(request) {
            request.field = this;
            this.context.project._onRequestForchange(request);
        }
    }, {
        key: '_onReset',
        value: function _onReset() {
            // Changing the value is done by implementers
            this.emit(Events.field.resetStart, this);
            this._setIsInheriting(true);
            this.emit(Events.field.resetEnd, this);
        }
    }, {
        key: '_onMemberValueChanged',
        value: function _onMemberValueChanged(change) {
            if (this._isInheriting) {
                this._onInheritedValueChanged(change);
            }
        }
    }, {
        key: '_onInheritedValueChanged',
        value: function _onInheritedValueChanged(change) {
            this._value.applyChangeSet(change);
        }
    }, {
        key: 'instance',
        get: function get() {
            return this._instance;
        }
    }, {
        key: 'context',
        get: function get() {
            return this._instance.context;
        }
    }, {
        key: 'member',
        get: function get() {
            return this._member;
        }
    }, {
        key: 'type',
        get: function get() {
            return this.member.type;
        }
    }, {
        key: 'value',
        get: function get() {
            return this._value;
        }

        // set value(val) {
        //     if(this._value.equals(val)) {
        //         return;
        //     }

        //     if(!val) {
        //         throw new Error('Invalid value used to set a field');
        //     }

        //     var change = {
        //         field: this,
        //         from: this._value,
        //         to: val
        //     };

        //     this._value.off(Events.requestForChange, this._requestForChange);
        //     this._value.off(Events.valueChanged, this._onValueChanged);

        //     this._onValueChanging(change);        
        //     this._value.update(val);
        //     this._onValueChanged(change);

        //     this.emit(Events.field.valueChanged, change);
        //     this._value.on(Events.requestForChange, this._requestForChange.bind(this));
        //     this._value.on(Events.valueChanged, this._onValueChanged.bind(this));
        // }

    }, {
        key: 'isInheriting',
        get: function get() {
            return this._isInheriting;
        }
    }]);
    return Field;
}(NamedObject);

module.exports = Field;