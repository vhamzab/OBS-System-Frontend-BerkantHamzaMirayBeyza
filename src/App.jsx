import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ErrorBoundary from './components/common/ErrorBoundary';
import { SkeletonPage } from './components/common/Skeleton';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';

// Profile Pages
import ProfilePage from './pages/profile/ProfilePage';
import DepartmentSelectionPage from './pages/profile/DepartmentSelectionPage';

// Course Pages
import CourseCatalogPage from './pages/courses/CourseCatalogPage';
import CourseDetailPage from './pages/courses/CourseDetailPage';
import MyCoursesPage from './pages/courses/MyCoursesPage';

// Grade Pages
import GradesPage from './pages/grades/GradesPage';
import GradebookPage from './pages/grades/GradebookPage';

// Attendance Pages
import StartAttendancePage from './pages/attendance/StartAttendancePage';
import GiveAttendancePage from './pages/attendance/GiveAttendancePage';
import MyAttendancePage from './pages/attendance/MyAttendancePage';
import AttendanceReportPage from './pages/attendance/AttendanceReportPage';
import ExcuseRequestsPage from './pages/attendance/ExcuseRequestsPage';
import CreateExcusePage from './pages/attendance/CreateExcusePage';
import ActiveSessionsPage from './pages/attendance/ActiveSessionsPage';
import FacultySessionsPage from './pages/attendance/FacultySessionsPage';

// Schedule & Announcements
import SchedulePage from './pages/schedule/SchedulePage';
import AnnouncementsPage from './pages/announcements/AnnouncementsPage';
import AcademicCalendarPage from './pages/calendar/AcademicCalendarPage';

// Faculty Pages
import FacultySectionsPage from './pages/faculty/FacultySectionsPage';
import EnrollmentApprovalsPage from './pages/faculty/EnrollmentApprovalsPage';

