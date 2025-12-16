import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CourseCatalogPage from '../pages/courses/CourseCatalogPage';
import CourseDetailPage from '../pages/courses/CourseDetailPage';

// Mock toast
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
  info: jest.fn(),
}));

// Mock AuthContext so that user is a student
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'student' },
    isAuthenticated: true,
  }),
}));

// Mock API test utils used in CourseCatalogPage
jest.mock('../utils/apiTest', () => ({
  testApiConnection: jest.fn(() => Promise.resolve({ success: true })),
  testCoursesEndpoint: jest.fn(() => Promise.resolve({ success: true })),
}));

// Mock services used in the flow
const mockGetCourses = jest.fn();
const mockGetDepartments = jest.fn();
const mockGetCourseById = jest.fn();
const mockCheckEligibility = jest.fn();
const mockEnrollInCourse = jest.fn();

jest.mock('../services/courseService', () => ({
  __esModule: true,
  default: {
    getCourses: (...args) => mockGetCourses(...args),
    getDepartments: (...args) => mockGetDepartments(...args),
    getCourseById: (...args) => mockGetCourseById(...args),
  },
}));

jest.mock('../services/enrollmentService', () => ({
  __esModule: true,
  default: {
    checkEligibility: (...args) => mockCheckEligibility(...args),
    enrollInCourse: (...args) => mockEnrollInCourse(...args),
  },
}));

const setupEnrollmentFlow = () => {
  mockGetDepartments.mockResolvedValue({
    success: true,
    data: [{ id: 'CSE', code: 'CSE', name: 'Bilgisayar Mühendisliği' }],
  });

  mockGetCourses.mockResolvedValue({
    success: true,
    data: {
      courses: [
        {
          id: 1,
          code: 'CS101',
          name: 'Programlamaya Giriş',
          credits: 3,
          ects: 5,
          description: 'Giriş dersi',
          department: { name: 'Bilgisayar Mühendisliği' },
        },
      ],
      pagination: { total: 1, page: 1, limit: 12, totalPages: 1 },
    },
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
        description: 'Giriş dersi',
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
    <MemoryRouter initialEntries={['/courses']}>
      <Routes>
        <Route path="/courses" element={<CourseCatalogPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Frontend Enrollment Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow student to navigate from course list to detail and enroll in a section', async () => {
    setupEnrollmentFlow();

    // Course list page
    expect(await screen.findByText('Programlamaya Giriş')).toBeInTheDocument();

    const detailLink = screen.getByRole('link', { name: /Detayları Gör \/ Kayıt Ol/i });
    fireEvent.click(detailLink);

    // Course detail page
    expect(await screen.findByText(/Mevcut Sectionlar/i)).toBeInTheDocument();
    const enrollButton = await screen.findByRole('button', { name: /Kayıt Ol/i });

    fireEvent.click(enrollButton);

    await waitFor(() => {
      expect(mockEnrollInCourse).toHaveBeenCalledWith(10);
    });
  });
});


