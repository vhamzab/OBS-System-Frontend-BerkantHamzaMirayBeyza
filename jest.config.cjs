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
    'src/pages/auth/LoginPage.jsx',
    'src/pages/auth/RegisterPage.jsx',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
  ],
};
