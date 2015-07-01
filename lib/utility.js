module.exports.mixin = function mixin(dest, source) {
  if (dest && source) {
    for (var key in source) {
      dest[key] = source[key];
    }
  }
  return dest;
}
