import { render, screen } from '@testing-library/react';

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    register: jest.fn().mockResolvedValue({ success: true }),
  }),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import RegisterPage from '../RegisterPage';

describe('RegisterPage', () => {
  it('renders page title', () => {
    render(<RegisterPage />);
    expect(screen.getByText(/Hesap Oluştur/i)).toBeInTheDocument();
  });

  it('renders email placeholder', () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText(/ornek@university/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<RegisterPage />);
    expect(screen.getByRole('button', { name: /Kayıt Ol/i })).toBeInTheDocument();
  });

  it('renders login link', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Giriş Yap')).toBeInTheDocument();
  });

  it('renders student option', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Öğrenci')).toBeInTheDocument();
  });

  it('renders faculty option', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Öğretim Üyesi')).toBeInTheDocument();
  });

  it('renders form inputs', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/E-posta/i)).toBeInTheDocument();
  });
});
