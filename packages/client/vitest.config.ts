import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    root: 'src/tests/',
    globals: true,
    include: ['**/*.test.ts', '**/*.spec.ts'],
    coverage: {
      all: false,
      include: ['src/**/*.ts'],
      reporter: ['text', 'json', 'html'],
      reportOnFailure: true,
    },
  },
});
