import '@testing-library/jest-dom';

// Mock import.meta for Vite
global.import = {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:5000/api/v1',
    },
  },
};

// Suppress React Router future flag warnings in tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('React Router Future Flag Warning')
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Suppress act(...) warnings that are expected in async tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: An update to') ||
     args[0].includes('inside a test was not wrapped in act'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
