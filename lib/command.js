var Undo = require('undo.js');

module.exports.ChangePropertyCommand = Undo.Command.extend({

});

mdule.exports.ChangeFieldValueCommand = Undo.Command.extend({
        constructor: function(instance, fieldName, previousValue, nextValue) {
            this.instance = instance.qualifiedName;
            this.fieldName = fieldName;
            this.previousValue = previousValue;
            this.nextValue = nextValue;
        },
        name: 'ChangeFieldValueCommand',
        execute: function() {

        },
        undo:
        redo:
    });