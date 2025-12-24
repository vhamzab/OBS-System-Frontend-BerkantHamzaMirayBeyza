import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCoffee, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getMealUsageAnalytics } from '../../services/analyticsService';

import { useTranslation } from 'react-i18next';
const MealAnalyticsPage = () => {
  const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getMealUsageAnalytics();
            if (response.success) {
                setData(response.data);
            }
        } catch (error) {
            toast.error('Yemek verileri yüklenemedi');
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
                    <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-gray-100">Yemek Kullanım Analizi</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Günlük kullanım ve gelir raporu</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="card">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500">
                            <FiDollarSign className="text-2xl text-gray-800 dark:text-gray-100" />
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">Toplam Gelir</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{data?.totalRevenue?.toFixed(2) || 0} TL</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-gray-600 dark:text-gray-300 text-sm mb-2">Yoğun Saatler</h3>
                    <div className="space-y-1 text-sm">
                        <p className="text-gray-800 dark:text-gray-100">☀️ Kahvaltı: {data?.peakHours?.breakfast}</p>
                        <p className="text-gray-800 dark:text-gray-100">🌞 Öğle: {data?.peakHours?.lunch}</p>
                        <p className="text-gray-800 dark:text-gray-100">🌙 Akşam: {data?.peakHours?.dinner}</p>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-gray-600 dark:text-gray-300 text-sm mb-2">Öğün Dağılımı</h3>
                    <div className="space-y-1">
                        {data?.mealTypeDistribution?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-800 dark:text-gray-100">{item.meal_type === 'breakfast' ? t('meals.breakfast') : item.meal_type === 'lunch' ? 'Öğle' : 'Akşam'}</span>
                                <span className="text-primary-600 font-medium">{item.count} rezervasyon</span>
                            </div>
                        )) || <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Veri yok</p>}
                    </div>
                </div>
            </div>

            {/* Cafeteria Utilization */}
            <div className="card mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FiCoffee className="text-orange-500" />
                    Kafeterya Kullanımı
                </h2>
                <div className="space-y-3">
                    {data?.cafeteriaUtilization?.length > 0 ? data.cafeteriaUtilization.map((cafe, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
                            <span className="text-gray-800 dark:text-gray-100 font-medium">{cafe.cafeteriaName}</span>
                            <span className="text-lg font-bold text-orange-500">{cafe.reservationCount} rezervasyon</span>
                        </div>
                    )) : <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Henüz rezervasyon verisi yok</p>}
                </div>
            </div>

            {/* Daily Counts */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FiTrendingUp className="text-primary-500" />
                    Günlük Kullanım
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                                <th className="p-3 font-semibold">{t('common.date')}</th>
                                <th className="p-3 font-semibold">Rezervasyon Sayısı</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.dailyMealCounts?.length > 0 ? data.dailyMealCounts.map((day, idx) => (
                                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                                    <td className="p-3 text-gray-800 dark:text-gray-100">{day.date}</td>
                                    <td className="p-3 text-primary-600 font-bold">{day.count}</td>
                                </tr>
                            )) : <tr><td colSpan={2} className="p-3 text-gray-500 dark:text-gray-400 dark:text-gray-500 text-center">Henüz veri yok</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MealAnalyticsPage;
