/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Load only VITE_-prefixed variables from .env.{mode} into `env`
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  /**
   * Typed config object injected as the `__APP_CONFIG__` global.
   * Add further VITE_ keys here as the project grows — each will be
   * tree-shaken by Vite for bundles that don't reference them.
   */
  const appConfig = {
    APP_ENV: env.VITE_APP_ENV ?? mode,
  } satisfies Record<string, string>;

  return {
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    __APP_CONFIG__: JSON.stringify(appConfig),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: 'artifacts/coverage',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/**/*.test.*',
        'src/**/*.spec.*',
        'src/**/*.d.ts',
        'src/main.tsx',
      ],
    },
  },
  };
});
