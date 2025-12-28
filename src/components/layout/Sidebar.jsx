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
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
          border-r border-gray-200/50 dark:border-gray-800/50 z-50 transform transition-all duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:h-screen flex flex-col overflow-hidden shadow-2xl lg:shadow-xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sticky Header with Logo */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-primary-500/10 via-primary-50/50 to-accent-50/30 dark:from-primary-900/20 dark:via-gray-900/50 dark:to-gray-900/30 border-b border-gray-200/50 dark:border-gray-800/50 p-5 backdrop-blur-xl">
          <Link to="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="relative">
              <img
                src="/logo2.png"
                alt="Doğu Karadeniz Üniversitesi Logo"
                className="w-14 h-14 object-contain flex-shrink-0 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-300 ring-2 ring-primary-200/50 dark:ring-primary-800/50"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-400/20 to-accent-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-sans font-semibold text-base text-gray-800 dark:text-gray-100 block truncate">
                DKÜ OBS
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 block truncate">
                Doğu Karadeniz Üniversitesi
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {links.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => `
                group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                relative overflow-hidden
                ${isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 scale-[1.02] border border-primary-400/50'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md'
                }
              `}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r from-primary-500/10 to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isActive ? 'opacity-0' : ''}`}></div>
              <link.icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400'}`} />
              <span className={`font-medium relative z-10 ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{link.label}</span>
              {isActive && (
                <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/80"></div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Role Badge - Sticky at bottom */}
        <div className="sticky bottom-0 bg-gradient-to-br from-gray-50/95 via-white/95 to-primary-50/30 dark:from-gray-900/95 dark:via-gray-900/95 dark:to-primary-900/20 border-t border-gray-200/50 dark:border-gray-800/50 p-4 backdrop-blur-xl">
          <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Kullanıcı Rolü</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                user?.role === 'admin' ? 'bg-red-500' :
                user?.role === 'faculty' ? 'bg-blue-500' :
                'bg-green-500'
              } animate-pulse`}></div>
              <div className="font-semibold text-gray-800 dark:text-gray-100 capitalize">
                {user?.role === 'student' && t('roles.student')}
                {user?.role === 'faculty' && t('roles.faculty')}
                {user?.role === 'admin' && t('roles.admin')}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
