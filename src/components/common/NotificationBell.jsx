import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { getRecentNotifications, markAsRead, markAllAsRead } from '../../services/notificationService';

import { useTranslation } from 'react-i18next';
const NotificationBell = () => {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await getRecentNotifications(5);
            if (response.success) {
                setNotifications(response.data.notifications);
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, []);

    const handleMarkAsRead = useCallback(async (notificationId, e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            setLoading(true);
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const getCategoryIcon = useCallback((category) => {
        switch (category) {
            case 'academic': return '📚';
            case 'attendance': return '✅';
            case 'meal': return '🍽️';
            case 'event': return '📅';
            case 'payment': return '💳';
            default: return '📢';
        }
    }, []);

    const getTimeAgo = useCallback((date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Az önce';
        if (minutes < 60) return `${minutes} dk önce`;
        if (hours < 24) return `${hours} saat önce`;
        return `${days} gün önce`;
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 dark:text-gray-100 transition-colors"
                aria-label={`Bildirimler${unreadCount > 0 ? `, ${unreadCount} okunmamış` : ''}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <FiBell className="text-xl" aria-hidden="true" />
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-1 -right-1 bg-red-500 text-gray-800 dark:text-gray-100 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                        aria-hidden="true"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-80 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                    role="menu"
                    aria-label="Bildirim listesi"
                >
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{t('nav.notifications')}</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                disabled={loading}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                                <FiCheckCircle />
                                Hepsini okundu işaretle
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-600 dark:text-gray-300">
                                <FiBell className="text-3xl mx-auto mb-2 opacity-50" />
                                <p>Bildirim yok</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    to={notification.action_url || '/notifications'}
                                    onClick={() => setIsOpen(false)}
                                    className={`block p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-primary-50/50 transition-colors ${!notification.read ? 'bg-primary-50/30' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg">{getCategoryIcon(notification.category)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium ${!notification.read ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 dark:text-gray-500'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{notification.message}</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-200 mt-1">{getTimeAgo(notification.created_at)}</p>
                                        </div>
                                        {!notification.read && (
                                            <button
                                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                                className="p-1 text-gray-600 dark:text-gray-300 hover:text-emerald-400 transition-colors"
                                                title="Okundu işaretle"
                                            >
                                                <FiCheck className="text-sm" />
                                            </button>
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    <Link
                        to="/notifications"
                        onClick={() => setIsOpen(false)}
                        className="block p-3 text-center text-sm text-blue-400 hover:text-blue-300 hover:bg-primary-50/50 transition-colors"
                    >
                        Tüm bildirimleri gör
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
