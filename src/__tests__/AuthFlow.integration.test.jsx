import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock services
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockLogout = jest.fn();

jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
    user: null,
    isAuthenticated: false,
    loading: false,
  }),
}));

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
}));

describe('Auth Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login to Dashboard Flow', () => {
    it('should complete full login flow successfully', async () => {
      mockLogin.mockResolvedValue({ success: true });

      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      // Fill in login form
      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /giriş yap/i });

      await userEvent.type(emailInput, 'student@university.edu');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('student@university.edu', 'Password123');
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should handle login failure gracefully', async () => {
      const toast = require('react-hot-toast');
      mockLogin.mockRejectedValue({
        response: { data: { message: 'Geçersiz kullanıcı adı veya şifre' } }
      });

      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /giriş yap/i });

      await userEvent.type(emailInput, 'wrong@email.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Geçersiz kullanıcı adı veya şifre');
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should validate email format before submission', async () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      await userEvent.type(emailInput, 'invalidemail');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText('Geçerli bir e-posta adresi giriniz')).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should require password field', async () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const submitButton = screen.getByRole('button', { name: /giriş yap/i });

      await userEvent.type(emailInput, 'test@university.edu');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Şifre zorunludur')).toBeInTheDocument();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('Register to Login Flow', () => {
    it('should complete full registration flow and redirect to login', async () => {
      const toast = require('react-hot-toast');
      mockRegister.mockResolvedValue({ success: true, message: 'Kayıt başarılı!' });

      render(
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      );

      // Fill in registration form
      const firstNameInput = screen.getByPlaceholderText('Adınız');
      const lastNameInput = screen.getByPlaceholderText('Soyadınız');
      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const roleSelect = screen.getByRole('combobox');
      const termsCheckbox = screen.getByRole('checkbox');

      await userEvent.type(firstNameInput, 'Yeni');
      await userEvent.type(lastNameInput, 'Kullanıcı');
      await userEvent.type(emailInput, 'yeni@university.edu');
      await userEvent.type(passwordInputs[0], 'Password123');
      await userEvent.type(passwordInputs[1], 'Password123');
      await userEvent.selectOptions(roleSelect, 'student');

      const studentNumberInput = await screen.findByPlaceholderText('20210001');
      await userEvent.type(studentNumberInput, '20230001');

      await userEvent.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Kayıt başarılı!');
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should handle duplicate email registration', async () => {
      const toast = require('react-hot-toast');
      mockRegister.mockRejectedValue({
        response: { data: { message: 'Bu e-posta adresi zaten kayıtlı' } }
      });

      render(
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      );

      // Fill form with existing email
      const firstNameInput = screen.getByPlaceholderText('Adınız');
      const lastNameInput = screen.getByPlaceholderText('Soyadınız');
      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const roleSelect = screen.getByRole('combobox');
      const termsCheckbox = screen.getByRole('checkbox');

      await userEvent.type(firstNameInput, 'Test');
      await userEvent.type(lastNameInput, 'User');
      await userEvent.type(emailInput, 'existing@university.edu');
      await userEvent.type(passwordInputs[0], 'Password123');
      await userEvent.type(passwordInputs[1], 'Password123');
      await userEvent.selectOptions(roleSelect, 'student');

      const studentNumberInput = await screen.findByPlaceholderText('20210001');
      await userEvent.type(studentNumberInput, '20230001');

      await userEvent.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Bu e-posta adresi zaten kayıtlı');
        expect(mockNavigate).not.toHaveBeenCalledWith('/login');
      });
    });

    it('should validate password requirements during registration', async () => {
      render(
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      );

      const passwordInputs = screen.getAllByPlaceholderText('••••••••');

      // Test weak password
      await userEvent.type(passwordInputs[0], 'weak');
      fireEvent.blur(passwordInputs[0]);

      await waitFor(() => {
        expect(screen.getByText('Şifre en az 8 karakter olmalıdır')).toBeInTheDocument();
      });
    });

    it('should validate password confirmation match', async () => {
      render(
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      );

      const passwordInputs = screen.getAllByPlaceholderText('••••••••');

      await userEvent.type(passwordInputs[0], 'Password123');
      await userEvent.type(passwordInputs[1], 'Password456');
      fireEvent.blur(passwordInputs[1]);

      await waitFor(() => {
        expect(screen.getByText('Şifreler eşleşmiyor')).toBeInTheDocument();
      });
    });
  });

  describe('Form Navigation', () => {
    it('should have link from login to register page', () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      const registerLink = screen.getByText('Kayıt Ol');
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('should have link from register to login page', () => {
      render(
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      );

      const loginLink = screen.getByText('Giriş Yap');
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should have forgot password link on login page', () => {
      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      const forgotPasswordLink = screen.getByText('Şifremi unuttum');
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });
  });

  describe('Student Registration Flow', () => {
    it('should show student number field when student role selected', async () => {
      render(
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      );

      const roleSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(roleSelect, 'student');

      await waitFor(() => {
        expect(screen.getByPlaceholderText('20210001')).toBeInTheDocument();
      });
    });

    it('should validate student number format', async () => {
      render(
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      );

      const roleSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(roleSelect, 'student');

      const studentNumberInput = await screen.findByPlaceholderText('20210001');
      await userEvent.type(studentNumberInput, 'abc');
      fireEvent.blur(studentNumberInput);

      await waitFor(() => {
        expect(screen.getByText('Geçerli bir öğrenci numarası giriniz')).toBeInTheDocument();
      });
    });
  });

  describe('Faculty Registration Flow', () => {
    it('should show employee number and title fields when faculty role selected', async () => {
      render(
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      );

      const roleSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(roleSelect, 'faculty');

      await waitFor(() => {
        expect(screen.getByPlaceholderText('AK0001')).toBeInTheDocument();
        expect(screen.getByText('Ünvan seçiniz')).toBeInTheDocument();
      });
    });

    it('should complete faculty registration successfully', async () => {
      mockRegister.mockResolvedValue({ success: true, message: 'Kayıt başarılı!' });

      render(
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      );

      const firstNameInput = screen.getByPlaceholderText('Adınız');
      const lastNameInput = screen.getByPlaceholderText('Soyadınız');
      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const roleSelect = screen.getByRole('combobox');
      const termsCheckbox = screen.getByRole('checkbox');

      await userEvent.type(firstNameInput, 'Prof. Test');
      await userEvent.type(lastNameInput, 'Faculty');
      await userEvent.type(emailInput, 'prof@university.edu');
      await userEvent.type(passwordInputs[0], 'Password123');
      await userEvent.type(passwordInputs[1], 'Password123');
      await userEvent.selectOptions(roleSelect, 'faculty');

      const employeeNumberInput = await screen.findByPlaceholderText('AK0001');
      await userEvent.type(employeeNumberInput, 'AK0001');

      await userEvent.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
          role: 'faculty',
          employeeNumber: 'AK0001',
        }));
      });
    });
  });

  describe('Error Handling', () => {
    it('should display network error message on login', async () => {
      const toast = require('react-hot-toast');
      mockLogin.mockRejectedValue(new Error('Network Error'));

      render(
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      );

      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /giriş yap/i });

      await userEvent.type(emailInput, 'test@university.edu');
      await userEvent.type(passwordInput, 'Password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Giriş yapılırken bir hata oluştu');
      });
    });

    it('should display network error message on registration', async () => {
      const toast = require('react-hot-toast');
      mockRegister.mockRejectedValue(new Error('Network Error'));

      render(
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      );

      const firstNameInput = screen.getByPlaceholderText('Adınız');
      const lastNameInput = screen.getByPlaceholderText('Soyadınız');
      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const roleSelect = screen.getByRole('combobox');
      const termsCheckbox = screen.getByRole('checkbox');

      await userEvent.type(firstNameInput, 'Test');
      await userEvent.type(lastNameInput, 'User');
      await userEvent.type(emailInput, 'test@university.edu');
      await userEvent.type(passwordInputs[0], 'Password123');
      await userEvent.type(passwordInputs[1], 'Password123');
      await userEvent.selectOptions(roleSelect, 'student');

      const studentNumberInput = await screen.findByPlaceholderText('20210001');
      await userEvent.type(studentNumberInput, '20230001');

      await userEvent.click(termsCheckbox);

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Kayıt olurken bir hata oluştu');
      });
    });
  });

  describe('Terms and Privacy', () => {
    it('should require terms acceptance before registration', async () => {
      render(
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      );

      const firstNameInput = screen.getByPlaceholderText('Adınız');
      const lastNameInput = screen.getByPlaceholderText('Soyadınız');
      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const roleSelect = screen.getByRole('combobox');

      await userEvent.type(firstNameInput, 'Test');
      await userEvent.type(lastNameInput, 'User');
      await userEvent.type(emailInput, 'test@university.edu');
      await userEvent.type(passwordInputs[0], 'Password123');
      await userEvent.type(passwordInputs[1], 'Password123');
      await userEvent.selectOptions(roleSelect, 'student');

      const studentNumberInput = await screen.findByPlaceholderText('20210001');
      await userEvent.type(studentNumberInput, '20230001');

      // Don't check terms checkbox

      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Kullanım koşullarını kabul etmelisiniz')).toBeInTheDocument();
      });

      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should have terms and privacy links', () => {
      render(
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      );

      expect(screen.getByText('Kullanım koşullarını')).toHaveAttribute('href', '/terms');
      expect(screen.getByText('gizlilik politikasını')).toHaveAttribute('href', '/privacy');
    });
  });
});




