import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock all page components
jest.mock('../components/layout/Layout', () => {
  return function MockLayout() {
    return <div data-testid="layout">Layout</div>;
  };
});

jest.mock('../components/auth/ProtectedRoute', () => {
  return function MockProtectedRoute({ children }) {
    return <div data-testid="protected-route">{children}</div>;
  };
});

jest.mock('../components/auth/PublicRoute', () => {
  return function MockPublicRoute({ children }) {
    return <div data-testid="public-route">{children}</div>;
  };
});

jest.mock('../pages/auth/LoginPage', () => {
  return function MockLoginPage() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('../pages/auth/RegisterPage', () => {
  return function MockRegisterPage() {
    return <div data-testid="register-page">Register Page</div>;
  };
});

jest.mock('../pages/auth/ForgotPasswordPage', () => {
  return function MockForgotPasswordPage() {
    return <div data-testid="forgot-password-page">Forgot Password Page</div>;
  };
});

jest.mock('../pages/auth/ResetPasswordPage', () => {
  return function MockResetPasswordPage() {
    return <div data-testid="reset-password-page">Reset Password Page</div>;
  };
});

jest.mock('../pages/auth/VerifyEmailPage', () => {
  return function MockVerifyEmailPage() {
    return <div data-testid="verify-email-page">Verify Email Page</div>;
  };
});

jest.mock('../pages/dashboard/DashboardPage', () => {
  return function MockDashboardPage() {
    return <div data-testid="dashboard-page">Dashboard Page</div>;
  };
});

jest.mock('../pages/profile/ProfilePage', () => {
  return function MockProfilePage() {
    return <div data-testid="profile-page">Profile Page</div>;
  };
});

jest.mock('../pages/NotFoundPage', () => {
  return function MockNotFoundPage() {
    return <div data-testid="not-found-page">404 Page</div>;
  };
});

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }) => element,
}));

describe('App Component', () => {
  it('should render without crashing', () => {
    render(<App />);
    
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  it('should have routes defined', () => {
    render(<App />);
    
    // App renders Routes component
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });
});
