// module.exports.mixin = function mixin(dest, source) {
//   if (dest && source) {
//     for (var key in source) {
//       dest[key] = source[key];
//     }
//   }
//   return dest;
// }

// Forwards events from one EventEmitter to another.
// This assumes both source and destination are EventEmitters
module.exports.forward = function forward(source, dest) {
    var emit = source.emit;
    source.emit = function(type){
    if ('error' != type) emit.apply(source, arguments);
    return dest.emit.apply(dest, arguments);
  };
}
