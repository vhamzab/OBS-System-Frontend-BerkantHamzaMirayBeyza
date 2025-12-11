import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../RegisterPage';

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
}));

// Mock AuthContext
const mockRegister = jest.fn();
jest.mock('../../../context/AuthContext', () => ({
  ...jest.requireActual('../../../context/AuthContext'),
  useAuth: () => ({
    register: mockRegister,
    user: null,
    isAuthenticated: false,
    loading: false,
  }),
}));

const renderRegisterPage = () => {
  return render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>
  );
};

describe('RegisterPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render register form correctly', () => {
      renderRegisterPage();
      
      expect(screen.getByText('Hesap Oluşturun')).toBeInTheDocument();
      expect(screen.getByText("Üniversite OBS'ye kayıt olun")).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /kayıt ol/i })).toBeInTheDocument();
    });

    it('should render first name input field', () => {
      renderRegisterPage();
      
      const firstNameInput = screen.getByPlaceholderText('Adınız');
      expect(firstNameInput).toBeInTheDocument();
      expect(firstNameInput).toHaveAttribute('name', 'firstName');
    });

    it('should render last name input field', () => {
      renderRegisterPage();
      
      const lastNameInput = screen.getByPlaceholderText('Soyadınız');
      expect(lastNameInput).toBeInTheDocument();
      expect(lastNameInput).toHaveAttribute('name', 'lastName');
    });

    it('should render email input field', () => {
      renderRegisterPage();
      
      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
    });

    it('should render password input fields', () => {
      renderRegisterPage();
      
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      expect(passwordInputs).toHaveLength(2);
      expect(passwordInputs[0]).toHaveAttribute('name', 'password');
      expect(passwordInputs[1]).toHaveAttribute('name', 'confirmPassword');
    });

    it('should render role select field', () => {
      renderRegisterPage();
      
      expect(screen.getByText('Kullanıcı tipi seçiniz')).toBeInTheDocument();
    });

    it('should render terms checkbox', () => {
      renderRegisterPage();
      
      expect(screen.getByText(/kullanım koşullarını/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render login link', () => {
      renderRegisterPage();
      
      expect(screen.getByText('Giriş Yap')).toBeInTheDocument();
      expect(screen.getByText(/zaten hesabınız var mı/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderRegisterPage();
      
      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Role Selection', () => {
    it('should show student number field when student role is selected', async () => {
      renderRegisterPage();
      
      const roleSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(roleSelect, 'student');
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('20210001')).toBeInTheDocument();
      });
    });

    it('should show employee number and title fields when faculty role is selected', async () => {
      renderRegisterPage();
      
      const roleSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(roleSelect, 'faculty');
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('AK0001')).toBeInTheDocument();
        expect(screen.getByText('Ünvan seçiniz')).toBeInTheDocument();
      });
    });

    it('should hide student number field when switching from student to faculty', async () => {
      renderRegisterPage();
      
      const roleSelect = screen.getByRole('combobox');
      
      // Select student first
      await userEvent.selectOptions(roleSelect, 'student');
      await waitFor(() => {
        expect(screen.getByPlaceholderText('20210001')).toBeInTheDocument();
      });
      
      // Switch to faculty
      await userEvent.selectOptions(roleSelect, 'faculty');
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('20210001')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error when first name is empty', async () => {
      renderRegisterPage();
      
      const firstNameInput = screen.getByPlaceholderText('Adınız');
      fireEvent.blur(firstNameInput);
      
      await waitFor(() => {
        expect(screen.getByText('Ad zorunludur')).toBeInTheDocument();
      });
    });

    it('should show error when first name is too short', async () => {
      renderRegisterPage();
      
      const firstNameInput = screen.getByPlaceholderText('Adınız');
      await userEvent.type(firstNameInput, 'A');
      fireEvent.blur(firstNameInput);
      
      await waitFor(() => {
        expect(screen.getByText('Ad en az 2 karakter olmalıdır')).toBeInTheDocument();
      });
    });

    it('should show error when last name is empty', async () => {
      renderRegisterPage();
      
      const lastNameInput = screen.getByPlaceholderText('Soyadınız');
      fireEvent.blur(lastNameInput);
      
      await waitFor(() => {
        expect(screen.getByText('Soyad zorunludur')).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      renderRegisterPage();
      
      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      await userEvent.type(emailInput, 'invalid-email');
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(screen.getByText('Geçerli bir e-posta adresi giriniz')).toBeInTheDocument();
      });
    });

    it('should show error for weak password - missing uppercase', async () => {
      renderRegisterPage();
      
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      await userEvent.type(passwordInputs[0], 'password123');
      fireEvent.blur(passwordInputs[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Şifre en az bir büyük harf içermelidir')).toBeInTheDocument();
      });
    });

    it('should show error for weak password - missing lowercase', async () => {
      renderRegisterPage();
      
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      await userEvent.type(passwordInputs[0], 'PASSWORD123');
      fireEvent.blur(passwordInputs[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Şifre en az bir küçük harf içermelidir')).toBeInTheDocument();
      });
    });

    it('should show error for weak password - missing number', async () => {
      renderRegisterPage();
      
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      await userEvent.type(passwordInputs[0], 'PasswordABC');
      fireEvent.blur(passwordInputs[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Şifre en az bir rakam içermelidir')).toBeInTheDocument();
      });
    });

    it('should show error for short password', async () => {
      renderRegisterPage();
      
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      await userEvent.type(passwordInputs[0], 'Pass1');
      fireEvent.blur(passwordInputs[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Şifre en az 8 karakter olmalıdır')).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      renderRegisterPage();
      
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      await userEvent.type(passwordInputs[0], 'Password123');
      await userEvent.type(passwordInputs[1], 'Password456');
      fireEvent.blur(passwordInputs[1]);
      
      await waitFor(() => {
        expect(screen.getByText('Şifreler eşleşmiyor')).toBeInTheDocument();
      });
    });

    it('should show error when role is not selected', async () => {
      renderRegisterPage();
      
      const roleSelect = screen.getByRole('combobox');
      fireEvent.blur(roleSelect);
      
      await waitFor(() => {
        expect(screen.getByText('Kullanıcı tipi zorunludur')).toBeInTheDocument();
      });
    });

    it('should show error for invalid student number', async () => {
      renderRegisterPage();
      
      const roleSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(roleSelect, 'student');
      
      const studentNumberInput = await screen.findByPlaceholderText('20210001');
      await userEvent.type(studentNumberInput, '123');
      fireEvent.blur(studentNumberInput);
      
      await waitFor(() => {
        expect(screen.getByText('Geçerli bir öğrenci numarası giriniz')).toBeInTheDocument();
      });
    });

    it('should accept valid student number', async () => {
      renderRegisterPage();
      
      const roleSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(roleSelect, 'student');
      
      const studentNumberInput = await screen.findByPlaceholderText('20210001');
      await userEvent.type(studentNumberInput, '20210001');
      fireEvent.blur(studentNumberInput);
      
      await waitFor(() => {
        expect(screen.queryByText('Geçerli bir öğrenci numarası giriniz')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const fillValidStudentForm = async () => {
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
      await userEvent.type(studentNumberInput, '20210001');
      
      await userEvent.click(termsCheckbox);
    };

    it('should call register function with correct data on submit', async () => {
      mockRegister.mockResolvedValue({ success: true, message: 'Kayıt başarılı!' });
      renderRegisterPage();
      
      await fillValidStudentForm();
      
      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@university.edu',
          password: 'Password123',
          confirmPassword: 'Password123',
          role: 'student',
          studentNumber: '20210001',
          terms: true,
        }));
      });
    });

    it('should navigate to login on successful registration', async () => {
      mockRegister.mockResolvedValue({ success: true, message: 'Kayıt başarılı!' });
      renderRegisterPage();
      
      await fillValidStudentForm();
      
      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('should show success toast on successful registration', async () => {
      const toast = require('react-hot-toast');
      mockRegister.mockResolvedValue({ success: true, message: 'Kayıt başarılı!' });
      renderRegisterPage();
      
      await fillValidStudentForm();
      
      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Kayıt başarılı!');
      });
    });

    it('should show error toast on failed registration', async () => {
      const toast = require('react-hot-toast');
      mockRegister.mockRejectedValue({
        response: { data: { message: 'Bu e-posta adresi zaten kayıtlı' } }
      });
      renderRegisterPage();
      
      await fillValidStudentForm();
      
      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Bu e-posta adresi zaten kayıtlı');
      });
    });

    it('should show generic error message when no specific error provided', async () => {
      const toast = require('react-hot-toast');
      mockRegister.mockRejectedValue(new Error('Network error'));
      renderRegisterPage();
      
      await fillValidStudentForm();
      
      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Kayıt olurken bir hata oluştu');
      });
    });

    it('should not submit form without accepting terms', async () => {
      renderRegisterPage();
      
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
      await userEvent.type(studentNumberInput, '20210001');
      
      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Kullanım koşullarını kabul etmelisiniz')).toBeInTheDocument();
      });
      
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should allow typing in all form fields', async () => {
      renderRegisterPage();
      
      const firstNameInput = screen.getByPlaceholderText('Adınız');
      const lastNameInput = screen.getByPlaceholderText('Soyadınız');
      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      
      await userEvent.type(firstNameInput, 'Test');
      await userEvent.type(lastNameInput, 'User');
      await userEvent.type(emailInput, 'test@test.com');
      
      expect(firstNameInput).toHaveValue('Test');
      expect(lastNameInput).toHaveValue('User');
      expect(emailInput).toHaveValue('test@test.com');
    });

    it('should allow selecting role from dropdown', async () => {
      renderRegisterPage();
      
      const roleSelect = screen.getByRole('combobox');
      await userEvent.selectOptions(roleSelect, 'student');
      
      expect(roleSelect).toHaveValue('student');
    });

    it('should allow checking terms checkbox', async () => {
      renderRegisterPage();
      
      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);
      
      expect(checkbox).toBeChecked();
    });

    it('should allow unchecking terms checkbox', async () => {
      renderRegisterPage();
      
      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);
      await userEvent.click(checkbox);
      
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Loading State', () => {
    it('should disable submit button during form submission', async () => {
      mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));
      renderRegisterPage();
      
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
      await userEvent.type(studentNumberInput, '20210001');
      
      await userEvent.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Navigation Links', () => {
    it('should have correct href for login link', () => {
      renderRegisterPage();
      
      const loginLink = screen.getByText('Giriş Yap');
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should have correct href for terms link', () => {
      renderRegisterPage();
      
      const termsLink = screen.getByText('Kullanım koşullarını');
      expect(termsLink).toHaveAttribute('href', '/terms');
    });

    it('should have correct href for privacy link', () => {
      renderRegisterPage();
      
      const privacyLink = screen.getByText('gizlilik politikasını');
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });
  });

  describe('Faculty Registration', () => {
    it('should register faculty member with employee number and title', async () => {
      mockRegister.mockResolvedValue({ success: true, message: 'Kayıt başarılı!' });
      renderRegisterPage();
      
      const firstNameInput = screen.getByPlaceholderText('Adınız');
      const lastNameInput = screen.getByPlaceholderText('Soyadınız');
      const emailInput = screen.getByPlaceholderText('ornek@university.edu');
      const passwordInputs = screen.getAllByPlaceholderText('••••••••');
      const roleSelect = screen.getByRole('combobox');
      const termsCheckbox = screen.getByRole('checkbox');
      
      await userEvent.type(firstNameInput, 'Dr. Test');
      await userEvent.type(lastNameInput, 'Faculty');
      await userEvent.type(emailInput, 'faculty@university.edu');
      await userEvent.type(passwordInputs[0], 'Password123');
      await userEvent.type(passwordInputs[1], 'Password123');
      await userEvent.selectOptions(roleSelect, 'faculty');
      
      const employeeNumberInput = await screen.findByPlaceholderText('AK0001');
      await userEvent.type(employeeNumberInput, 'AK0001');
      
      // Select title
      const titleSelect = screen.getAllByRole('combobox')[1];
      await userEvent.selectOptions(titleSelect, 'professor');
      
      await userEvent.click(termsCheckbox);
      
      const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
          firstName: 'Dr. Test',
          lastName: 'Faculty',
          email: 'faculty@university.edu',
          role: 'faculty',
          employeeNumber: 'AK0001',
          title: 'professor',
        }));
      });
    });
  });
});


