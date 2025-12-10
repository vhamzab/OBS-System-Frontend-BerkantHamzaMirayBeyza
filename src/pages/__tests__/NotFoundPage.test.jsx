import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from '../NotFoundPage';

const renderWithRouter = (component) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('NotFoundPage', () => {
  it('should render 404 message', () => {
    renderWithRouter(<NotFoundPage />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Sayfa Bulunamadı')).toBeInTheDocument();
  });

  it('should render description text', () => {
    renderWithRouter(<NotFoundPage />);
    expect(screen.getByText(/Aradığınız sayfa mevcut değil/i)).toBeInTheDocument();
  });

  it('should render home link', () => {
    renderWithRouter(<NotFoundPage />);
    const homeLink = screen.getByText('Ana Sayfaya Git');
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('should render back button', () => {
    renderWithRouter(<NotFoundPage />);
    const backButton = screen.getByText('Geri Dön');
    expect(backButton).toBeInTheDocument();
    expect(backButton.tagName).toBe('BUTTON');
  });

  it('should call window.history.back when back button clicked', () => {
    const historyBack = jest.fn();
    const originalBack = window.history.back;
    window.history.back = historyBack;

    renderWithRouter(<NotFoundPage />);
    const backButton = screen.getByText('Geri Dön');
    
    fireEvent.click(backButton);
    expect(historyBack).toHaveBeenCalled();

    // Restore original
    window.history.back = originalBack;
  });

  it('should have proper styling classes', () => {
    const { container } = renderWithRouter(<NotFoundPage />);
    expect(container.querySelector('.min-h-screen')).toBeInTheDocument();
  });

  it('should display home icon in link', () => {
    renderWithRouter(<NotFoundPage />);
    const homeLink = screen.getByText('Ana Sayfaya Git').closest('a');
    expect(homeLink.querySelector('svg')).toBeInTheDocument();
  });
});
