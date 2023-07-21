import { defineConfig } from 'tsup';
import { sassPlugin } from 'esbuild-sass-plugin';
import inlineImage from 'esbuild-plugin-inline-image';

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
      options.drop = ['console'];
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
    terserOptions: {
      compress: { drop_console: true },
    },
    outExtension() {
      return {
        js: `.js`,
      };
    },
  },
]);
