import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiSettings, FiMenu, FiX, FiSun, FiMoon, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { getFileUrl } from '../../services/api';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);

  const currentLang = i18n.language;

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setIsLangDropdownOpen(false);
  };


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
    <nav
      className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm"
      role="navigation"
      aria-label="Ana Navigasyon"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 py-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/logo2.png"
                alt="Doğu Karadeniz Üniversitesi Logo"
                className="w-12 h-12 object-contain rounded-xl shadow-lg ring-2 ring-primary-200/30 dark:ring-primary-800/30 group-hover:ring-primary-400/50 dark:group-hover:ring-primary-600/50 transition-all duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary-400/20 to-accent-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="hidden sm:block">
              <span className="font-sans font-bold text-lg text-gray-800 dark:text-gray-100 block">
                DKÜ OBS
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 block">
                Doğu Karadeniz Üniversitesi
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="btn-ghost">{t('nav.dashboard')}</Link>
              {user?.role === 'admin' && (
                <Link to="/admin/users" className="btn-ghost">{t('nav.users')}</Link>
              )}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 text-gray-600 dark:text-gray-300 flex items-center gap-1"
                title={t('language.selectLanguage')}
                aria-label={t('language.selectLanguage')}
                aria-expanded={isLangDropdownOpen}
                aria-haspopup="true"
              >
                <FiGlobe className="w-5 h-5" />
                <span className="text-xs font-medium uppercase">{currentLang.substring(0, 2)}</span>
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 card p-2 animate-slide-down z-50 dark:bg-gray-800 dark:border-gray-700">
                  <button
                    onClick={() => changeLanguage('tr')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentLang.startsWith('tr')
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                  >
                    <span className="text-lg">🇹🇷</span>
                    <span>Türkçe</span>
                  </button>
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentLang.startsWith('en')
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                  >
                    <span className="text-lg">🇬🇧</span>
                    <span>English</span>
                  </button>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 text-gray-600 dark:text-gray-300"
              title={isDark ? t('theme.light') : t('theme.dark')}
              aria-label={isDark ? t('theme.light') : t('theme.dark')}
              aria-pressed={isDark}
            >
              {isDark ? (
                <FiSun className="w-5 h-5 text-amber-400" />
              ) : (
                <FiMoon className="w-5 h-5 text-primary-600" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors"
                  aria-label="Kullanıcı menüsü"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
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
                      className={`navbar-initials text-gray-800 dark:text-gray-100 font-semibold text-sm ${getProfilePictureUrl() ? 'hidden' : 'flex'} items-center justify-center absolute inset-0`}
                    >
                      {user?.first_name?.[0]?.toUpperCase() || ''}{user?.last_name?.[0]?.toUpperCase() || ''}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">
                      {getRoleLabel(user?.role)}
                    </p>
                  </div>
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl p-2 animate-slide-down z-50" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-800/50 mb-2 sm:hidden bg-gradient-to-r from-primary-50/50 to-accent-50/30 dark:from-primary-900/20 dark:to-gray-900/30 rounded-lg">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getRoleLabel(user?.role)}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 dark:hover:from-primary-900/30 dark:hover:to-gray-800/50 transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 group"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="p-2 rounded-lg bg-primary-100/50 dark:bg-primary-900/30 group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
                        <FiUser className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="font-medium">{t('nav.profile')}</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 dark:hover:from-primary-900/30 dark:hover:to-gray-800/50 transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 group"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <div className="p-2 rounded-lg bg-primary-100/50 dark:bg-primary-900/30 group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
                        <FiSettings className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className="font-medium">{t('nav.settings')}</span>
                    </Link>
                    <hr className="border-gray-200/50 dark:border-gray-800/50 my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/30 dark:hover:to-red-800/30 transition-all duration-300 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 group"
                    >
                      <div className="p-2 rounded-lg bg-red-100/50 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
                        <FiLogOut className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{t('nav.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-ghost">{t('common.login')}</Link>
                <Link to="/register" className="btn-primary py-2 px-4">{t('common.register')}</Link>
              </div>
            )}

            {/* Mobile menu button - toggles sidebar */}
            {isAuthenticated && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                aria-label="Menüyü aç/kapat"
                aria-controls="mobile-sidebar"
              >
                <FiMenu className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
        {/* Mobile navigation is now handled by Sidebar component */}
      </div>
    </nav>
  );
};

export default Navbar;

