import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    clean: true,
    dts: true,
    format: ['esm'],
    minify: true,
    loader: {
      '.js': 'jsx',
    },
    outExtension() {
      return {
        js: `.js`,
      };
    },
  },
  {
    entry: ['src/analytics.ts'],
    minify: true,
    format: ['iife'],
    outExtension() {
      return {
        js: `.js`,
      };
    },
  },
]);
