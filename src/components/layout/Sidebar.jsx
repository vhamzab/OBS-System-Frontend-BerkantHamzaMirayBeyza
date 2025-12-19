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
          fixed top-20 left-0 h-[calc(100vh-5rem)] w-64 bg-white/95 backdrop-blur-md
          border-r-2 border-gray-300 z-50 transform transition-transform duration-300
          lg:translate-x-0 lg:static lg:h-auto flex flex-col overflow-hidden shadow-xl lg:shadow-lg
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sticky Header with Logo */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary-50/50 to-purple-50/50 border-b-2 border-gray-300 p-4 backdrop-blur-sm">
          <Link to="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <img 
              src="/logo2.png" 
              alt="Doğu Karadeniz Üniversitesi Logo" 
              className="w-20 h-20 object-contain flex-shrink-0 rounded-lg shadow-md"
            />
            <span className="font-display font-bold text-lg text-gray-800">
              <span className="gradient-text">DKÜ</span> Doğu Karadeniz Üniversitesi
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
                  ? 'bg-primary-100 text-primary-800 border-primary-400 font-semibold shadow-md scale-105'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 hover:border-gray-300 hover:scale-105 border-transparent'
                }
              `}
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Role Badge - Sticky at bottom */}
        <div className="sticky bottom-0 bg-gradient-to-r from-primary-50/50 to-purple-50/50 border-t-2 border-gray-300 p-4 backdrop-blur-sm">
          <div className="px-4 py-2 rounded-xl bg-white/80 border-2 border-gray-200 shadow-md">
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
