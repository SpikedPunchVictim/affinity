const _ = require('lodash');
const EventEmitter = require('eventemitter3')

module.exports.mixin = function mixin(dest) {
   if ('emit' in dest) {
      return;
   } else {
      Emitter(dest);
      dest.hasListeners = function (event) {
         return hasListeners(dest, event);
      }
   }
}

// module.exports.chain = function chain(src, dest) {
//    return Emitter.pipe(src, dest);
// }

module.exports.sub = function (source, subs) {
   subs.forEach(item => {
      source.on(item.event, item.handler);
   });

   return {
      off: function off() {
         subs.forEach(item => {
            source.off(item.event, item.handler);
         });
      }
   }
}

const NoOpFunction = (_ => _)

class EventBus extends EventEmitter {
   constructor() {
      super()

      this.map = new WeakMap()
   }

   /**
    * Patches an object to communicate with the EventBus
    * 
    * @param {object} source The source object to make observable
    * @param {object} options The options contain the following:
    *    - beforeEmit {function(event, ...args)}
    */
   patch(source, options={}) {
      if(this.map.has(source)){
         return
      }

      options.beforeEmit = options.beforeEmit || NoOpFunction

      let self = this
   
      source.emit = function(...args) {
         if(args.length == 0) {
            throw new Error('Not enough parameters to emit an event')
         }

         let event = args.shift()

         self.emit('beforeEmit', { event, source, values: args })

         let emitter = self.map.get(source)
         emitter.emit(event, ...args)
      }

      let sameSignature = [
         'addListener',
         'off',
         'on',
         'once',
         'prependListener',
         'prependOnceListener',
         'removeListener'
      ]

      for(let i = 0; i < sameSignature.length; ++i) {
         let method = sameSignature[i]

         source[method] = function(event, handler) {
            let emitter = self.map.get(source)
            return emitter[method](event, handler)
         }
      }

      source.listeners = function(event) {
         let emitter = self.map.get(source)
         return emitter.listeners(event)
      }

      source.removeAllListeners = function(event) {
         let emitter = self.map.get(source)
         return emitter.removeAllListeners(event)
      }
   
      this.map.set(source, new EventEmitter())
   }
}

const eventBus = new EventBus()
module.exports.EventBus = eventBus