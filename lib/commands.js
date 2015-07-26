var Undo = require('undo.js');
var _ = require('lodash');

var exports = module.exports;
exports.Stack = Stack;
exports.ChangeInstanceMemberValueCommand = ChangeInstanceMemberValueCommand;

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
            this.instance.members.set(this.memberName, nextValue);
        }
});

