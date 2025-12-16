import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CourseDetailPage from '../pages/courses/CourseDetailPage';

// Mock toast
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}));

// Mock AuthContext so that user is a student
const mockUseAuth = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock services
const mockEnrollInCourse = jest.fn();
const mockCheckEligibility = jest.fn();

jest.mock('../services/enrollmentService', () => ({
  __esModule: true,
  default: {
    enrollInCourse: (...args) => mockEnrollInCourse(...args),
    checkEligibility: (...args) => mockCheckEligibility(...args),
  },
}));

const mockGetCourseById = jest.fn();
jest.mock('../services/courseService', () => ({
  __esModule: true,
  default: {
    getCourseById: (...args) => mockGetCourseById(...args),
  },
}));

const renderWithRoute = () => {
  mockUseAuth.mockReturnValue({
    user: { role: 'student' },
    isAuthenticated: true,
  });

  mockGetCourseById.mockResolvedValue({
    success: true,
    data: {
      course: {
        id: 1,
        code: 'CS101',
        name: 'Programlamaya Giriş',
        credits: 3,
        ects: 5,
        description: 'Test dersi',
        department: { name: 'Bilgisayar Mühendisliği' },
      },
      prerequisites: [],
      sections: [
        {
          id: 10,
          sectionNumber: '1',
          semester: 'fall',
          year: 2024,
          instructor: 'Dr. Test',
          classroom: 'A101',
          schedule: [
            { day: 'monday', start_time: '09:00', end_time: '10:30' },
          ],
          enrolledCount: 5,
          capacity: 30,
          availableSeats: 25,
        },
      ],
    },
  });

  mockCheckEligibility.mockResolvedValue({
    success: true,
    data: {
      eligible: true,
      issues: [],
      details: {
        prerequisites: { satisfied: true, missing: [] },
        scheduleConflict: { hasConflict: false },
        hasCapacity: true,
      },
    },
  });

  mockEnrollInCourse.mockResolvedValue({
    success: true,
    message: 'Kayıt başarılı',
    data: { enrollment: { id: 1, status: 'enrolled' } },
  });

  return render(
    <MemoryRouter initialEntries={['/courses/1']}>
      <Routes>
        <Route path="/courses/:id" element={<CourseDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Enrollment Form Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Enrollment Display', () => {
    it('should display sections with capacity, instructor and schedule', async () => {
      renderWithRoute();

      expect(await screen.findByText(/Programlamaya Giriş/i)).toBeInTheDocument();
      expect(screen.getByText(/Section 1/)).toBeInTheDocument();
      expect(screen.getByText(/Dr. Test/)).toBeInTheDocument();
      expect(screen.getByText(/A101/)).toBeInTheDocument();
      expect(screen.getByText(/5\/30 Kayıtlı/)).toBeInTheDocument();
    });
  });

  describe('Enrollment Button', () => {
    it('should enable enroll button when student is eligible and seats are available', async () => {
      renderWithRoute();

      const button = await screen.findByRole('button', { name: /Kayıt Ol/i });
      expect(button).toBeEnabled();
    });
  });

  describe('Enrollment Process', () => {
    it('should call enrollInCourse when enroll button is clicked', async () => {
      renderWithRoute();

      const button = await screen.findByRole('button', { name: /Kayıt Ol/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockEnrollInCourse).toHaveBeenCalledWith(10);
      });
    });
  });
});
