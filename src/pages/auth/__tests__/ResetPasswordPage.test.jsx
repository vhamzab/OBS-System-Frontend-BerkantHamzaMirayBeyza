import { render, screen } from '@testing-library/react';

jest.mock('../../../services/authService', () => ({
  __esModule: true,
  default: {
    resetPassword: jest.fn().mockResolvedValue({ success: true }),
  },
}));

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
  useParams: () => ({ token: 'test-token' }),
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import ResetPasswordPage from '../ResetPasswordPage';

describe('ResetPasswordPage', () => {
  it('renders page title', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByText('Yeni Şifre Belirle')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByRole('button', { name: /Şifreyi Sıfırla/i })).toBeInTheDocument();
  });

  it('renders password inputs', () => {
    render(<ResetPasswordPage />);
    const inputs = screen.getAllByPlaceholderText('••••••••');
    expect(inputs.length).toBe(2);
  });

  it('renders password requirements', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByText(/Şifre gereksinimleri/i)).toBeInTheDocument();
  });
});
