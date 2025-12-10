import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordPage from '../ForgotPasswordPage';

// Mock services
jest.mock('../../../services/authService', () => ({
  __esModule: true,
  default: {
    forgotPassword: jest.fn(),
  },
}));

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import authService from '../../../services/authService';

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render forgot password form', () => {
    render(<ForgotPasswordPage />);
    
    expect(screen.getByText('Şifremi Unuttum')).toBeInTheDocument();
  });

  it('should render email input', () => {
    render(<ForgotPasswordPage />);
    
    expect(screen.getByLabelText(/E-posta Adresi/i)).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<ForgotPasswordPage />);
    
    expect(screen.getByRole('button', { name: /Sıfırlama Bağlantısı Gönder/i })).toBeInTheDocument();
  });

  it('should render back to login link', () => {
    render(<ForgotPasswordPage />);
    
    expect(screen.getByText(/Giriş sayfasına dön/i)).toBeInTheDocument();
  });

  it('should allow typing in email field', () => {
    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText(/E-posta Adresi/i);
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    expect(emailInput).toHaveValue('test@test.com');
  });

  it('should submit form', async () => {
    authService.forgotPassword.mockResolvedValue({ success: true });
    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText(/E-posta Adresi/i);
    const submitButton = screen.getByRole('button', { name: /Sıfırlama Bağlantısı Gönder/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalled();
    });
  });
});
