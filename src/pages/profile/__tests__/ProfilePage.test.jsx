import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfilePage from '../ProfilePage';
import userService from '../../../services/userService';

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'test@test.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'student',
      phone: '+905551234567',
    },
    updateUser: jest.fn(),
  }),
}));

jest.mock('../../../services/userService', () => ({
  __esModule: true,
  default: {
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
    uploadProfilePicture: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userService.updateProfile.mockResolvedValue({ data: { first_name: 'Test', last_name: 'User' } });
  });

  it('renders profile page title', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Profilim')).toBeInTheDocument();
  });

  it('displays user email', () => {
    render(<ProfilePage />);
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });

  it('displays user initials', () => {
    render(<ProfilePage />);
    expect(screen.getByText('TU')).toBeInTheDocument();
  });

  it('displays role badge', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Öğrenci')).toBeInTheDocument();
  });

  it('renders profile form section', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Profil Bilgileri')).toBeInTheDocument();
  });

  it('renders password change section', () => {
    render(<ProfilePage />);
    expect(screen.getByText('Şifre Değiştir')).toBeInTheDocument();
  });

  it('renders save button', () => {
    render(<ProfilePage />);
    expect(screen.getByRole('button', { name: /Değişiklikleri Kaydet/i })).toBeInTheDocument();
  });

  it('renders password change button', () => {
    render(<ProfilePage />);
    expect(screen.getByRole('button', { name: /Şifreyi Değiştir/i })).toBeInTheDocument();
  });

  it('pre-fills first name', () => {
    render(<ProfilePage />);
    expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
  });

  it('pre-fills last name', () => {
    render(<ProfilePage />);
    expect(screen.getByDisplayValue('User')).toBeInTheDocument();
  });

  it('submits profile form', async () => {
    render(<ProfilePage />);
    
    const saveButton = screen.getByRole('button', { name: /Değişiklikleri Kaydet/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(userService.updateProfile).toHaveBeenCalled();
    });
  });

  it('handles profile update error', async () => {
    userService.updateProfile.mockRejectedValue(new Error('Update failed'));
    render(<ProfilePage />);
    
    const saveButton = screen.getByRole('button', { name: /Değişiklikleri Kaydet/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(userService.updateProfile).toHaveBeenCalled();
    });
  });

  it('renders phone input', () => {
    render(<ProfilePage />);
    expect(screen.getByDisplayValue('+905551234567')).toBeInTheDocument();
  });

  it('allows editing first name', () => {
    render(<ProfilePage />);
    const input = screen.getByDisplayValue('Test');
    fireEvent.change(input, { target: { value: 'NewName' } });
    expect(screen.getByDisplayValue('NewName')).toBeInTheDocument();
  });

  it('allows editing last name', () => {
    render(<ProfilePage />);
    const input = screen.getByDisplayValue('User');
    fireEvent.change(input, { target: { value: 'NewLast' } });
    expect(screen.getByDisplayValue('NewLast')).toBeInTheDocument();
  });

  it('renders camera icon for photo upload', () => {
    const { container } = render(<ProfilePage />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
