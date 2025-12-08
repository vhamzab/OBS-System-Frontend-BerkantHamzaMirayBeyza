import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '../LoginPage';

const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null }),
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockResolvedValue({ success: true });
  });

  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Tekrar Hoş Geldiniz')).toBeInTheDocument();
  });

  it('renders email input', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/E-posta Adresi/i)).toBeInTheDocument();
  });

  it('renders password input', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/Şifre/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: /Giriş Yap/i })).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    render(<LoginPage />);
    expect(screen.getByText(/Şifremi unuttum/i)).toBeInTheDocument();
  });

  it('renders register link', () => {
    render(<LoginPage />);
    expect(screen.getByText('Kayıt Ol')).toBeInTheDocument();
  });

  it('renders demo credentials', () => {
    render(<LoginPage />);
    expect(screen.getByText(/Demo Hesaplar/i)).toBeInTheDocument();
  });

  it('renders remember me checkbox', () => {
    render(<LoginPage />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('allows typing in email field', () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/E-posta Adresi/i);
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    expect(emailInput).toHaveValue('test@test.com');
  });

  it('allows typing in password field', () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText(/Şifre/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput).toHaveValue('password123');
  });

  it('submits form with valid data', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/E-posta Adresi/i);
    const passwordInput = screen.getByLabelText(/Şifre/i);
    const submitButton = screen.getByRole('button', { name: /Giriş Yap/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
    });
  });

  it('navigates after successful login', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/E-posta Adresi/i);
    const passwordInput = screen.getByLabelText(/Şifre/i);
    const submitButton = screen.getByRole('button', { name: /Giriş Yap/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('handles login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Login failed'));
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/E-posta Adresi/i);
    const passwordInput = screen.getByLabelText(/Şifre/i);
    const submitButton = screen.getByRole('button', { name: /Giriş Yap/i });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });
});
