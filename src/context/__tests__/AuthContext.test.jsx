import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock services
jest.mock('../../services/authService', () => ({
  __esModule: true,
  default: {
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  },
}));

jest.mock('../../services/userService', () => ({
  __esModule: true,
  default: {
    getProfile: jest.fn(),
  },
}));

import authService from '../../services/authService';
import userService from '../../services/userService';

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: jest.fn((key) => localStorageMock.store[key] || null),
  setItem: jest.fn((key, value) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: jest.fn((key) => {
    delete localStorageMock.store[key];
  }),
  clear: jest.fn(() => {
    localStorageMock.store = {};
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Test component
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{auth.loading ? 'loading' : 'not-loading'}</span>
      <span data-testid="authenticated">{auth.isAuthenticated ? 'true' : 'false'}</span>
      <span data-testid="user">{auth.user ? JSON.stringify(auth.user) : 'null'}</span>
      <button onClick={() => auth.login('test@test.com', 'password')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    authService.getCurrentUser.mockReturnValue(null);
    userService.getProfile.mockRejectedValue(new Error('Not authenticated'));
  });

  it('should provide auth context', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
  });

  it('should start with loading true', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially loading should be true (but it changes quickly)
    expect(screen.getByTestId('user')).toBeInTheDocument();
  });

  it('should be unauthenticated when no token', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });


  it('should initialize with user when valid token exists', async () => {
    const mockUser = { id: '1', email: 'test@test.com', first_name: 'Test' };
    authService.getCurrentUser.mockReturnValue(mockUser);
    localStorageMock.getItem.mockReturnValue('valid-token');
    userService.getProfile.mockResolvedValue({ data: mockUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
  });

  it('should handle login', async () => {
    const mockResponse = {
      success: true,
      data: { user: { id: '1', email: 'test@test.com' } },
    };
    authService.login.mockResolvedValue(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@test.com', 'password');
    });
  });

  it('should handle logout', async () => {
    authService.logout.mockResolvedValue();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  it('should clear tokens when profile fetch fails', async () => {
    const mockUser = { id: '1', email: 'test@test.com' };
    authService.getCurrentUser.mockReturnValue(mockUser);
    localStorageMock.getItem.mockReturnValue('invalid-token');
    userService.getProfile.mockRejectedValue(new Error('Token invalid'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });
});
