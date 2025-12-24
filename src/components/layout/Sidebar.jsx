import { NavLink } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  FiHome,
  FiUser,
  FiBook,
  FiCalendar,
  FiClipboard,
  FiUsers,
  FiSettings,
  FiBarChart2,
  FiMapPin,
  FiFileText,
  FiCheckSquare,
  FiGrid,
  FiBell,
  FiUserCheck,
  FiCoffee,
  FiDollarSign,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const studentLinks = [
    { to: '/dashboard', icon: FiHome, label: t('nav.dashboard') },
    { to: '/notifications', icon: FiBell, label: t('nav.notifications') },
    { to: '/announcements', icon: FiBell, label: t('nav.announcements') },
    { to: '/academic-calendar', icon: FiCalendar, label: t('nav.calendar') },
    { to: '/profile', icon: FiUser, label: t('nav.profile') },
    { to: '/courses', icon: FiGrid, label: t('courses.courseCatalog') },
    { to: '/my-courses', icon: FiBook, label: t('nav.courses') },
    { to: '/schedule', icon: FiCalendar, label: t('dashboard.schedule') },
    { to: '/grades', icon: FiClipboard, label: t('grades.myGrades') },
    { to: '/my-attendance', icon: FiCheckSquare, label: t('attendance.myAttendance') },
    { to: '/my-excuse-requests', icon: FiFileText, label: t('nav.excuseRequests') },
    { to: '/meals/menu', icon: FiCoffee, label: t('meals.menu') },
    { to: '/meals/reservations', icon: FiCoffee, label: t('meals.reservations') },
    { to: '/wallet', icon: FiDollarSign, label: t('wallet.title') },
    { to: '/events', icon: FiCalendar, label: t('events.title') },
    { to: '/my-events', icon: FiCalendar, label: t('events.myEvents') },
  ];

  const facultyLinks = [
    { to: '/dashboard', icon: FiHome, label: t('nav.dashboard') },
    { to: '/notifications', icon: FiBell, label: t('nav.notifications') },
    { to: '/announcements', icon: FiBell, label: t('nav.announcements') },
    { to: '/academic-calendar', icon: FiCalendar, label: t('nav.calendar') },
    { to: '/profile', icon: FiUser, label: t('nav.profile') },
    { to: '/faculty/sections', icon: FiBook, label: t('nav.courses') },
    { to: '/faculty/enrollment-approvals', icon: FiUserCheck, label: t('nav.enrollmentApprovals') },
    { to: '/attendance/start', icon: FiMapPin, label: t('nav.startAttendance') },
    { to: '/excuse-requests', icon: FiFileText, label: t('nav.excuseRequests') },
    { to: '/meals/menu', icon: FiCoffee, label: t('meals.menu') },
    { to: '/meals/reservations', icon: FiCoffee, label: t('meals.reservations') },
    { to: '/wallet', icon: FiDollarSign, label: t('wallet.title') },
    { to: '/events', icon: FiCalendar, label: t('events.title') },
    { to: '/my-events', icon: FiCalendar, label: t('events.myEvents') },
  ];


  const adminLinks = [
    { to: '/dashboard', icon: FiHome, label: t('nav.dashboard') },
    { to: '/admin/dashboard', icon: FiBarChart2, label: t('admin.analytics') },
    { to: '/notifications', icon: FiBell, label: t('nav.notifications') },
    { to: '/announcements', icon: FiBell, label: t('nav.announcements') },
    { to: '/academic-calendar', icon: FiCalendar, label: t('nav.calendar') },
    { to: '/admin/users', icon: FiUsers, label: t('nav.users') },
    { to: '/admin/departments', icon: FiBarChart2, label: t('nav.departments') },
    { to: '/courses', icon: FiGrid, label: t('courses.courseCatalog') },
    { to: '/admin/courses', icon: FiBook, label: t('nav.allCourses') },
    { to: '/admin/sections', icon: FiClipboard, label: t('nav.sections') },
    { to: '/admin/menus', icon: FiCoffee, label: t('nav.menu') },
    { to: '/admin/iot', icon: FiSettings, label: t('nav.iotDashboard') },
    { to: '/meals/menu', icon: FiCoffee, label: t('meals.menu') },
    { to: '/meals/reservations', icon: FiCoffee, label: t('meals.reservations') },
    { to: '/meals/scan', icon: FiCoffee, label: 'QR Scan' },
    { to: '/wallet', icon: FiDollarSign, label: t('wallet.title') },
    { to: '/events', icon: FiCalendar, label: t('events.title') },
    { to: '/my-events', icon: FiCalendar, label: t('events.myEvents') },
    { to: '/admin/scheduling/generate', icon: FiCalendar, label: t('dashboard.schedule') },
    { to: '/reservations', icon: FiCalendar, label: t('meals.reservations') },
    { to: '/settings', icon: FiSettings, label: t('nav.settings') },
  ];


  const getLinks = () => {
    switch (user?.role) {
      case 'admin':
        return adminLinks;
      case 'faculty':
        return facultyLinks;
      default:
        return studentLinks;
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800/95 backdrop-blur-md
          border-r-2 border-gray-300 dark:border-gray-600 z-50 transform transition-transform duration-300
          lg:translate-x-0 lg:static lg:h-auto flex flex-col overflow-hidden shadow-xl lg:shadow-lg
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sticky Header with Logo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary-50/60 to-accent-50/50 border-b-2 border-gray-200 dark:border-gray-700 p-4 backdrop-blur-sm">
          <Link to="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <img
              src="/logo2.png"
              alt="Doğu Karadeniz Üniversitesi Logo"
              className="w-12 h-12 object-contain flex-shrink-0 rounded-lg shadow-md"
            />
            <span className="font-sans font-normal text-lg text-gray-800 dark:text-gray-100">
              DKÜ Doğu Karadeniz Üniversitesi
            </span>
          </Link>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                border-2 shadow-sm
                ${isActive
                  ? 'bg-primary-100 text-primary-800 dark:text-primary-200 border-primary-400 font-semibold shadow-md scale-105'
                  : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-gray-100 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 hover:border-gray-300 dark:border-gray-600 hover:scale-105 border-transparent'
                }
              `}
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Role Badge - Sticky at bottom */}
        <div className="sticky bottom-0 bg-gradient-to-r from-primary-50/60 to-accent-50/50 border-t-2 border-gray-200 dark:border-gray-700 p-4 backdrop-blur-sm">
          <div className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 shadow-md">
            <div className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-1">Rol</div>
            <div className="font-medium text-gray-800 dark:text-gray-100 capitalize">
              {user?.role === 'student' && t('roles.student')}
              {user?.role === 'faculty' && t('roles.faculty')}
              {user?.role === 'admin' && t('roles.admin')}

            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
