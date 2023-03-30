import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    splitting: false,
    clean: true,
    dts: true,
    minify: true,
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
