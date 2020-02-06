# affinity

TODO:
- Add a `uuid` to every Model, Member, Instance, Field. This helps external systems keep track of items outside of their changes. It's too easy for developers to rely on names to keep track of state (ie whether or not a member or field has been checked in a UI)

# Usage

```js
const { create, types } = require('affinity')

let project = create()
let { root } = project

let child = root.new('child')

//  Populate the model
let model = child.models.new('model')
model.members.new('stringMember', types.string.value('inital-value'))
model.append({
   cost: 0.0,
   isHeavy: true,
   name: '',
   colors: ['blue', 'orange']
})

// or maybe:
model.append([
   double('cost', 0.0),
   bool('isHeavy', true),
   string('name', '')
])

// Respond before the member value has changed
model.on.valueChanging(change => {
   //...
   // Returning false will discard the change
   // For multiple changing handlers, all fo them must return true
   // for the change to take affect
   // return true | false | Promise<bool>
})

model.on.memberMoved(change => {
   //..
})

model.on.disposing(change => {
   //.. Model still exists
})

model.on.disposed(change => {
   //.. Model has been removed from all references
})

// Iterate over the members
for(let member of model) {
   //...
}

// Insert the new values at index 2
model.insert(2, {

})


child.instances.new('instance', model)
```
