import { render, screen } from '@testing-library/react';
import PublicRoute from '../PublicRoute';

// Mock useAuth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Navigate: ({ to }) => <div data-testid="navigate">Redirecting to {to}</div>,
  useLocation: () => ({ pathname: '/login', state: null }),
}));

// Mock LoadingSpinner
jest.mock('../../common/LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

import { useAuth } from '../../../context/AuthContext';

const TestChild = () => <div>Public Content</div>;

describe('PublicRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading spinner when loading', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
    });

    render(
      <PublicRoute>
        <TestChild />
      </PublicRoute>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render children when not authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
    });

    render(
      <PublicRoute>
        <TestChild />
      </PublicRoute>
    );

    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });

  it('should redirect to dashboard when authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });

    render(
      <PublicRoute>
        <TestChild />
      </PublicRoute>
    );

    expect(screen.getByTestId('navigate')).toHaveTextContent('/dashboard');
  });
});
