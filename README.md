# affinity

A data modeling system that allows developers to create & delete custom data structures at runtime wirth referential integrity. There are zero dependencies for this library.

# Installation

`npm install @spikedpunch/affinity`

# Usage

```js
import { Project } from '@spikedpunch/affinity'

let project = new Project()

let child = await project.root.new('child')

await child.rename('changedNameChild')

await child.models.new('model1', {
   
})

project.root.new('child', nspace => {

})

```



----
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
await model.append({
   cost: 0.0,
   isHeavy: true,
   name: '',
   colors: ['blue', 'orange']
})

// or maybe:
await model.append([
   double('cost', 0.0),
   bool('isHeavy', true),
   string('name', '')
])

// Respond before the member value has changed
model.on<ValueChanging>(change => {
   //...
   // Returning false will discard the change
   // For multiple changing handlers, all fo them must return true
   // for the change to take affect
   // return true | false | Promise<bool>
})

model.on<MemberMoved>(change => {
   //..
})

model.on<Disposing>(change => {
   //.. Model still exists
})

model.on<Disposed>(change => {
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

**Using Plugins**
```js
import { Redis } from 'affinity-plugin-redis'
import { Mongo } from 'affinity-plugin-mongo'

let project = new Project()

let redis = new Redis('connection string and options here')
let mongo = new Mongo('connection string and options here')

project.use(redis)
project.use(mongo)
```

## Supported Types

|    Type     | Description                       |
| :---------: | --------------------------------- |
|   string    |                                   |
|    bool     |                                   |
|     int     |                                   |
|    uint     |                                   |
|  array<T>   |                                   |
|  map<K,V>   |                                   |
|  instance   | Instance of a Model               |
| instanceRef | Reference to an existing instance |
|    enum     |                                   |
|    flag     |                                   |


# Plugins

```ts
class Redis {

   setup(project, router) {
      // Handlers are added to each event route, where each event router
      // can handle multiple handlers
      router.on(ModelCreate.type, this.createTable)

      // Multiple handlers are run in order
      router.on(ModelCreate.type, this.createTable)
      router.on(ModelCreate.type, this.applySchemaToTable)

      router.on(MemberMove.type, this.memberMoving)
      router.on(InstanceCreate.type, this.modelCreating)

      // Inline handler
      router.on(ProjectCommit.type, async (change) => {
         // ...
      })
   }

   async createTable(change) {
      // ...
   }

   async applySchemaToTable(change) {
      // ...
   }

   async modelCreating(change) {

   }

   async memberMoving(change) {

   }

}

```

# Stuffs

* All QualifiedObjects have Project wide unique IDs
* Members Have Unique IDs, and Fields inherit their IDs from their associated Member


# Improvements | TODOs

ModelCollection/NamespaceCollection/InstanceCollection:
  - Change the events to: 'adding', 'added', etc instead of the gloabl Event object.
    Only use the global events object for subscribing to changes on the Project.
    It makes it easier to sub to changes, and people will remember it better. ie
      project.root.models.on('added', items => ...)

* Change all Delete words to Remove (or vice versa, just be consistent)
