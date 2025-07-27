import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      exclude: [
        '**/*.config.js',
        '**/*.config.ts',
        '**/postcss.config.js',
        '**/tailwind.config.js',
        '**/vite.config.ts',
        '**/vitest.config.ts',
        '**/tsconfig*.json',
        '**/package.json',
        '**/node_modules/**',
        '**/coverage/**',
        '**/dist/**',
        '**/build/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
}) 