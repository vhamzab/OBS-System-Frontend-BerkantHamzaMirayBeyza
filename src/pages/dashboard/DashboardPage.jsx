import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiBook, FiCalendar, FiClipboard, FiUsers, FiTrendingUp, FiBell, FiCheckSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const DashboardPage = () => {
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
        { label: 'Aktif Dersler', value: data.activeCourses?.toString() || '0', icon: FiBook, color: 'from-blue-500 to-cyan-500' },
        { label: 'Bugünkü Dersler', value: data.todayCourses?.toString() || '0', icon: FiCalendar, color: 'from-purple-500 to-pink-500' },
        { label: 'Genel Not Ort.', value: data.gpa || '0.00', icon: FiClipboard, color: 'from-green-500 to-emerald-500' },
        { label: 'Duyurular', value: data.notifications?.toString() || '0', icon: FiBell, color: 'from-orange-500 to-red-500' },
      ];
    } else if (user?.role === 'faculty') {
      return [
        { label: 'Verdiğim Dersler', value: data.teachingCourses?.toString() || '0', icon: FiBook, color: 'from-blue-500 to-cyan-500' },
        { label: 'Toplam Öğrenci', value: data.totalStudents?.toString() || '0', icon: FiUsers, color: 'from-purple-500 to-pink-500' },
        { label: 'Bugünkü Dersler', value: data.todayCourses?.toString() || '0', icon: FiCalendar, color: 'from-green-500 to-emerald-500' },
        { label: 'Aktif Yoklamalar', value: data.activeSessions?.toString() || '0', icon: FiCheckSquare, color: 'from-orange-500 to-red-500' },
      ];
    } else if (user?.role === 'admin') {
      return [
        { label: 'Toplam Kullanıcı', value: data.totalUsers?.toString() || '0', icon: FiUsers, color: 'from-blue-500 to-cyan-500' },
        { label: 'Aktif Öğrenci', value: data.activeStudents?.toString() || '0', icon: FiTrendingUp, color: 'from-purple-500 to-pink-500' },
        { label: 'Öğretim Üyesi', value: data.facultyCount?.toString() || '0', icon: FiBook, color: 'from-green-500 to-emerald-500' },
        { label: 'Bölümler', value: data.departmentsCount?.toString() || '0', icon: FiCalendar, color: 'from-orange-500 to-red-500' },
      ];
    }
    return [];
  };

  const getFallbackStats = () => {
    if (user?.role === 'student') {
      return [
        { label: 'Aktif Dersler', value: '-', icon: FiBook, color: 'from-blue-500 to-cyan-500' },
        { label: 'Bugünkü Dersler', value: '-', icon: FiCalendar, color: 'from-purple-500 to-pink-500' },
        { label: 'Genel Not Ort.', value: '-', icon: FiClipboard, color: 'from-green-500 to-emerald-500' },
        { label: 'Duyurular', value: '-', icon: FiBell, color: 'from-orange-500 to-red-500' },
      ];
    } else if (user?.role === 'faculty') {
      return [
        { label: 'Verdiğim Dersler', value: '-', icon: FiBook, color: 'from-blue-500 to-cyan-500' },
        { label: 'Toplam Öğrenci', value: '-', icon: FiUsers, color: 'from-purple-500 to-pink-500' },
        { label: 'Bugünkü Dersler', value: '-', icon: FiCalendar, color: 'from-green-500 to-emerald-500' },
        { label: 'Aktif Yoklamalar', value: '-', icon: FiCheckSquare, color: 'from-orange-500 to-red-500' },
      ];
    }
    return [
      { label: 'Toplam Kullanıcı', value: '-', icon: FiUsers, color: 'from-blue-500 to-cyan-500' },
      { label: 'Aktif Öğrenci', value: '-', icon: FiTrendingUp, color: 'from-purple-500 to-pink-500' },
      { label: 'Öğretim Üyesi', value: '-', icon: FiBook, color: 'from-green-500 to-emerald-500' },
      { label: 'Bölümler', value: '-', icon: FiCalendar, color: 'from-orange-500 to-red-500' },
    ];
  };

  const getRoleLabel = (role) => {
    const roles = {
      student: 'Öğrenci',
      faculty: 'Öğretim Üyesi',
      admin: 'Yönetici',
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
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          Hoş Geldiniz, <span className="gradient-text">{user?.first_name}</span>!
        </h1>
        <p className="text-slate-400">
          {getRoleLabel(user?.role)} paneline hoş geldiniz. Bugün neler yapmak istersiniz?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700"></div>
                <div className="w-12 h-5 rounded-full bg-slate-700"></div>
              </div>
              <div className="h-8 w-16 bg-slate-700 rounded mb-2"></div>
              <div className="h-4 w-24 bg-slate-700 rounded"></div>
            </div>
          ))
        ) : (
          stats.map((stat, index) => (
            <div
              key={index}
              className="card-hover group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
                  Güncel
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-slate-400">{stat.label}</p>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-display text-xl font-bold mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-2 gap-3">
            {user?.role === 'student' && (
              <>
                <button
                  onClick={() => navigate('/courses')}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left"
                >
                  <FiBook className="w-5 h-5 text-primary-400 mb-2" />
                  <span className="block text-sm font-medium">Ders Kaydı</span>
                </button>
                <button
                  onClick={() => navigate('/schedule')}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left"
                >
                  <FiCalendar className="w-5 h-5 text-accent-400 mb-2" />
                  <span className="block text-sm font-medium">Ders Programı</span>
                </button>
                <button
                  onClick={() => navigate('/grades')}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left"
                >
                  <FiClipboard className="w-5 h-5 text-green-400 mb-2" />
                  <span className="block text-sm font-medium">Notlarım</span>
                </button>
                <button
                  onClick={() => navigate('/announcements')}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left"
                >
                  <FiBell className="w-5 h-5 text-orange-400 mb-2" />
                  <span className="block text-sm font-medium">Duyurular</span>
                </button>
              </>
            )}
            {user?.role === 'faculty' && (
              <>
                <button
                  onClick={() => navigate('/attendance/start')}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left"
                >
                  <FiUsers className="w-5 h-5 text-primary-400 mb-2" />
                  <span className="block text-sm font-medium">Yoklama Al</span>
                </button>
                <button
                  onClick={handleGradeEntry}
                  disabled={loadingGradeEntry}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiClipboard className="w-5 h-5 text-accent-400 mb-2" />
                  <span className="block text-sm font-medium">Not Girişi</span>
                </button>
                <button
                  onClick={() => navigate('/faculty/sections')}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left"
                >
                  <FiBook className="w-5 h-5 text-green-400 mb-2" />
                  <span className="block text-sm font-medium">Derslerim</span>
                </button>
                <button
                  onClick={() => navigate('/excuse-requests')}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left"
                >
                  <FiCalendar className="w-5 h-5 text-orange-400 mb-2" />
                  <span className="block text-sm font-medium">Mazeret Talepleri</span>
                </button>
              </>
            )}
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left"
                >
                  <FiUsers className="w-5 h-5 text-primary-400 mb-2" />
                  <span className="block text-sm font-medium">Kullanıcı Yönetimi</span>
                </button>
                <button
                  onClick={() => navigate('/admin/courses')}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left"
                >
                  <FiBook className="w-5 h-5 text-accent-400 mb-2" />
                  <span className="block text-sm font-medium">Ders Yönetimi</span>
                </button>
                <button
                  onClick={() => navigate('/admin/sections')}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left"
                >
                  <FiClipboard className="w-5 h-5 text-green-400 mb-2" />
                  <span className="block text-sm font-medium">Section Yönetimi</span>
                </button>
                <button
                  onClick={() => navigate('/admin/departments')}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors text-left"
                >
                  <FiCalendar className="w-5 h-5 text-orange-400 mb-2" />
                  <span className="block text-sm font-medium">Bölüm Yönetimi</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="font-display text-xl font-bold mb-4">Son Aktiviteler</h2>
          <div className="space-y-4">
            {loading ? (
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 animate-pulse">
                  <div className="w-2 h-2 mt-2 rounded-full bg-slate-600"></div>
                  <div className="flex-1">
                    <div className="h-4 w-3/4 bg-slate-700 rounded mb-2"></div>
                    <div className="h-3 w-20 bg-slate-700 rounded"></div>
                  </div>
                </div>
              ))
            ) : activities.length > 0 ? (
              activities.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <div className={`w-2 h-2 mt-2 rounded-full ${getActivityColor(activity.type)}`} />
                  <div>
                    <p className="text-sm text-slate-300">{activity.text}</p>
                    <span className="text-xs text-slate-500">{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-8">
                <p>Henüz aktivite bulunmuyor</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
