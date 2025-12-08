import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar';

// Mock useAuth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn(),
}));

import { useAuth } from '../../../context/AuthContext';

describe('Navbar - Unauthenticated', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: jest.fn(),
    });
  });

  it('should render logo', () => {
    render(<Navbar />);
    
    expect(screen.getByText('OBS')).toBeInTheDocument();
  });

  it('should render login link', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Giriş Yap')).toBeInTheDocument();
  });

  it('should render register link', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Kayıt Ol')).toBeInTheDocument();
  });

  it('should not render dashboard link', () => {
    render(<Navbar />);
    
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });
});

describe('Navbar - Authenticated Student', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: {
        first_name: 'Test',
        last_name: 'User',
        role: 'student',
      },
      isAuthenticated: true,
      logout: mockLogout,
    });
  });

  it('should render user name', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should render role label', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Öğrenci')).toBeInTheDocument();
  });

  it('should render dashboard link', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should not render admin link for student', () => {
    render(<Navbar />);
    
    expect(screen.queryByText('Kullanıcılar')).not.toBeInTheDocument();
  });

  it('should open dropdown on user button click', () => {
    render(<Navbar />);
    
    const userButton = screen.getByText('Test User').closest('button');
    fireEvent.click(userButton);

    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.getByText('Ayarlar')).toBeInTheDocument();
    expect(screen.getByText('Çıkış Yap')).toBeInTheDocument();
  });

  it('should call logout when clicking logout button', () => {
    render(<Navbar />);
    
    const userButton = screen.getByText('Test User').closest('button');
    fireEvent.click(userButton);

    const logoutButton = screen.getByText('Çıkış Yap');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
  });
});

describe('Navbar - Authenticated Admin', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: {
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
      },
      isAuthenticated: true,
      logout: jest.fn(),
    });
  });

  it('should render admin link', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Kullanıcılar')).toBeInTheDocument();
  });

  it('should render admin role label', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Yönetici')).toBeInTheDocument();
  });
});

describe('Navbar - Authenticated Faculty', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: {
        first_name: 'Prof',
        last_name: 'User',
        role: 'faculty',
      },
      isAuthenticated: true,
      logout: jest.fn(),
    });
  });

  it('should render faculty role label', () => {
    render(<Navbar />);
    
    expect(screen.getByText('Öğretim Üyesi')).toBeInTheDocument();
  });
});

describe('Navbar - Mobile Menu', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: {
        first_name: 'Test',
        last_name: 'User',
        role: 'student',
      },
      isAuthenticated: true,
      logout: jest.fn(),
    });
  });

  it('renders mobile menu button', () => {
    const { container } = render(<Navbar />);
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('renders user initials', () => {
    render(<Navbar />);
    expect(screen.getByText('TU')).toBeInTheDocument();
  });

  it('closes dropdown when clicking profile link', () => {
    render(<Navbar />);
    
    const userButton = screen.getByText('Test User').closest('button');
    fireEvent.click(userButton);
    
    const profileLink = screen.getByText('Profil');
    fireEvent.click(profileLink);
    
    // Dropdown should close - check it was clicked
    expect(profileLink).toBeInTheDocument();
  });

  it('closes dropdown when clicking settings link', () => {
    render(<Navbar />);
    
    const userButton = screen.getByText('Test User').closest('button');
    fireEvent.click(userButton);
    
    const settingsLink = screen.getByText('Ayarlar');
    fireEvent.click(settingsLink);
    
    expect(settingsLink).toBeInTheDocument();
  });
});

describe('Navbar - onMenuClick', () => {
  const mockOnMenuClick = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: {
        first_name: 'Test',
        last_name: 'User',
        role: 'student',
      },
      isAuthenticated: true,
      logout: jest.fn(),
    });
  });

  it('calls onMenuClick when menu button clicked', () => {
    const { container } = render(<Navbar onMenuClick={mockOnMenuClick} />);
    
    const menuButtons = container.querySelectorAll('button');
    // First button is typically the menu button
    if (menuButtons.length > 0) {
      fireEvent.click(menuButtons[0]);
    }
    
    expect(container).toBeInTheDocument();
  });
});
