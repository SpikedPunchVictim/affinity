'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Undo = require('undo.js');
var _ = require('lodash');

//------------------------------------------------------------------------

var Stack = function () {
    function Stack() {
        (0, _classCallCheck3.default)(this, Stack);

        this.commands = [];
        this.stackPosition = -1;
    }

    (0, _createClass3.default)(Stack, [{
        key: 'add',
        value: function add(command) {
            this.commands.push(command);
            this.stackPosition++;
        }
    }, {
        key: 'apply',
        value: function apply() {
            if (this.stackPosition < 0) {
                return;
            }

            this.commands[this.stackPosition].apply();
            this.stackPosition--;
        }
    }, {
        key: 'unapply',
        value: function unapply() {
            if (this.stackPosition < 0) {
                return;
            }

            this.stackPosition++;
            this.commands[this.stackPosition].unapply();
        }
    }]);
    return Stack;
}();

//------------------------------------------------------------------------
// Request for change command
// class RequestForChangeCommand {
//     //  onApply: function()
//     //  onUnapply: function()
//     constructor(onApply, onUnapply) {
//         this._reason = '';
//         this._onApply = onApply;
//         this._onUnapply = onUnapply;
//     }

//     get reason() {
//         return this._reason;
//     }

//     apply() {
//         if(this._onApply) {
//             this._onApply();
//         }
//     }

//     unapply() {
//         if(this._onUnapply) {
//             this._onUnapply();
//         }
//     }

//     reject(reason) {
//         this._reason = reason;
//     }
// }

//------------------------------------------------------------------------


var Command = function () {
    function Command() {
        (0, _classCallCheck3.default)(this, Command);
    }

    (0, _createClass3.default)(Command, [{
        key: 'apply',
        value: function apply() {
            throw new Error('Must override apply');
        }
    }, {
        key: 'unapply',
        value: function unapply() {
            throw new Error('Must override unapply');
        }
    }]);
    return Command;
}();

//------------------------------------------------------------------------


function ChangeInstanceMemberValueCommand(member, nextValue) {
    Command.call(this);
    this.name = 'ChangeInstanceMemberValueCommand';
    this.instance = member.instance;
    this.memberName = member.name;
    this.previousValue = member.value;
    this.nextValue = nextValue;
    this.isInheriting = member.isInheriting;
}

_.extend(ChangeInstanceMemberValueCommand.prototype, {
    apply: function apply() {
        this.instance.members.set(this.memberName, nextValue);
    },
    unapply: function unapply() {
        var member = this.instance.members.set(this.memberName, previousValue);

        // Restore the inheriting flag in the case it was inheriting before the changes were made
        member.isInheriting = this.isInheriting;
    }
});

//------------------------------------------------------------------------
function CreateNamespaceCommand(name, parentNamespace) {
    Command.call(this);
    this.name = name;
    this.parentNamespace = parentNamespace;
}

_.extend(CreateNamespaceCommand.prototype, {
    apply: function apply() {
        this.parentNamespace.children.add(this.name);
    },
    unapply: function unapply() {
        this.parentNamespace.children.remove(this.name);
    }
});

//------------------------------------------------------------------------
function CreateModelCommand(name, parentNamespace) {
    Command.call(this);
    this.name = name;
    this.parentNamespace = parentNamespace;
}

_.extend(CreateNamespaceCommand.prototype, {
    apply: function apply() {
        this.parentNamespace.models.add(this.name);
    },
    unapply: function unapply() {
        this.parentNamespace.models.remove(this.name);
    }
});

//------------------------------------------------------------------------
function SetModelNameCommand(model, name) {
    Command.call(this);
    this.model = model;
    this.next = name;
    this.previous = model.name;
}

_.extend(SetModelNameCommand.prototype, {
    apply: function apply() {
        this.model._name = this.next;
    },
    unapply: function unapply() {
        this.model._name = this.previous;
    }
});

//------------------------------------------------------------------------
function SetInstanceNameCommand(instance, name) {
    Command.call(this);
    this.instance = instance;
    this.next = name;
    this.previous = instance.name;
}

_.extend(SetInstanceNameCommand.prototype, {
    apply: function apply() {
        this.instance._name = this.next;
    },
    unapply: function unapply() {
        this.instance._name = this.previous;
    }
});

//------------------------------------------------------------------------
function SetInstanceMemberNameCommand(instanceMember, name) {
    Command.call(this);
    this.member = instanceMember;
    this.instance = instanceMember.instance;
    this.next = name;
    this.previous = instanceMember.name;
}

_.extend(SetInstanceMemberNameCommand.prototype, {
    apply: function apply() {
        this.instanceMember._name = this.next;
    },
    unapply: function unapply() {
        this.instanceMember._name = this.previous;
    }
});

//------------------------------------------------------------------------
function SetModelMemberNameCommand(member, name) {
    Command.call(this);
    this.member = member;
    this.model = member.model;
    this.next = name;
    this.previous = member.name;
}

_.extend(SetModelMemberNameCommand.prototype, {
    apply: function apply() {
        this.member._name = this.next;
    },
    unapply: function unapply() {
        this.member._name = this.previous;
    }
});

//------------------------------------------------------------------------
// -- Types --
//------------------------------------------------------------------------

function BoolChangeValueCommand(target, from, to) {
    this.target = target;
    this.from = from;
    this.to = to;
}

_.extend(BoolChangeValueCommand.prototype, {
    apply: function apply() {
        this.target._setValue(this.to);
    },
    unapply: function unapply() {
        this.target._setValue(this.from);
    }
});

function DecimalChangeValueCommand(target, from, to) {
    this.target = target;
    this.from = from;
    this.to = to;
}

_.extend(DecimalChangeValueCommand.prototype, {
    apply: function apply() {
        this.target._setValue(this.to);
    },
    unapply: function unapply() {
        this.target._setValue(this.from);
    }
});

function IntChangeValueCommand(value, from, to) {
    this.value = value;
    this.from = from;
    this.to = to;
}

_.extend(IntChangeValueCommand.prototype, {
    apply: function apply() {
        this.value._setValue(this.to);
    },
    unapply: function unapply() {
        this.value._setValue(this.from);
    }
});

function StringChangeValueCommand(value, from, to) {
    this.value = value;
    this.from = from;
    this.to = to;
}

_.extend(StringChangeValueCommand.prototype, {
    apply: function apply() {
        this.value._setValue(this.to);
    },
    unapply: function unapply() {
        this.value._setValue(this.from);
    }
});

function UintChangeValueCommand(value, from, to) {
    this.value = value;
    this.from = from;
    this.to = to;
}

_.extend(UintChangeValueCommand.prototype, {
    apply: function apply() {
        this.value._setValue(this.to);
    },
    unapply: function unapply() {
        this.value._setValue(this.from);
    }
});

exports.Stack = Stack;
exports.ChangeInstanceMemberValueCommand = ChangeInstanceMemberValueCommand;
exports.CreateNamespaceCommand = CreateNamespaceCommand;
exports.SetModelNameCommand = SetModelNameCommand;
exports.SetModelMemberNameCommand = SetModelMemberNameCommand;
exports.SetInstanceNameCommand = SetInstanceNameCommand;
exports.SetInstanceMemberNameCommand = SetInstanceMemberNameCommand;
exports.BoolChangeValueCommand = BoolChangeValueCommand;
exports.DecimalChangeValueCommand = DecimalChangeValueCommand;
exports.IntChangeValueCommand = IntChangeValueCommand;
exports.StringChangeValueCommand = StringChangeValueCommand;
exports.UintChangeValueCommand = UintChangeValueCommand;