import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiBell, FiCheck, FiTrash2, FiFilter, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../../services/notificationService';

const NotificationsPage = () => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [filters, setFilters] = useState({ category: '', read: '' });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, [pagination.page, filters]);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getNotifications(pagination.page, 20, filters);
            if (response.success) {
                setNotifications(response.data.notifications);
                setPagination(prev => ({
                    ...prev,
                    totalPages: response.data.pagination.totalPages,
                    total: response.data.pagination.total
                }));
            }
        } catch (error) {
            toast.error('Bildirimler yüklenemedi');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, filters]);

    const handleMarkAsRead = useCallback(async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            toast.success('Okundu olarak işaretlendi');
        } catch (error) {
            toast.error('İşlem başarısız');
        }
    }, []);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success('Tüm bildirimler okundu');
        } catch (error) {
            toast.error('İşlem başarısız');
        }
    }, []);

    const handleDelete = useCallback(async (id) => {
        if (!confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) return;

        try {
            await deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Bildirim silindi');
        } catch (error) {
            toast.error('Bildirim silinemedi');
        }
    }, []);

    const getCategoryBadge = (category) => {
        const badges = {
            academic: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Akademik' },
            attendance: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: t('attendance.title') },
            meal: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: t('meals.title') },
            event: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Etkinlik' },
            payment: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: t('wallet.payment') },
            system: { bg: 'bg-gray-300/20', text: 'text-gray-600 dark:text-gray-300', label: 'Sistem' }
        };
        const badge = badges[category] || badges.system;
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('tr-TR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Memoize unread count calculation
    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-gray-100">{t('nav.notifications')}</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {pagination.total || 0} bildirim, {unreadCount} okunmamış
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn-secondary ${showFilters ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                    >
                        <FiFilter />
                    </button>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} className="btn-secondary">
                            <FiCheckCircle className="mr-2" />{t('notifications.markAllRead')}</button>
                    )}
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="card mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t('events.category')}</label>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                className="input-field"
                            >
                                <option value="">{t('common.all')}</option>
                                <option value="academic">Akademik</option>
                                <option value="attendance">{t('attendance.title')}</option>
                                <option value="meal">{t('meals.title')}</option>
                                <option value="event">Etkinlik</option>
                                <option value="payment">{t('wallet.payment')}</option>
                                <option value="system">Sistem</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">{t('common.status')}</label>
                            <select
                                value={filters.read}
                                onChange={(e) => setFilters(prev => ({ ...prev, read: e.target.value }))}
                                className="input-field"
                            >
                                <option value="">{t('common.all')}</option>
                                <option value="false">Okunmamış</option>
                                <option value="true">Okunmuş</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card animate-pulse">
                            <div className="h-6 bg-primary-50 rounded w-1/3 mb-2"></div>
                            <div className="h-4 bg-primary-50 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <div className="card text-center py-12">
                    <FiBell className="text-4xl text-gray-700 dark:text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-2">Bildirim Yok</h3>
                    <p className="text-gray-600 dark:text-gray-300">Henüz bildiriminiz bulunmuyor.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`card ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getCategoryBadge(notification.category)}
                                        <span className="text-xs text-gray-700 dark:text-gray-200">{formatDate(notification.created_at)}</span>
                                    </div>
                                    <h3 className={`font-medium ${!notification.read ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                                        {notification.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                                </div>
                                <div className="flex gap-2">
                                    {!notification.read && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-400 transition-colors"
                                            title="Okundu işaretle"
                                        >
                                            <FiCheck />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(notification.id)}
                                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-400 transition-colors"
                                        title={t('common.delete')}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="btn-secondary"
                    >{t('common.previous')}</button>
                    <span className="px-4 py-2 text-gray-600 dark:text-gray-300">
                        Sayfa {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="btn-secondary"
                    >
                        Sonraki
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
