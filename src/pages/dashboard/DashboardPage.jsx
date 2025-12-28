import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiBook, FiCalendar, FiClipboard, FiUsers, FiTrendingUp, FiBell, FiCheckSquare, FiCoffee, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { useTranslation } from 'react-i18next';
const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingGradeEntry, setLoadingGradeEntry] = useState(false);
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, activitiesRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActivities()
      ]);

      if (statsRes.success) {
        setStats(formatStats(statsRes.data));
      }
      if (activitiesRes.success) {
        setActivities(activitiesRes.data || []);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      // Use fallback data on error
      setStats(getFallbackStats());
    } finally {
      setLoading(false);
    }
  };

  const formatStats = (data) => {
    if (user?.role === 'student') {
      return [
        { label: t('dashboard.activeCourses'), value: data.activeCourses?.toString() || '0', icon: FiBook, color: 'from-blue-500 to-cyan-500' },
        { label: t('dashboard.todayCourses'), value: data.todayCourses?.toString() || '0', icon: FiCalendar, color: 'from-blue-500 to-accent-500' },
        { label: t('grades.gpa'), value: data.gpa || '0.00', icon: FiClipboard, color: 'from-green-500 to-emerald-500' },
        { label: t('nav.announcements'), value: data.notifications?.toString() || '0', icon: FiBell, color: 'from-orange-500 to-red-500' },
      ];
    } else if (user?.role === 'faculty') {
      return [
        { label: t('dashboard.teachingCourses'), value: data.teachingCourses?.toString() || '0', icon: FiBook, color: 'from-blue-500 to-cyan-500' },
        { label: t('dashboard.totalStudents'), value: data.totalStudents?.toString() || '0', icon: FiUsers, color: 'from-blue-500 to-accent-500' },
        { label: t('dashboard.todayCourses'), value: data.todayCourses?.toString() || '0', icon: FiCalendar, color: 'from-green-500 to-emerald-500' },
        { label: t('attendance.activeSession'), value: data.activeSessions?.toString() || '0', icon: FiCheckSquare, color: 'from-orange-500 to-red-500' },
      ];
    } else if (user?.role === 'admin') {
      return [
        { label: t('nav.users'), value: data.totalUsers?.toString() || '0', icon: FiUsers, color: 'from-blue-500 to-cyan-500' },
        { label: t('dashboard.activeStudents'), value: data.activeStudents?.toString() || '0', icon: FiTrendingUp, color: 'from-blue-500 to-accent-500' },
        { label: t('courses.instructor'), value: data.facultyCount?.toString() || '0', icon: FiBook, color: 'from-green-500 to-emerald-500' },
        { label: t('nav.departments'), value: data.departmentsCount?.toString() || '0', icon: FiCalendar, color: 'from-orange-500 to-red-500' },
      ];
    }
    return [];
  };

  const getFallbackStats = () => {
    if (user?.role === 'student') {
      return [
        { label: t('dashboard.activeCourses'), value: '-', icon: FiBook, color: 'from-blue-500 to-cyan-500' },
        { label: t('dashboard.todayCourses'), value: '-', icon: FiCalendar, color: 'from-blue-500 to-accent-500' },
        { label: t('grades.gpa'), value: '-', icon: FiClipboard, color: 'from-green-500 to-emerald-500' },
        { label: t('nav.announcements'), value: '-', icon: FiBell, color: 'from-orange-500 to-red-500' },
      ];
    } else if (user?.role === 'faculty') {
      return [
        { label: t('dashboard.teachingCourses'), value: '-', icon: FiBook, color: 'from-blue-500 to-cyan-500' },
        { label: t('dashboard.totalStudents'), value: '-', icon: FiUsers, color: 'from-blue-500 to-accent-500' },
        { label: t('dashboard.todayCourses'), value: '-', icon: FiCalendar, color: 'from-green-500 to-emerald-500' },
        { label: t('attendance.activeSession'), value: '-', icon: FiCheckSquare, color: 'from-orange-500 to-red-500' },
      ];
    }
    return [
      { label: t('nav.users'), value: '-', icon: FiUsers, color: 'from-blue-500 to-cyan-500' },
      { label: t('dashboard.activeStudents'), value: '-', icon: FiTrendingUp, color: 'from-blue-500 to-accent-500' },
      { label: t('courses.instructor'), value: '-', icon: FiBook, color: 'from-green-500 to-emerald-500' },
      { label: t('nav.departments'), value: '-', icon: FiCalendar, color: 'from-orange-500 to-red-500' },
    ];
  };

  const getRoleLabel = (role) => {
    const roles = {
      student: t('roles.student'),
      faculty: t('roles.faculty'),
      admin: t('roles.admin'),
    };
    return roles[role] || role;
  };

  // Handle grade entry navigation
  const handleGradeEntry = async () => {
    if (user?.role !== 'faculty') return;

    try {
      setLoadingGradeEntry(true);
      const response = await courseService.getInstructorSections();

      if (response.success && response.data.length > 0) {
        if (response.data.length === 1) {
          navigate(`/gradebook/${response.data[0].id}`);
        } else {
          navigate('/faculty/sections');
        }
      } else {
        toast.error('Henüz size atanmış ders bulunmuyor');
        navigate('/faculty/sections');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Dersler yüklenirken hata oluştu');
      navigate('/faculty/sections');
    } finally {
      setLoadingGradeEntry(false);
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8 relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <h1 className="font-sans text-4xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            {t('common.welcome')}, {user?.first_name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t('dashboard.welcomeMessage')}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                <div className="w-12 h-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              </div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))
        ) : (
          stats.map((stat, index) => (
            <div
              key={index}
              className="card-hover group relative overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-900/30 px-3 py-1 rounded-full border border-primary-200/50 dark:border-primary-800/50">
                    Güncel
                  </span>
                </div>
                <h3 className="text-4xl font-bold mb-2 text-gray-800 dark:text-gray-100">{stat.value}</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h2 className="font-sans text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">{t('dashboard.quickActions')}</h2>
            <div className="grid grid-cols-2 gap-3">
            {user?.role === 'student' && (
              <>
                <button
                  onClick={() => navigate('/courses')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-primary-50 hover:to-accent-50 dark:hover:from-primary-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-primary-300/50 dark:hover:border-primary-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiBook className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('courses.courseCatalog')}</span>
                </button>
                <button
                  onClick={() => navigate('/schedule')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiCalendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('dashboard.schedule')}</span>
                </button>
                <button
                  onClick={() => navigate('/grades')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-green-300/50 dark:hover:border-green-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiClipboard className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('grades.myGrades')}</span>
                </button>
                <button
                  onClick={() => navigate('/announcements')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-orange-300/50 dark:hover:border-orange-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiBell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('nav.announcements')}</span>
                </button>
                <button
                  onClick={() => navigate('/meals/menu')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-amber-50 hover:to-amber-100 dark:hover:from-amber-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-amber-300/50 dark:hover:border-amber-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiCoffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('meals.menu')}</span>
                </button>
                <button
                  onClick={() => navigate('/meals/reservations')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-amber-50 hover:to-amber-100 dark:hover:from-amber-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-amber-300/50 dark:hover:border-amber-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600/20 to-amber-700/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiCoffee className="w-5 h-5 text-amber-700 dark:text-amber-500" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('meals.reservations')}</span>
                </button>
                <button
                  onClick={() => navigate('/events')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300/50 dark:hover:border-purple-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiCalendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('events.title')}</span>
                </button>
                <button
                  onClick={() => navigate('/events/create')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300/50 dark:hover:border-purple-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/20 to-purple-700/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiPlus className="w-5 h-5 text-purple-700 dark:text-purple-500" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('events.createEvent')}</span>
                </button>
              </>
            )}
            {user?.role === 'faculty' && (
              <>
                <button
                  onClick={() => navigate('/attendance/start')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-primary-50 hover:to-accent-50 dark:hover:from-primary-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-primary-300/50 dark:hover:border-primary-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiUsers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('attendance.giveAttendance')}</span>
                </button>
                <button
                  onClick={handleGradeEntry}
                  disabled={loadingGradeEntry}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300/50 dark:hover:border-blue-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiClipboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('grades.gradebook')}</span>
                </button>
                <button
                  onClick={() => navigate('/faculty/sections')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-green-300/50 dark:hover:border-green-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiBook className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('courses.myCourses')}</span>
                </button>
                <button
                  onClick={() => navigate('/excuse-requests')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-orange-300/50 dark:hover:border-orange-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiCalendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('nav.excuseRequests')}</span>
                </button>
                <button
                  onClick={() => navigate('/meals/menu')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-amber-50 hover:to-amber-100 dark:hover:from-amber-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-amber-300/50 dark:hover:border-amber-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiCoffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('meals.menu')}</span>
                </button>
                <button
                  onClick={() => navigate('/meals/reservations')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-amber-50 hover:to-amber-100 dark:hover:from-amber-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-amber-300/50 dark:hover:border-amber-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600/20 to-amber-700/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiCoffee className="w-5 h-5 text-amber-700 dark:text-amber-500" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('meals.reservations')}</span>
                </button>
                <button
                  onClick={() => navigate('/events')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300/50 dark:hover:border-purple-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiCalendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('events.title')}</span>
                </button>
                <button
                  onClick={() => navigate('/events/create')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300/50 dark:hover:border-purple-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/20 to-purple-700/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiPlus className="w-5 h-5 text-purple-700 dark:text-purple-500" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('events.createEvent')}</span>
                </button>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-primary-50 hover:to-accent-50 dark:hover:from-primary-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-primary-300/50 dark:hover:border-primary-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiUsers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('nav.users')}</span>
                </button>
                <button
                  onClick={() => navigate('/admin/courses')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-accent-50 hover:to-accent-100 dark:hover:from-accent-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-accent-300/50 dark:hover:border-accent-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-500/20 to-accent-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiBook className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('nav.allCourses')}</span>
                </button>
                <button
                  onClick={() => navigate('/admin/sections')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-green-300/50 dark:hover:border-green-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiClipboard className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('nav.sections')}</span>
                </button>
                <button
                  onClick={() => navigate('/admin/departments')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-orange-300/50 dark:hover:border-orange-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiCalendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('nav.departments')}</span>
                </button>
                <button
                  onClick={() => navigate('/admin/menus')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-amber-50 hover:to-amber-100 dark:hover:from-amber-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-amber-300/50 dark:hover:border-amber-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiCoffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('nav.menu')}</span>
                </button>
                <button
                  onClick={() => navigate('/meals/scan')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-amber-50 hover:to-amber-100 dark:hover:from-amber-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-amber-300/50 dark:hover:border-amber-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600/20 to-amber-700/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiCoffee className="w-5 h-5 text-amber-700 dark:text-amber-500" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('attendance.scanQR')}</span>
                </button>
                <button
                  onClick={() => navigate('/events')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300/50 dark:hover:border-purple-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiCalendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('events.title')}</span>
                </button>
                <button
                  onClick={() => navigate('/events/create')}
                  className="group p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/30 dark:hover:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300/50 dark:hover:border-purple-700/50 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/20 to-purple-700/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FiPlus className="w-5 h-5 text-purple-700 dark:text-purple-500" />
                  </div>
                  <span className="block text-sm font-semibold text-gray-700 dark:text-gray-200">{t('events.createEvent')}</span>
                </button>
              </>
            )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -ml-20 -mt-20"></div>
          <div className="relative z-10">
            <h2 className="font-sans text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">{t('dashboard.recentNotifications')}</h2>
            <div className="space-y-4">
              {loading ? (
                Array(4).fill(0).map((_, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 animate-pulse">
                    <div className="w-2 h-2 mt-2 rounded-full bg-gray-300"></div>
                    <div className="flex-1">
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))
              ) : activities.length > 0 ? (
                activities.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800/50 hover:from-primary-50/50 hover:to-accent-50/30 dark:hover:from-primary-900/20 dark:hover:to-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 hover:border-primary-300/50 dark:hover:border-primary-700/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                  >
                    <div className={`w-3 h-3 mt-1.5 rounded-full ${getActivityColor(activity.type)} shadow-lg`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{activity.text}</p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">{activity.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <p>{t('common.noData')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
