import { render, screen, fireEvent } from '@testing-library/react';
import Layout from '../Layout';

// Mock useAuth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock child components
jest.mock('../Navbar', () => {
  return function MockNavbar({ onMenuClick }) {
    return (
      <nav data-testid="navbar">
        <button onClick={onMenuClick} data-testid="menu-button">Menu</button>
      </nav>
    );
  };
});

jest.mock('../Sidebar', () => {
  return function MockSidebar({ isOpen, onClose }) {
    return (
      <aside data-testid="sidebar" data-open={isOpen}>
        <button onClick={onClose} data-testid="close-sidebar">Close</button>
      </aside>
    );
  };
});

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet">Page Content</div>,
}));

import { useAuth } from '../../../context/AuthContext';

describe('Layout', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
    });
  });

  it('should render navbar', () => {
    render(<Layout />);
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('should render outlet', () => {
    render(<Layout />);
    
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('should not render sidebar when withSidebar is false', () => {
    render(<Layout withSidebar={false} />);
    
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });

  it('should not render sidebar when not authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
    });

    render(<Layout withSidebar={true} />);
    
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });

  it('should render sidebar when authenticated and withSidebar is true', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
    });

    render(<Layout withSidebar={true} />);
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('should toggle sidebar when menu button clicked', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
    });

    render(<Layout withSidebar={true} />);
    
    const menuButton = screen.getByTestId('menu-button');
    const sidebar = screen.getByTestId('sidebar');

    // Initially closed
    expect(sidebar).toHaveAttribute('data-open', 'false');

    // Click to open
    fireEvent.click(menuButton);
    expect(sidebar).toHaveAttribute('data-open', 'true');

    // Click to close
    fireEvent.click(menuButton);
    expect(sidebar).toHaveAttribute('data-open', 'false');
  });

  it('should close sidebar when close button clicked', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
    });

    render(<Layout withSidebar={true} />);
    
    const menuButton = screen.getByTestId('menu-button');
    const closeButton = screen.getByTestId('close-sidebar');
    const sidebar = screen.getByTestId('sidebar');

    // Open sidebar
    fireEvent.click(menuButton);
    expect(sidebar).toHaveAttribute('data-open', 'true');

    // Close sidebar
    fireEvent.click(closeButton);
    expect(sidebar).toHaveAttribute('data-open', 'false');
  });

  it('should default withSidebar to false', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
    });

    render(<Layout />);
    
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });
});
