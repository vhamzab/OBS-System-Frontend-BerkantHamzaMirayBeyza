import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiUser, 
  FiBook, 
  FiCalendar, 
  FiClipboard,
  FiUsers,
  FiSettings,
  FiBarChart2,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const studentLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/profile', icon: FiUser, label: 'Profil' },
    { to: '/courses', icon: FiBook, label: 'Derslerim' },
    { to: '/schedule', icon: FiCalendar, label: 'Ders Programı' },
    { to: '/grades', icon: FiClipboard, label: 'Notlarım' },
  ];

  const facultyLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/profile', icon: FiUser, label: 'Profil' },
    { to: '/my-courses', icon: FiBook, label: 'Derslerim' },
    { to: '/students', icon: FiUsers, label: 'Öğrenciler' },
    { to: '/attendance', icon: FiCalendar, label: 'Yoklama' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/admin/users', icon: FiUsers, label: 'Kullanıcılar' },
    { to: '/admin/departments', icon: FiBarChart2, label: 'Bölümler' },
    { to: '/admin/courses', icon: FiBook, label: 'Dersler' },
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-slate-900/95 backdrop-blur-xl
          border-r border-slate-800 z-50 transform transition-transform duration-300
          lg:translate-x-0 lg:static lg:h-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="p-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-r from-primary-600/20 to-accent-600/20 text-white border border-primary-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

