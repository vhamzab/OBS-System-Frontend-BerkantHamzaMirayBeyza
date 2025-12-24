import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiUsers, FiBook, FiCheckCircle, FiCalendar,
    FiTrendingUp, FiActivity, FiCoffee, FiAlertCircle,
    FiDownload, FiRefreshCw, FiBarChart2
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getDashboardStats } from '../../services/analyticsService';

import { useTranslation } from 'react-i18next';
const AdminDashboardPage = () => {
  const { t } = useTranslation();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await getDashboardStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            toast.error('İstatistikler yüklenemedi');
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
        toast.success('İstatistikler güncellendi');
    };

    const StatCard = ({ title, value, icon: Icon, color, trend, link }) => (
        <Link to={link || '#'} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-1 ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% bu hafta
                        </p>
                    )}
                </div>
                <div className={`p-4 rounded-xl ${color}`}>
                    <Icon className="text-2xl text-gray-800 dark:text-gray-100" />
                </div>
            </div>
        </Link>
    );

    const QuickLink = ({ title, description, icon: Icon, to, color }) => (
        <Link
            to={to}
            className="card hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
        >
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="text-xl text-gray-800 dark:text-gray-100" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
                </div>
            </div>
        </Link>
    );

    if (loading) {
        return (
            <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="card h-32 bg-gray-100 dark:bg-gray-800"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-gray-100">Admin Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Sistem istatistikleri ve analizler</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="btn-secondary flex items-center gap-2"
                >
                    <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                    Yenile
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Toplam Kullanıcı"
                    value={stats?.totalUsers || 0}
                    icon={FiUsers}
                    color="bg-blue-500"
                    link="/admin/users"
                />
                <StatCard
                    title="Bugün Aktif"
                    value={stats?.activeUsersToday || 0}
                    icon={FiActivity}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Toplam Kayıt"
                    value={stats?.totalEnrollments || 0}
                    icon={FiBook}
                    color="bg-purple-500"
                />
                <StatCard
                    title={t('attendance.attendanceRate')}
                    value={`%${stats?.attendanceRate || 0}`}
                    icon={FiCheckCircle}
                    color="bg-amber-500"
                    link="/admin/analytics/attendance"
                />
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title={t('dashboard.totalCourses')}
                    value={stats?.totalCourses || 0}
                    icon={FiBarChart2}
                    color="bg-cyan-500"
                    link="/admin/courses"
                />
                <StatCard
                    title="Bugünkü Yemek Rez."
                    value={stats?.mealReservationsToday || 0}
                    icon={FiCoffee}
                    color="bg-orange-500"
                    link="/admin/analytics/meal"
                />
                <StatCard
                    title="Yaklaşan Etkinlik"
                    value={stats?.upcomingEvents || 0}
                    icon={FiCalendar}
                    color="bg-pink-500"
                    link="/events"
                />
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">{t('admin.systemHealth')}</p>
                            <p className={`text-2xl font-bold ${stats?.systemHealth === 'healthy' ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                {stats?.systemHealth === 'healthy' ? '✓ Sağlıklı' : '⚠ Sorunlu'}
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl ${stats?.systemHealth === 'healthy' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}>
                            <FiAlertCircle className="text-2xl text-gray-800 dark:text-gray-100" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <h2 className="font-display text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Hızlı Erişim - Analitik Raporlar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <QuickLink
                    title="Akademik Performans"
                    description="GPA dağılımı, başarı oranları"
                    icon={FiTrendingUp}
                    to="/admin/analytics/academic"
                    color="bg-gradient-to-br from-blue-500 to-purple-600"
                />
                <QuickLink
                    title="Yoklama Analizi"
                    description="Devam oranları, riskli öğrenciler"
                    icon={FiCheckCircle}
                    to="/admin/analytics/attendance"
                    color="bg-gradient-to-br from-emerald-500 to-teal-600"
                />
                <QuickLink
                    title="Yemek Kullanımı"
                    description="Günlük kullanım, gelir raporu"
                    icon={FiCoffee}
                    to="/admin/analytics/meal"
                    color="bg-gradient-to-br from-orange-500 to-red-600"
                />
                <QuickLink
                    title="Etkinlik Raporları"
                    description="Popüler etkinlikler, katılım"
                    icon={FiCalendar}
                    to="/admin/analytics/events"
                    color="bg-gradient-to-br from-pink-500 to-rose-600"
                />
            </div>

            {/* Admin Actions */}
            <h2 className="font-display text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('admin.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <QuickLink
                    title="Kullanıcı Yönetimi"
                    description="Kullanıcı ekle, düzenle, sil"
                    icon={FiUsers}
                    to="/admin/users"
                    color="bg-primary-500"
                />
                <QuickLink
                    title="Ders Yönetimi"
                    description="Ders ve şube işlemleri"
                    icon={FiBook}
                    to="/admin/courses"
                    color="bg-primary-500"
                />
                <QuickLink
                    title="Menü Yönetimi"
                    description="Yemek menüsü işlemleri"
                    icon={FiCoffee}
                    to="/admin/menus"
                    color="bg-primary-500"
                />
                <QuickLink
                    title={t('nav.iotDashboard')}
                    description="Kampüs sensör verileri"
                    icon={FiActivity}
                    to="/admin/iot"
                    color="bg-primary-500"
                />
            </div>
        </div>
    );
};

export default AdminDashboardPage;
