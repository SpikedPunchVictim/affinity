# affinity

An data modeling system with:
* Referential integrity
* Plugin Support
* Realtime monitoring of data changes

`affinity` allows you to build out your application with data as the centerpiece. With each module making changes to the data as they need, and other modules responding to those changes.

# Events

## Project

The `Project` emits every event from the Models, Instances, Members, Fields it contains. `Project` events are emitted before the the handlers on the source object are called.

When subscribing to events on the `Project`, the handler has the following signature:

> **handler(event, { source, values })**
>
> - `event` {string}: The event name
> - `source` {object}: The source of the event (ie Model, Member, Instance, etc)
> - `values` {Array}: An Array containing the values passed along for that type of event
>

**Example**
```js
project.on('valueChanged', (event, { source, values }) => {

})

```

## Model


## Instance



# Request For Change

A `request-for-change` event is emitted any time a Qualified Resource is updated. It allows developers to hook into every value change process to respond to data changes in real time. The


```js

project.on('request-for-change', ({ rfc }) => {
   rfc.await((ctx, cb) => {
      // Some code here to update a DB or respond to the data change
   })
})
```


=======
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