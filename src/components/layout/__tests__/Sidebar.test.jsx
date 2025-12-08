import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../Sidebar';

// Mock useAuth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  NavLink: ({ children, to, onClick }) => (
    <a href={to} onClick={onClick}>{children}</a>
  ),
}));

import { useAuth } from '../../../context/AuthContext';

describe('Sidebar - Student', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: {
        role: 'student',
      },
    });
  });

  it('should render student navigation links', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.getByText('Derslerim')).toBeInTheDocument();
    expect(screen.getByText('Ders Programı')).toBeInTheDocument();
    expect(screen.getByText('Notlarım')).toBeInTheDocument();
  });

  it('should call onClose when clicking a link', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />);
    
    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onClose when clicking overlay', () => {
    const { container } = render(<Sidebar isOpen={true} onClose={mockOnClose} />);
    
    const overlay = container.querySelector('.fixed.inset-0');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('should have translate class when closed', () => {
    const { container } = render(<Sidebar isOpen={false} onClose={mockOnClose} />);
    
    const aside = container.querySelector('aside');
    expect(aside).toHaveClass('-translate-x-full');
  });

  it('should not have translate class when open on mobile', () => {
    const { container } = render(<Sidebar isOpen={true} onClose={mockOnClose} />);
    
    const aside = container.querySelector('aside');
    expect(aside).not.toHaveClass('-translate-x-full');
  });
});

describe('Sidebar - Faculty', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: {
        role: 'faculty',
      },
    });
  });

  it('should render faculty navigation links', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.getByText('Derslerim')).toBeInTheDocument();
    expect(screen.getByText('Öğrenciler')).toBeInTheDocument();
    expect(screen.getByText('Yoklama')).toBeInTheDocument();
  });
});

describe('Sidebar - Admin', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: {
        role: 'admin',
      },
    });
  });

  it('should render admin navigation links', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Kullanıcılar')).toBeInTheDocument();
    expect(screen.getByText('Bölümler')).toBeInTheDocument();
    expect(screen.getByText('Dersler')).toBeInTheDocument();
    expect(screen.getByText('Ayarlar')).toBeInTheDocument();
  });
});

describe('Sidebar - No user', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: null,
    });
  });

  it('should render default student links when user is null', () => {
    render(<Sidebar isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Derslerim')).toBeInTheDocument();
  });
});
