import 'dotenv/config';
import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';

const configPlugins = [
  nodeResolve({
    extensions: ['.js', '.jsx'],
    main: true,
    browser: true,
  }),
  babel({
    babelHelpers: 'runtime',
    skipPreflightCheck: true,
    exclude: 'node_modules/**',
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  }),
  commonjs(),
  json(),
  replace({
    'process.env': JSON.stringify({
      ENDPOINT_ANALYTICS_URL: process.env.ENDPOINT_ANALYTICS_URL,
    }),
    preventAssignment: true,
  }),
  terser({ compress: { evaluate: false } }),
];

export default [
  {
    input: 'src/index.js',
    external: ['react', 'react-dom'],
    output: [
      {
        file: 'build/lib/bundles/bundle.esm.min.js',
        format: 'esm',
        plugins: [terser()],
        sourcemap: true,
      },
    ],
    plugins: configPlugins,
  },
  {
    input: 'src/index.js',
    external: ['react', 'react-dom'],
    output: [
      {
        file: 'build/lib/types/index.min.js',
      },
    ],
    plugins: [
      ...configPlugins,
      typescript({
        tsconfig: 'tsconfig.json',
        allowJs: true,
        include: ['*.js+(|x)', '**/*.js+(|x)'],
        exclude: ['./node_modules/**/*'],
      }),
    ],
  },
  {
    input: 'src/analytics.js',
    output: [
      {
        file: 'build/analytics.js',
        format: 'iife',
        name: 'AesirAnalytics',
      },
    ],
    plugins: configPlugins,
  },
];
