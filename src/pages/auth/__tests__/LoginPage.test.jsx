import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { AuthProvider } from '../../../context/AuthContext';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
}));

// Mock AuthContext
const mockLogin = jest.fn();
jest.mock('../../../context/AuthContext', () => ({
  ...jest.requireActual('../../../context/AuthContext'),
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAuthenticated: false,
    loading: false,
  }),
}));

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form correctly', () => {
      renderLoginPage();

      expect(screen.getByText('Tekrar Hoş Geldiniz')).toBeInTheDocument();
      expect(screen.getByText('Hesabınıza giriş yapın')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('ornek@university.edu')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
    });

    it('should render email input field', () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
    });

    it('should render password input field', () => {
      renderLoginPage();

      const passwordInput = screen.getByPlaceholderText('••••••••');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('name', 'password');
    });

    it('should render remember me checkbox', () => {
      renderLoginPage();

      expect(screen.getByText('Beni hatırla')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      renderLoginPage();

      expect(screen.getByText('Şifremi unuttum')).toBeInTheDocument();
    });

    it('should render register link', () => {
      renderLoginPage();

      expect(screen.getByText('Kayıt Ol')).toBeInTheDocument();
      expect(screen.getByText(/hesabınız yok mu/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /giriş yap/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('E-posta adresi zorunludur')).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      await userEvent.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('Geçerli bir e-posta adresi giriniz')).toBeInTheDocument();
      });
    });

    it('should show error when password is empty', async () => {
      renderLoginPage();

      const passwordInput = screen.getByPlaceholderText('••••••••');
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText('Şifre zorunludur')).toBeInTheDocument();
      });
    });

    it('should not show errors for valid input', async () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInput = screen.getByPlaceholderText('••••••••');

      await userEvent.type(emailInput, 'test@university.edu');
      await userEvent.type(passwordInput, 'Password123');

      fireEvent.blur(emailInput);
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.queryByText('E-posta adresi zorunludur')).not.toBeInTheDocument();
        expect(screen.queryByText('Şifre zorunludur')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call login function with correct credentials on submit', async () => {
      mockLogin.mockResolvedValue({ success: true });
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /giriş yap/i });

      await userEvent.type(emailInput, 'test@university.edu');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@university.edu', 'Password123');
      });
    });

    it('should navigate to dashboard on successful login', async () => {
      mockLogin.mockResolvedValue({ success: true });
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /giriş yap/i });

      await userEvent.type(emailInput, 'test@university.edu');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should show success toast on successful login', async () => {
      const toast = require('react-hot-toast');
      mockLogin.mockResolvedValue({ success: true });
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /giriş yap/i });

      await userEvent.type(emailInput, 'test@university.edu');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Giriş başarılı!');
      });
    });

    it('should show error toast when login returns success: false', async () => {
      const toast = require('react-hot-toast');
      mockLogin.mockResolvedValue({ success: false, message: 'Custom error message' });
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /giriş yap/i });

      await userEvent.type(emailInput, 'test@university.edu');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Custom error message');
      });
    });

    it('should handle 401 error specifically', async () => {
      const toast = require('react-hot-toast');
      const error = new Error('Auth error');
      error.response = { status: 401 };
      mockLogin.mockRejectedValue(error);

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /giriş yap/i });

      await userEvent.type(emailInput, 'test@university.edu');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('E-posta veya şifre hatalı');
      });
    });

    it('should handle network error (status 0)', async () => {
      const toast = require('react-hot-toast');
      const error = new Error('Network error');
      error.response = { status: 0 };
      mockLogin.mockRejectedValue(error);

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /giriş yap/i });

      await userEvent.type(emailInput, 'test@university.edu');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      });
    });

    it('should show generic error message when no specific error provided', async () => {
      const toast = require('react-hot-toast');
      const error = new Error('Unknown error');
      // No response object
      mockLogin.mockRejectedValue(error);

      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /giriş yap/i });

      await userEvent.type(emailInput, 'test@university.edu');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        // Should fallback to error.message or generic
        expect(toast.error).toHaveBeenCalledWith('Unknown error');
      });
    });

    it('should not submit form with validation errors', async () => {
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /giriş yap/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).not.toHaveBeenCalled();
      });
    });
  });

  describe('User Interactions', () => {
    it('should allow typing in email field', async () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      await userEvent.type(emailInput, 'test@test.com');

      expect(emailInput).toHaveValue('test@test.com');
    });

    it('should allow typing in password field', async () => {
      renderLoginPage();

      const passwordInput = screen.getByPlaceholderText('••••••••');
      await userEvent.type(passwordInput, 'mypassword');

      expect(passwordInput).toHaveValue('mypassword');
    });

    it('should allow checking remember me checkbox', async () => {
      renderLoginPage();

      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('should clear validation error when user starts typing', async () => {
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('E-posta adresi zorunludur')).toBeInTheDocument();
      });

      await userEvent.type(emailInput, 'test@test.com');

      await waitFor(() => {
        expect(screen.queryByText('E-posta adresi zorunludur')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable submit button during form submission', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
      renderLoginPage();

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /giriş yap/i });

      await userEvent.type(emailInput, 'test@university.edu');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.click(submitButton);

      // Button should be in loading state
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Navigation Links', () => {
    it('should have correct href for forgot password link', () => {
      renderLoginPage();

      const forgotPasswordLink = screen.getByText('Şifremi unuttum');
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });

    it('should have correct href for register link', () => {
      renderLoginPage();

      const registerLink = screen.getByText('Kayıt Ol');
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });
});




