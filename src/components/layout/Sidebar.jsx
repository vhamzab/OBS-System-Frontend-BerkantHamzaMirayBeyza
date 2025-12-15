import { Link, useLocation } from 'react-router-dom';
import {
    FiHome, FiBook, FiCalendar, FiClock, FiUsers,
    FiSettings, FiX, FiAward, FiBell, FiCheckCircle,
    FiGrid, FiAlertCircle, FiUserCheck, FiPlusCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { user } = useAuth();
    const userRole = user?.role || 'student';

    const studentLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: FiHome },
        { name: 'Derslerim', path: '/my-courses', icon: FiBook },
        { name: 'Notlarım', path: '/grades', icon: FiAward },
        { name: 'Yoklamalarım', path: '/my-attendance', icon: FiCheckCircle },
        { name: 'Aktif Yoklamalar', path: '/active-sessions', icon: FiClock },
        { name: 'Mazeret Taleplerim', path: '/my-excuse-requests', icon: FiAlertCircle },
        { name: 'Ders Programı', path: '/schedule', icon: FiCalendar },
        { name: 'Duyurular', path: '/announcements', icon: FiBell },
        { name: 'Akademik Takvim', path: '/academic-calendar', icon: FiCalendar },
    ];

    const facultyLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: FiHome },
        { name: 'Bölümlerim', path: '/faculty/sections', icon: FiGrid },
        { name: 'Kayıt Onayları', path: '/faculty/enrollment-approvals', icon: FiUserCheck },
        { name: 'Yoklama Başlat', path: '/attendance/start', icon: FiPlusCircle },
        { name: 'Yoklama Oturumları', path: '/attendance/sessions', icon: FiClock },
        { name: 'Mazeret Talepleri', path: '/excuse-requests', icon: FiAlertCircle },
        { name: 'Duyurular', path: '/announcements', icon: FiBell },
        { name: 'Akademik Takvim', path: '/academic-calendar', icon: FiCalendar },
    ];

    const adminLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: FiHome },
        { name: 'Kullanıcılar', path: '/admin/users', icon: FiUsers },
        { name: 'Bölümler', path: '/admin/departments', icon: FiGrid },
        { name: 'Dersler', path: '/admin/courses', icon: FiBook },
        { name: 'Seksiyonlar', path: '/admin/sections', icon: FiGrid },
        { name: 'Bölümlerim', path: '/faculty/sections', icon: FiGrid },
        { name: 'Yoklama Başlat', path: '/attendance/start', icon: FiPlusCircle },
        { name: 'Yoklama Oturumları', path: '/attendance/sessions', icon: FiClock },
        { name: 'Mazeret Talepleri', path: '/excuse-requests', icon: FiAlertCircle },
        { name: 'Duyurular', path: '/announcements', icon: FiBell },
        { name: 'Akademik Takvim', path: '/academic-calendar', icon: FiCalendar },
    ];

    const getLinks = () => {
        switch (userRole) {
            case 'admin':
                return adminLinks;
            case 'faculty':
                return facultyLinks;
            default:
                return studentLinks;
        }
    };

    const links = getLinks();

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 
          bg-slate-800 border-r border-slate-700 
          transform transition-transform duration-300 ease-in-out z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}
            >
                {/* Mobile close button */}
                <div className="lg:hidden flex justify-end p-4">
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="px-4 py-2 space-y-1">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={onClose}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive(link.path)
                                    ? 'bg-primary-500/20 text-primary-400 border-l-4 border-primary-500'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                                }
              `}
                        >
                            <link.icon className="w-5 h-5" />
                            <span className="font-medium">{link.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Bottom section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
                    <Link
                        to="/settings"
                        onClick={onClose}
                        className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
              ${isActive('/settings')
                                ? 'bg-primary-500/20 text-primary-400'
                                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                            }
            `}
                    >
                        <FiSettings className="w-5 h-5" />
                        <span className="font-medium">Ayarlar</span>
                    </Link>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
