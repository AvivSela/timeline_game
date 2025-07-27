module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/tests/**/*.ts',
    '!**/*.config.js',
    '!**/*.config.ts',
    '!**/postcss.config.js',
    '!**/tailwind.config.js',
    '!**/vite.config.ts',
    '!**/jest.config.js',
    '!**/tsconfig*.json',
    '!**/package.json',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 45,
      lines: 50,
      statements: 50,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  // Suppress console output during tests
  silent: true,
  verbose: false,
  // Test timeout for database operations
  testTimeout: 30000,
  // Setup test environment variables
  setupFiles: ['<rootDir>/src/tests/env-setup.ts'],
}; 