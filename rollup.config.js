import 'dotenv/config';
import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import buble from '@rollup/plugin-buble';
import replace from '@rollup/plugin-replace';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'build/analytics.js',
      format: 'iife',
      name: 'AesirAnalytics',
    },
    {
      file: 'build/lib/bundles/bundle.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'build/lib/bundles/bundle.esm.min.js',
      format: 'esm',
      plugins: [terser()],
      sourcemap: true,
    },
    {
      file: 'build/lib/bundles/bundle.umd.js',
      format: 'umd',
      name: 'AesirAnalytics',
      sourcemap: true,
    },
    {
      file: 'build/lib/bundles/bundle.umd.min.js',
      format: 'umd',
      name: 'AesirAnalytics',
      plugins: [terser()],
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
    }),
    json(),
    replace({
      process: JSON.stringify({
        env: {
          ENDPOINT_URL: process.env.ENDPOINT_URL,
        },
      }),
    }),
    buble({
      objectAssign: true,
      transforms: {
        // make async/await work by default (no transforms)
        asyncAwait: false,
      },
    }),
    terser({ compress: { evaluate: false } }),
    uglify(),
  ],
};
