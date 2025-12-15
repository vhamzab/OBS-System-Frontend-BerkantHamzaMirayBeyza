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
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const studentLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/announcements', icon: FiBell, label: 'Duyurular' },
    { to: '/academic-calendar', icon: FiCalendar, label: 'Akademik Takvim' },
    { to: '/profile', icon: FiUser, label: 'Profil' },
    { to: '/courses', icon: FiGrid, label: 'Ders Kataloğu' },
    { to: '/my-courses', icon: FiBook, label: 'Derslerim' },
    { to: '/schedule', icon: FiCalendar, label: 'Ders Programı' },
    { to: '/grades', icon: FiClipboard, label: 'Notlarım' },
    { to: '/my-attendance', icon: FiCheckSquare, label: 'Devam Durumu' },
    { to: '/my-excuse-requests', icon: FiFileText, label: 'Mazeretlerim' },
  ];

  const facultyLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/announcements', icon: FiBell, label: 'Duyurular' },
    { to: '/academic-calendar', icon: FiCalendar, label: 'Akademik Takvim' },
    { to: '/profile', icon: FiUser, label: 'Profil' },
    { to: '/faculty/sections', icon: FiBook, label: 'Derslerim' },
    { to: '/faculty/enrollment-approvals', icon: FiUserCheck, label: 'Kayıt Onayları' },
    { to: '/attendance/start', icon: FiMapPin, label: 'Yoklama Aç' },
    { to: '/excuse-requests', icon: FiFileText, label: 'Mazeret Talepleri' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/announcements', icon: FiBell, label: 'Duyurular' },
    { to: '/academic-calendar', icon: FiCalendar, label: 'Akademik Takvim' },
    { to: '/admin/users', icon: FiUsers, label: 'Kullanıcılar' },
    { to: '/admin/departments', icon: FiBarChart2, label: 'Bölümler' },
    { to: '/courses', icon: FiGrid, label: 'Ders Kataloğu' },
    { to: '/admin/courses', icon: FiBook, label: 'Ders Yönetimi' },
    { to: '/admin/sections', icon: FiClipboard, label: 'Section Yönetimi' },
    { to: '/settings', icon: FiSettings, label: 'Ayarlar' },
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
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white
          border-r border-gray-200 z-50 transform transition-transform duration-300
          lg:translate-x-0 lg:static lg:h-auto flex flex-col overflow-hidden shadow-lg lg:shadow-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sticky Header with Logo */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
          <Link to="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <img 
              src="/logo.png" 
              alt="BHMB Üniversitesi Logo" 
              className="w-10 h-10 object-contain flex-shrink-0 rounded-xl shadow-sm"
            />
            <span className="font-display font-bold text-lg text-gray-800">
              BHMB <span className="gradient-text">Üniversitesi</span>
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
                ${isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Role Badge - Sticky at bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="px-4 py-2 rounded-xl bg-gray-100">
            <div className="text-xs text-gray-500 mb-1">Rol</div>
            <div className="font-medium text-gray-800 capitalize">
              {user?.role === 'student' && 'Öğrenci'}
              {user?.role === 'faculty' && 'Öğretim Üyesi'}
              {user?.role === 'admin' && 'Yönetici'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
