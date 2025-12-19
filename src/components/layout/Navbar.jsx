import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getFileUrl } from '../../services/api';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    const roles = {
      student: 'Öğrenci',
      faculty: 'Öğretim Üyesi',
      admin: 'Yönetici',
    };
    return roles[role] || role;
  };

  // Get profile picture URL with full path
  const getProfilePictureUrl = () => {
    return getFileUrl(user?.profile_picture_url);
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 py-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo2.png" 
              alt="Doğu Karadeniz Üniversitesi Logo" 
              className="w-20 h-20 object-contain rounded-lg shadow-md"
            />
            <span className="font-display font-bold text-xl hidden sm:block text-gray-800">
              <span className="gradient-text">DKÜ</span> Doğu Karadeniz Üniversitesi
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="btn-ghost">
                Dashboard
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin/users" className="btn-ghost">
                  Kullanıcılar
                </Link>
              )}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center overflow-hidden relative">
                    {getProfilePictureUrl() ? (
                      <img
                        src={getProfilePictureUrl()}
                        alt={`${user?.first_name} ${user?.last_name}`}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          // If image fails to load, hide it and show initials
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (parent) {
                            const initials = parent.querySelector('.navbar-initials');
                            if (initials) initials.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <span 
                      className={`navbar-initials text-white font-semibold text-sm ${getProfilePictureUrl() ? 'hidden' : 'flex'} items-center justify-center absolute inset-0`}
                    >
                      {user?.first_name?.[0]?.toUpperCase() || ''}{user?.last_name?.[0]?.toUpperCase() || ''}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-800">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getRoleLabel(user?.role)}
                    </p>
                  </div>
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 card p-2 animate-slide-down">
                    <div className="px-3 py-2 border-b border-gray-200 mb-2 sm:hidden">
                      <p className="font-medium text-gray-800">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getRoleLabel(user?.role)}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiUser className="w-4 h-4" />
                      Profil
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiSettings className="w-4 h-4" />
                      Ayarlar
                    </Link>
                    <hr className="border-gray-200 my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-500 hover:text-red-600"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-ghost">
                  Giriş Yap
                </Link>
                <Link to="/register" className="btn-primary py-2 px-4">
                  Kayıt Ol
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            >
              {isMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && isAuthenticated && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slide-down">
            <Link
              to="/dashboard"
              className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin/users"
                className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Kullanıcılar
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

