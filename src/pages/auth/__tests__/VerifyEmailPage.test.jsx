import { render, screen } from '@testing-library/react';

jest.mock('../../../services/authService', () => ({
  __esModule: true,
  default: {
    verifyEmail: jest.fn().mockImplementation(() => new Promise(() => {})),
  },
}));

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
  useParams: () => ({ token: 'test-token' }),
}));

import VerifyEmailPage from '../VerifyEmailPage';

describe('VerifyEmailPage', () => {
  it('renders loading spinner', () => {
    const { container } = render(<VerifyEmailPage />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders page title', () => {
    render(<VerifyEmailPage />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
