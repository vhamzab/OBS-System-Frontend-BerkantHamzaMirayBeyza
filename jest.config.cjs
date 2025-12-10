module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/services/api$': '<rootDir>/src/services/__mocks__/api.js',
    '^../api$': '<rootDir>/src/services/__mocks__/api.js',
    '^../../services/api$': '<rootDir>/src/services/__mocks__/api.js',
    '^../../../services/api$': '<rootDir>/src/services/__mocks__/api.js',
    '^./api$': '<rootDir>/src/services/__mocks__/api.js',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [
    '**/__tests__/**/*.(js|jsx)',
    '**/*.(test|spec).(js|jsx)',
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/**/*.d.ts',
    '!src/**/index.js',
    '!src/**/__mocks__/**',
    '!src/services/api.js', // Mock edildiği için coverage'dan çıkarıyoruz
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
  ],
};

