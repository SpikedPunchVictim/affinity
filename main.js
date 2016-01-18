'use strict';
var gaia = require('./lib/index.js');
var ObservableCollection = require('./lib/collections/observableCollection.js');

var obs = new ObservableCollection();
obs.add(11);
obs.add(21);
obs.add(32);

var itr = obs[Symbol.iterator]();
console.log(itr.next());
console.log(itr.next());

for(var item of obs) {
    console.log(item);
}

var project = gaia.create();
var newModel = project.root.models.new('new_model');
var newInstance = project.root.instances.new('new_instance', newModel);
newModel.members.new('boolean', 'free', {value: false});