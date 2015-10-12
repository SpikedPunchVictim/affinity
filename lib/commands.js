var Undo = require('undo.js');
var _ = require('lodash');

var exports = module.exports;
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


//------------------------------------------------------------------------
function Stack() {
    this.commands = [];
    this.stackPosition = -1;
}

_.extend(Stack.prototype, {
    add: function add(command) {
        this.commands.push(command);
        this.stackPosition++;
    },
    apply: function apply() {
        if(this.stackPosition < 0) {
            return;
        }

        this.commands[this.stackPosition].apply();
        this.stackPosition--;
    },
    unapply: function unapply() {
        if(this.stackPosition < 0) {
            return;
        }

        this.stackPosition++;
        this.commands[this.stackPosition].unapply();
    }
});

//------------------------------------------------------------------------
function Command() {

}

_.extend(Command.prototype, {
    apply: function() { throw new Error('Must override apply'); },
    unapply: function() { throw new Error('Must override unapply'); },
});

Command.prototype.extend = function extend(behavior) {
    _.extend(this, behavior);
}

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
        apply: function() {
            this.instance.members.set(this.memberName, nextValue);
        },
        unapply: function() {
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
        apply: function() {
            this.parentNamespace.children.add(this.name);
        },
        unapply: function() {
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
        apply: function() {
            this.parentNamespace.models.add(this.name);
        },
        unapply: function() {
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
        apply: function() {
            this.model._name = this.next;
        },
        unapply: function() {
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
        apply: function() {
            this.instance._name = this.next;
        },
        unapply: function() {
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
        apply: function() {
            this.instanceMember._name = this.next;
        },
        unapply: function() {
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
        apply: function() {
            this.member._name = this.next;
        },
        unapply: function() {
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
        apply: function() {
            this.target._setValue(this.to);
        },
        unapply: function() {
            this.target._setValue(this.from);
        }
});

function DecimalChangeValueCommand(target, from, to) {
    this.target = target;
    this.from = from;
    this.to = to;
}

_.extend(DecimalChangeValueCommand.prototype, {
        apply: function() {
            this.target._setValue(this.to);
        },
        unapply: function() {
            this.target._setValue(this.from);
        }
});

function IntChangeValueCommand(value, from, to) {
    this.value = value;
    this.from = from;
    this.to = to;
}

_.extend(IntChangeValueCommand.prototype, {
        apply: function() {
            this.value._setValue(this.to);
        },
        unapply: function() {
            this.value._setValue(this.from);
        }
});

function StringChangeValueCommand(value, from, to) {
    this.value = value;
    this.from = from;
    this.to = to;
}

_.extend(StringChangeValueCommand.prototype, {
        apply: function() {
            this.value._setValue(this.to);
        },
        unapply: function() {
            this.value._setValue(this.from);
        }
});

function UintChangeValueCommand(value, from, to) {
    this.value = value;
    this.from = from;
    this.to = to;
}

_.extend(UintChangeValueCommand.prototype, {
        apply: function() {
            this.value._setValue(this.to);
        },
        unapply: function() {
            this.value._setValue(this.from);
        }
});