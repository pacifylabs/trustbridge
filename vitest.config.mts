import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

/**
 * Vitest is used for unit and component tests.
 *
 * Chosen over Jest because it runs TypeScript and ESM natively with no
 * transform configuration, and shares Vite's resolver, so the `@/` alias and
 * the project's module graph behave the same way they do in the app.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    css: false,
    restoreMocks: true,
    clearMocks: true,
    // Comfortably above the slowest suite, so a busy machine cannot turn a
    // passing test into a failing one.
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
