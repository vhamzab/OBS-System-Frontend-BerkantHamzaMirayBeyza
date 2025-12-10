import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';

// Mock useAuth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Navigate: ({ to }) => <div data-testid="navigate">Redirecting to {to}</div>,
  useLocation: () => ({ pathname: '/test' }),
}));

// Mock LoadingSpinner
jest.mock('../../common/LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

import { useAuth } from '../../../context/AuthContext';

const TestChild = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading spinner when loading', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: true,
    });

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
  });

  it('should render children when authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', role: 'student' },
      loading: false,
    });

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to dashboard when role not authorized', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', role: 'student' },
      loading: false,
    });

    render(
      <ProtectedRoute roles={['admin']}>
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toHaveTextContent('/dashboard');
  });

  it('should allow access when role is authorized', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    render(
      <ProtectedRoute roles={['admin']}>
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should allow access when no roles specified', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', role: 'faculty' },
      loading: false,
    });

    render(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
