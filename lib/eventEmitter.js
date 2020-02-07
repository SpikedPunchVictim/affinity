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

function sub(source, subs) {
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

class EventRouter extends EventEmitter {
   constructor() {
      super()
   }

   join(source) {
      let self = this
      let emit = source.emit.bind(source)

      source.emit = function(...args) {
         if(args.length == 0) {
            throw new Error('Not enough parameters to emit an event')
         }

         let event = args.shift()

         self.emit('beforeEmit', { event, source, values: args })
         emit(event, ...args)
         self.emit('afterEmit', { event, source, values: args })
      }
   }
}

module.exports = {
   EventRouter,
   EventEmitter,
   sub
}