// Admin Pages - Lazy loaded for code splitting (reduces initial bundle size)
const AdminSectionsPage = lazy(() => import('./pages/admin/AdminSectionsPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminDepartmentsPage = lazy(() => import('./pages/admin/AdminDepartmentsPage'));
const AdminCoursesPage = lazy(() => import('./pages/admin/AdminCoursesPage'));
const AdminMenuPage = lazy(() => import('./pages/admin/AdminMenuPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const IoTDashboardPage = lazy(() => import('./pages/admin/IoTDashboardPage'));
const AcademicAnalyticsPage = lazy(() => import('./pages/admin/AcademicAnalyticsPage'));
const AttendanceAnalyticsPage = lazy(() => import('./pages/admin/AttendanceAnalyticsPage'));
const MealAnalyticsPage = lazy(() => import('./pages/admin/MealAnalyticsPage'));
const EventAnalyticsPage = lazy(() => import('./pages/admin/EventAnalyticsPage'));

// Notification Pages
import NotificationsPage from './pages/notifications/NotificationsPage';
import NotificationSettingsPage from './pages/settings/NotificationSettingsPage';

// Meal Pages
import MenuPage from './pages/meals/MenuPage';
import ReservationsPage from './pages/meals/ReservationsPage';
import ScanPage from './pages/meals/ScanPage';

// Wallet Pages
import WalletPage from './pages/wallet/WalletPage';

// Event Pages
import EventsPage from './pages/events/EventsPage';
import EventDetailPage from './pages/events/EventDetailPage';
import MyEventsPage from './pages/events/MyEventsPage';
import CheckInPage from './pages/events/CheckInPage';
import CreateEventPage from './pages/events/CreateEventPage';

// Scheduling Pages
import MySchedulePage from './pages/schedule/MySchedulePage';
import GenerateSchedulePage from './pages/schedule/GenerateSchedulePage';

// Reservation Pages
import ClassroomReservationsPage from './pages/reservations/ReservationsPage';

// Error Pages
import NotFoundPage from './pages/NotFoundPage';

import { useTranslation } from 'react-i18next';

// Loading fallback for lazy loaded pages
const PageLoadingFallback = () => (
  <div className="p-6 lg:p-8">
    <SkeletonPage />
  </div>
);

function App() {
  const { t } = useTranslation();
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<Layout withSidebar />}>
            {/* Common Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Course Catalog (All Roles) */}
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <CourseCatalogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:id"
              element={
                <ProtectedRoute>
                  <CourseDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute roles={['student']}>
                  <MyCoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/grades"
              element={
                <ProtectedRoute roles={['student']}>
                  <GradesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-attendance"
              element={
                <ProtectedRoute roles={['student']}>
                  <MyAttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/give/:sessionId"
              element={
                <ProtectedRoute roles={['student']}>
                  <GiveAttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/active-sessions"
              element={
                <ProtectedRoute roles={['student']}>
                  <ActiveSessionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/select-department"
              element={
                <ProtectedRoute roles={['student']}>
                  <DepartmentSelectionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/excuse"
              element={
                <ProtectedRoute roles={['student']}>
                  <CreateExcusePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-excuse-requests"
              element={
                <ProtectedRoute roles={['student']}>
                  <ExcuseRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <ProtectedRoute roles={['student']}>
                  <SchedulePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/announcements"
              element={
                <ProtectedRoute>
                  <AnnouncementsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/academic-calendar"
              element={
                <ProtectedRoute>
                  <AcademicCalendarPage />
                </ProtectedRoute>
              }
            />

            {/* Meal Routes */}
            <Route
              path="/meals/menu"
              element={
                <ProtectedRoute>
                  <MenuPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meals/reservations"
              element={
                <ProtectedRoute>
                  <ReservationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meals/scan"
              element={
                <ProtectedRoute roles={['admin', 'cafeteria_staff']}>
                  <ScanPage />
                </ProtectedRoute>
              }
            />

            {/* Wallet Routes */}
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              }
            />

            {/* Event Routes */}
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <EventDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-events"
              element={
                <ProtectedRoute>
                  <MyEventsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/checkin"
              element={
                <ProtectedRoute roles={['admin', 'event_manager']}>
                  <CheckInPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/create"
              element={
                <ProtectedRoute roles={['admin', 'faculty']}>
                  <CreateEventPage />
                </ProtectedRoute>
              }
            />

            {/* Scheduling Routes */}
            <Route
              path="/my-schedule"
              element={
                <ProtectedRoute>
                  <MySchedulePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/scheduling/generate"
              element={
                <ProtectedRoute roles={['admin']}>
                  <GenerateSchedulePage />
                </ProtectedRoute>
              }
            />

            {/* Classroom Reservation Routes */}
            <Route
              path="/reservations"
              element={
                <ProtectedRoute>
                  <ClassroomReservationsPage />
                </ProtectedRoute>
              }
            />

            {/* Faculty Routes */}
            <Route
              path="/faculty/sections"
              element={
                <ProtectedRoute roles={['faculty', 'admin']}>
                  <FacultySectionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/enrollment-approvals"
              element={
                <ProtectedRoute roles={['faculty']}>
                  <EnrollmentApprovalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gradebook/:sectionId"
              element={
                <ProtectedRoute roles={['faculty', 'admin']}>
                  <GradebookPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/start"
              element={
                <ProtectedRoute roles={['faculty', 'admin']}>
                  <StartAttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/report/:sectionId"
              element={
                <ProtectedRoute roles={['faculty', 'admin']}>
                  <AttendanceReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance/sessions"
              element={
                <ProtectedRoute roles={['faculty', 'admin']}>
                  <FacultySessionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/excuse-requests"
              element={
                <ProtectedRoute roles={['faculty', 'admin']}>
                  <ExcuseRequestsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/departments"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDepartmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sections"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminSectionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminCoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/menus"
              element={
                <ProtectedRoute roles={['admin', 'cafeteria_staff']}>
                  <AdminMenuPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/iot"
              element={
                <ProtectedRoute roles={['admin']}>
                  <IoTDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics/academic"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AcademicAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics/attendance"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AttendanceAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics/meal"
              element={
                <ProtectedRoute roles={['admin']}>
                  <MealAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics/events"
              element={
                <ProtectedRoute roles={['admin']}>
                  <EventAnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Notification Routes */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/notifications"
              element={
                <ProtectedRoute>
                  <NotificationSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <NotificationSettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

// Placeholder component for upcoming features
const ComingSoon = ({ title }) => (
  <div className="p-6 lg:p-8 max-w-4xl mx-auto">
    <h1 className="font-display text-3xl font-bold mb-8">{title}</h1>
    <div className="card text-center py-16">
      <div className="text-6xl mb-4">🚧</div>
      <h2 className="font-display text-2xl font-bold mb-2">Yakında!</h2>
      <p className="text-gray-600 dark:text-gray-300">
        Bu özellik yakında eklenecektir.
      </p>
    </div>
  </div>
);

export default App;
