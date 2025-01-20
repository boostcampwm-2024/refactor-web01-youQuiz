import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [tsconfigPaths(), react(), svgr()],
  test: {
    globals: true,
    include: ['**/*.test.tsx', '**/*.spec.ts'],
    environment: 'jsdom',
    coverage: {
      all: false,
      include: ['src/**/*.ts'],
      reporter: ['text', 'json', 'html'],
      reportOnFailure: true,
    },
  },
});
