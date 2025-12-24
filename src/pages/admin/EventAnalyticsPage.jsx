import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiUsers, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getEventAnalytics } from '../../services/analyticsService';

import { useTranslation } from 'react-i18next';
const EventAnalyticsPage = () => {
  const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getEventAnalytics();
            if (response.success) {
                setData(response.data);
            }
        } catch (error) {
            toast.error('Etkinlik verileri yüklenemedi');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="card h-48 bg-gray-100 dark:bg-gray-800"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link to="/admin/dashboard" className="btn-secondary p-2">
                    <FiArrowLeft />
                </Link>
                <div>
                    <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-gray-100">Etkinlik Analizi</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Popüler etkinlikler ve katılım oranları</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="card">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-500">
                            <FiUsers className="text-2xl text-gray-800 dark:text-gray-100" />
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">Kayıt Oranı</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">%{data?.registrationRate || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500">
                            <FiCheckCircle className="text-2xl text-gray-800 dark:text-gray-100" />
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">Check-in Oranı</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">%{data?.checkInRate || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="card mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Kategori Dağılımı</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {data?.categoryBreakdown?.map((cat, idx) => (
                        <div key={idx} className="p-4 bg-primary-50 border border-primary-200 rounded-lg text-center">
                            <p className="text-2xl font-bold text-primary-600">{cat.count}</p>
                            <p className="text-gray-600 dark:text-gray-300 text-sm capitalize">{cat.category || 'Diğer'}</p>
                        </div>
                    )) || <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 col-span-4">{t('common.noData')}</p>}
                </div>
            </div>

            {/* Popular Events */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FiCalendar className="text-pink-500" />
                    En Popüler Etkinlikler
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                                <th className="p-3 font-semibold">Etkinlik</th>
                                <th className="p-3 font-semibold">{t('events.category')}</th>
                                <th className="p-3 font-semibold">{t('courses.capacity')}</th>
                                <th className="p-3 font-semibold">Kayıt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.popularEvents?.length > 0 ? data.popularEvents.map((event, idx) => (
                                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                                    <td className="p-3 text-gray-800 dark:text-gray-100">{event.title}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300 capitalize">{event.category}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">{event.capacity}</td>
                                    <td className="p-3 text-pink-600 font-bold">{event.registrationCount}</td>
                                </tr>
                            )) : <tr><td colSpan={4} className="p-3 text-gray-500 dark:text-gray-400 dark:text-gray-500 text-center">Henüz etkinlik yok</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EventAnalyticsPage;
