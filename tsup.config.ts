import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true,
  },
  {
    entry: ['src/analytics.ts'],
    format: ['iife'],
    outExtension({}) {
      return {
        js: `.js`,
      };
    },
  },
]);
