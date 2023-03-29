import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/analytics.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
});
