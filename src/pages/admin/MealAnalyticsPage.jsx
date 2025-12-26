import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCoffee, FiDollarSign, FiTrendingUp, FiSun, FiMoon } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getMealUsageAnalytics } from '../../services/analyticsService';
import { DonutChart, HorizontalBarChart, SensorBarChart } from '../../components/charts';
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

    // Demo data for fuller chart visualization
    const demoMealTypes = [
        { meal_type: 'breakfast', count: 145 },
        { meal_type: 'lunch', count: 280 },
        { meal_type: 'dinner', count: 195 },
    ];

    const demoCafeterias = [
        { cafeteriaName: 'Merkez Yemekhane', reservationCount: 320 },
        { cafeteriaName: 'Mühendislik Kafeterya', reservationCount: 185 },
        { cafeteriaName: 'Kütüphane Kafesi', reservationCount: 95 },
        { cafeteriaName: 'Spor Kompleksi', reservationCount: 65 },
    ];

    const demoDailyCounts = [
        { date: '2025-12-20', count: 156 },
        { date: '2025-12-21', count: 142 },
        { date: '2025-12-22', count: 189 },
        { date: '2025-12-23', count: 245 },
        { date: '2025-12-24', count: 178 },
        { date: '2025-12-25', count: 95 },
        { date: '2025-12-26', count: 210 },
    ];

    // Check if we're in development mode
    const isDev = import.meta.env.DEV;

    // Transform meal type distribution for donut chart
    const mealTypeData = useMemo(() => {
        const realData = data?.mealTypeDistribution || [];
        const sourceData = (realData.length >= 2 || !isDev) ? realData : demoMealTypes;
        const mealNames = {
            breakfast: 'Kahvaltı',
            lunch: 'Öğle',
            dinner: 'Akşam',
        };
        return sourceData.map(item => ({
            label: mealNames[item.meal_type] || item.meal_type,
            value: parseInt(item.count) || 0,
        }));
    }, [data, isDev]);

    // Transform cafeteria data for horizontal bar chart
    const cafeteriaData = useMemo(() => {
        const realData = data?.cafeteriaUtilization || [];
        const sourceData = (realData.length >= 2 || !isDev) ? realData : [...realData, ...demoCafeterias.slice(0, 4 - realData.length)];
        return sourceData.map(cafe => ({
            label: cafe.cafeteriaName,
            value: parseInt(cafe.reservationCount) || 0,
        }));
    }, [data, isDev]);

    // Transform daily counts for bar chart
    const dailyData = useMemo(() => {
        const realData = data?.dailyMealCounts || [];
        const sourceData = (realData.length >= 3 || !isDev) ? realData : [...realData, ...demoDailyCounts.slice(0, 7 - realData.length)];
        return sourceData.map(day => ({
            period: day.date,
            avg_value: parseInt(day.count) || 0,
            min_value: parseInt(day.count) || 0,
            max_value: parseInt(day.count) || 0,
            reading_count: 1,
        }));
    }, [data, isDev]);

    // Enhanced summary data
    const summaryData = useMemo(() => ({
        totalRevenue: isDev ? (data?.totalRevenue || 12450.50) : (data?.totalRevenue || 0),
        peakHours: isDev ? (data?.peakHours || {
            breakfast: '07:00 - 09:00',
            lunch: '11:30 - 13:30',
            dinner: '17:00 - 19:00',
        }) : (data?.peakHours || { breakfast: '-', lunch: '-', dinner: '-' }),
    }), [data, isDev]);

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Revenue Card */}
                <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30">
                            <FiDollarSign className="text-3xl text-white" />
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Toplam Gelir</p>
                            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                                {summaryData.totalRevenue.toFixed(2)} TL
                            </p>
                        </div>
                    </div>
                </div>

                {/* Peak Hours Card */}
                <div className="card">
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-3 flex items-center gap-2">
                        <FiSun className="text-amber-500" />
                        Yoğun Saatler
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <span className="text-amber-500">☀️</span>
                            <span className="text-gray-800 dark:text-gray-100 text-sm">Kahvaltı: <strong>{summaryData.peakHours.breakfast}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <span className="text-orange-500">🌞</span>
                            <span className="text-gray-800 dark:text-gray-100 text-sm">Öğle: <strong>{summaryData.peakHours.lunch}</strong></span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <span className="text-indigo-500">🌙</span>
                            <span className="text-gray-800 dark:text-gray-100 text-sm">Akşam: <strong>{summaryData.peakHours.dinner}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Meal Type Distribution Donut */}
                <DonutChart
                    data={mealTypeData}
                    title=""
                    valueKey="value"
                    labelKey="label"
                    size={140}
                    strokeWidth={25}
                    totalLabel="Rezervasyon"
                    showLegend={false}
                    colors={['#F59E0B', '#F97316', '#6366F1']}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Meal Type Donut with Legend */}
                <DonutChart
                    data={mealTypeData}
                    title="Öğün Dağılımı"
                    valueKey="value"
                    labelKey="label"
                    size={180}
                    strokeWidth={35}
                    totalLabel="Rezervasyon"
                    colors={['#F59E0B', '#F97316', '#6366F1']}
                />

                {/* Cafeteria Utilization */}
                <HorizontalBarChart
                    data={cafeteriaData}
                    title="Kafeterya Kullanımı"
                    valueKey="value"
                    labelKey="label"
                    colorScheme="gradient"
                    valueFormatter={(val) => `${val} rezervasyon`}
                />
            </div>

            {/* Daily Usage Chart */}
            {dailyData.length > 0 && (
                <SensorBarChart
                    data={dailyData}
                    title="Günlük Kullanım Grafiği"
                    unit="rezervasyon"
                    height={220}
                    colorScheme="gradient"
                    className="mb-8"
                />
            )}

            {/* Daily Counts Table */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FiTrendingUp className="text-primary-500" />
                    Günlük Kullanım Detayı
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                                <th className="p-3 font-semibold">{t('common.date')}</th>
                                <th className="p-3 font-semibold">Rezervasyon Sayısı</th>
                                <th className="p-3 font-semibold">Görsel</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.dailyMealCounts?.length > 0 ? data.dailyMealCounts.map((day, idx) => {
                                const maxCount = Math.max(...data.dailyMealCounts.map(d => d.count || 0));
                                const percentage = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                                return (
                                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-3 text-gray-800 dark:text-gray-100">{day.date}</td>
                                        <td className="p-3">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                                                {day.count}
                                            </span>
                                        </td>
                                        <td className="p-3 w-1/3">
                                            <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={3} className="p-6 text-center text-gray-500 dark:text-gray-400">
                                        Henüz veri yok
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MealAnalyticsPage;
