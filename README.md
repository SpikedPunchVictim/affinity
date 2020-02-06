# affinity


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