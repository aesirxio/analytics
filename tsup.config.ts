import { defineConfig } from 'tsup';
import { sassPlugin } from 'esbuild-sass-plugin';
import inlineImage from 'esbuild-plugin-inline-image';

const env = process.env.NODE_ENV;

export default defineConfig([
  {
    entry: ['src/index.ts'],
    clean: true,
    dts: true,
    format: ['esm'],
    platform: 'browser',
    loader: {
      '.js': 'jsx',
    },
    esbuildPlugins: [inlineImage({ limit: -1 }), sassPlugin({ type: 'style' })],
    esbuildOptions(options) {
      if (env === 'production') {
        options.drop = ['console'];
      }
    },
    outExtension() {
      return {
        js: `.js`,
      };
    },
  },
  {
    entry: ['src/analytics.tsx'],
    minify: true,
    format: ['iife'],
    platform: 'browser',
    esbuildPlugins: [inlineImage({ limit: -1 }), sassPlugin({ type: 'style' })],
    esbuildOptions(options) {
      if (env === 'production') {
        options.drop = ['console'];
      }
    },
    outExtension() {
      return {
        js: `.js`,
      };
    },
  },
]);
