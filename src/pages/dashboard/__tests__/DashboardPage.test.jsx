import { render, screen } from '@testing-library/react';
import DashboardPage from '../DashboardPage';

// Mock useAuth hook
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '../../../context/AuthContext';

describe('DashboardPage - Student', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: {
        id: '1',
        first_name: 'Mehmet',
        role: 'student',
      },
    });
  });

  it('should render welcome message', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Mehmet')).toBeInTheDocument();
  });

  it('should display student stats', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Aktif Dersler')).toBeInTheDocument();
    expect(screen.getByText('Bugünkü Dersler')).toBeInTheDocument();
    expect(screen.getByText(/Genel Not Ort/i)).toBeInTheDocument();
  });

  it('should display student quick actions', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Ders Kaydı')).toBeInTheDocument();
    expect(screen.getByText('Ders Programı')).toBeInTheDocument();
    expect(screen.getByText('Notlarım')).toBeInTheDocument();
    expect(screen.getByText('Duyurular')).toBeInTheDocument();
  });

  it('should render quick actions section', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Hızlı İşlemler')).toBeInTheDocument();
  });

  it('should render recent activity section', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Son Aktiviteler')).toBeInTheDocument();
  });

  it('should display upcoming features placeholder', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText(/Yeni özellikler yakında/i)).toBeInTheDocument();
  });
});

describe('DashboardPage - Faculty', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: {
        id: '1',
        first_name: 'Prof',
        role: 'faculty',
      },
    });
  });

  it('should display faculty stats', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Verdiğim Dersler')).toBeInTheDocument();
    expect(screen.getByText('Toplam Öğrenci')).toBeInTheDocument();
    expect(screen.getByText('Bekleyen Ödevler')).toBeInTheDocument();
  });

  it('should display faculty quick actions', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Yoklama Al')).toBeInTheDocument();
    expect(screen.getByText('Not Girişi')).toBeInTheDocument();
    expect(screen.getByText('Ders Materyali')).toBeInTheDocument();
    expect(screen.getByText('Sınav Planla')).toBeInTheDocument();
  });
});

describe('DashboardPage - Admin', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: {
        id: '1',
        first_name: 'Admin',
        role: 'admin',
      },
    });
  });

  it('should display admin stats', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Toplam Kullanıcı')).toBeInTheDocument();
    expect(screen.getByText('Aktif Öğrenci')).toBeInTheDocument();
    expect(screen.getByText('Öğretim Üyesi')).toBeInTheDocument();
    expect(screen.getByText('Bölümler')).toBeInTheDocument();
  });

  it('should display admin quick actions', () => {
    render(<DashboardPage />);
    
    expect(screen.getByText('Kullanıcı Ekle')).toBeInTheDocument();
    expect(screen.getByText('Ders Ekle')).toBeInTheDocument();
    expect(screen.getByText('Raporlar')).toBeInTheDocument();
    expect(screen.getByText('Takvim')).toBeInTheDocument();
  });
});
