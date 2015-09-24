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
exports.BoolChangeValueCommand = BoolChangeValueCommand


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
    undo: function undo() {
        if(this.stackPosition < 0) {
            return;
        }

        this.commands[this.stackPosition].undo();
        this.stackPosition--;
    },
    redo: function redo() {
        if(this.stackPosition < 0) {
            return;
        }

        this.stackPosition++;
        this.commands[this.stackPosition].undo();
    }
});

//------------------------------------------------------------------------
function Command() {

}

_.extend(Command.prototype, {
    execute: function() { throw new Error('Must override execute'); },
    undo: function() { throw new Error('Must override undo'); },
    redo: function() { throw new Error('Must override redo'); }
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
        execute: function() {
            this.instance.members.set(this.memberName, nextValue);
        },
        undo: function() {
            var member = this.instance.members.set(this.memberName, previousValue);

            // Restore the inheriting flag in the case it was inheriting before the changes were made
            member.isInheriting = this.isInheriting;
        },
        redo: function() {
            this.execute();
        }
});

//------------------------------------------------------------------------
function CreateNamespaceCommand(name, parentNamespace) {
    Command.call(this);
    this.name = name;
    this.parentNamespace = parentNamespace;
}

_.extend(CreateNamespaceCommand.prototype, {
        execute: function() {
            this.parentNamespace.children.add(this.name);
        },
        undo: function() {
            this.parentNamespace.children.remove(this.name);
        },
        redo: function() {
            this.execute();
        }
});

//------------------------------------------------------------------------
function CreateModelCommand(name, parentNamespace) {
    Command.call(this);
    this.name = name;
    this.parentNamespace = parentNamespace;
}

_.extend(CreateNamespaceCommand.prototype, {
        execute: function() {
            this.parentNamespace.models.add(this.name);
        },
        undo: function() {
            this.parentNamespace.models.remove(this.name);
        },
        redo: function() {
            this.execute();
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
        execute: function() {
            this.model._name = this.next;
        },
        undo: function() {
            this.model._name = this.previous;
        },
        redo: function() {
            this.execute();
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
        execute: function() {
            this.instance._name = this.next;
        },
        undo: function() {
            this.instance._name = this.previous;
        },
        redo: function() {
            this.execute();
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
        execute: function() {
            this.instanceMember._name = this.next;
        },
        undo: function() {
            this.instanceMember._name = this.previous;
        },
        redo: function() {
            this.execute();
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
        execute: function() {
            this.member._name = this.next;
        },
        undo: function() {
            this.member._name = this.previous;
        },
        redo: function() {
            this.execute();
        }
});


//------------------------------------------------------------------------
// -- Types --
//------------------------------------------------------------------------

function BoolChangeValueCommand(value, from, to) {
    this.value = value;
    this.from = from;
    this.to = to;
}

_.extend(SetModelMemberNameCommand.prototype, {
        execute: function() {
            this.value._setValue(this.to);
        },
        undo: function() {
            this.value._setValue(this.from);
        },
        redo: function() {
            this.execute();
        }
});