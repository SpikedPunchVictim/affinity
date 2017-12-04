import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import builtins from 'rollup-plugin-node-builtins'

export default {
   input: 'lib/index.js',
   name: 'affinity',
   output: {
      file: './dist/affinity.js',
      format: 'umd',
      name: 'affinity'
   },
   plugins: [
      resolve(),
      commonjs({ exports: 'named' }),
      builtins(),
      buble({ include: ['*.js'] })
   ]
}