var util = require('util');
var Observablecollection = require('./observableCollection.js');

function MemberCollection() {
    ObservableCollection.call(this);
}

util.inherits(MemberCollection, ObservableCollection);

MemberCollection.prototype.add = function add(name, type) {

}