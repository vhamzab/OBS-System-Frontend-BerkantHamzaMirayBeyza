import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiUsers, FiCheckCircle, FiTrendingUp, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getEventAnalytics } from '../../services/analyticsService';
import { DonutChart, HorizontalBarChart, ProgressRingChart } from '../../components/charts';
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

    // Demo data for fuller chart visualization
    const demoCategories = [
        { category: 'Social', count: 12 },
        { category: 'Sports', count: 8 },
        { category: 'Academic', count: 15 },
        { category: 'Career', count: 6 },
        { category: 'Cultural', count: 9 },
    ];

    const demoPopularEvents = [
        { title: 'Kariyer Günleri 2024', category: 'Career', capacity: 500, registrationCount: 385 },
        { title: 'Bahar Şenliği', category: 'Social', capacity: 2000, registrationCount: 1250 },
        { title: 'Yapay Zeka Konferansı', category: 'Academic', capacity: 300, registrationCount: 278 },
        { title: 'Basketbol Turnuvası', category: 'Sports', capacity: 200, registrationCount: 156 },
        { title: 'Tiyatro Gösterisi', category: 'Cultural', capacity: 400, registrationCount: 320 },
        { title: 'Hackathon 2024', category: 'Academic', capacity: 150, registrationCount: 142 },
    ];

    // Check if we're in development mode
    const isDev = import.meta.env.DEV;

    // Transform category data for donut chart
    const categoryData = useMemo(() => {
        const realData = data?.categoryBreakdown || [];
        const sourceData = (realData.length >= 3 || !isDev) ? realData : demoCategories;
        return sourceData.map(cat => ({
            label: cat.category || 'Diğer',
            value: parseInt(cat.count) || 0,
        }));
    }, [data, isDev]);

    // Transform popular events for horizontal bar chart
    const popularEventsData = useMemo(() => {
        const realData = data?.popularEvents || [];
        const sourceData = (realData.length >= 3 || !isDev) ? realData : [...realData, ...demoPopularEvents.slice(0, 6 - realData.length)];
        return sourceData.slice(0, 6).map(event => ({
            label: event.title,
            value: parseInt(event.registrationCount) || 0,
            capacity: event.capacity,
            category: event.category,
        }));
    }, [data, isDev]);

    // Enhanced summary data
    const summaryData = useMemo(() => ({
        registrationRate: isDev ? (data?.registrationRate || 42) : (data?.registrationRate || 0),
        checkInRate: isDev ? (data?.checkInRate || 78) : (data?.checkInRate || 0),
        popularEvents: popularEventsData.length > 0 ? popularEventsData : (isDev ? demoPopularEvents : []),
    }), [data, popularEventsData, isDev]);

    // Category colors
    const categoryColors = [
        '#8B5CF6', // purple - Social
        '#10B981', // green - Sports
        '#3B82F6', // blue - Academic
        '#F59E0B', // amber - Career
        '#EC4899', // pink - Cultural
        '#06B6D4', // cyan - Other
    ];

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

            {/* Summary Stats with Progress Rings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Registration Rate */}
                <div className="card flex items-center gap-6">
                    <ProgressRingChart
                        value={summaryData.registrationRate}
                        max={100}
                        size={120}
                        strokeWidth={12}
                        colorThresholds={{ success: 50, warning: 25 }}
                    />
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Kayıt Oranı</p>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                            %{summaryData.registrationRate}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Toplam kapasiteye göre</p>
                    </div>
                </div>

                {/* Check-in Rate */}
                <div className="card flex items-center gap-6">
                    <ProgressRingChart
                        value={summaryData.checkInRate}
                        max={100}
                        size={120}
                        strokeWidth={12}
                        colorThresholds={{ success: 70, warning: 40 }}
                    />
                    <div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Check-in Oranı</p>
                        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                            %{summaryData.checkInRate}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Kayıtlılara göre</p>
                    </div>
                </div>

                {/* Total Events Card */}
                <div className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30">
                            <FiCalendar className="text-3xl text-white" />
                        </div>
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">Toplam Etkinlik</p>
                            <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                                {categoryData.reduce((sum, cat) => sum + cat.value, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Category Distribution Donut */}
                <DonutChart
                    data={categoryData}
                    title="Kategori Dağılımı"
                    valueKey="value"
                    labelKey="label"
                    size={200}
                    strokeWidth={40}
                    totalLabel="Etkinlik"
                    colors={categoryColors}
                />

                {/* Category Cards Grid */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Kategoriler</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {categoryData.map((cat, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                style={{
                                    borderColor: categoryColors[idx % categoryColors.length],
                                    backgroundColor: `${categoryColors[idx % categoryColors.length]}10`
                                }}
                            >
                                <p
                                    className="text-3xl font-bold"
                                    style={{ color: categoryColors[idx % categoryColors.length] }}
                                >
                                    {cat.value}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm capitalize">{cat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popular Events Bar Chart */}
            <HorizontalBarChart
                data={popularEventsData}
                title="En Popüler Etkinlikler (Kayıt Sayısı)"
                valueKey="value"
                labelKey="label"
                colorScheme="rainbow"
                valueFormatter={(val) => `${val} kayıt`}
                className="mb-8"
            />

            {/* Popular Events Table */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FiStar className="text-amber-500" />
                    En Popüler Etkinlikler
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                                <th className="p-3 font-semibold">Sıra</th>
                                <th className="p-3 font-semibold">Etkinlik</th>
                                <th className="p-3 font-semibold">{t('events.category')}</th>
                                <th className="p-3 font-semibold">{t('courses.capacity')}</th>
                                <th className="p-3 font-semibold">Kayıt</th>
                                <th className="p-3 font-semibold">Doluluk</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.popularEvents?.length > 0 ? data.popularEvents.map((event, idx) => {
                                const fillRate = event.capacity > 0 ? (event.registrationCount / event.capacity) * 100 : 0;
                                return (
                                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-3">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' :
                                                idx === 1 ? 'bg-gray-200 text-gray-700' :
                                                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-800 dark:text-gray-100 font-medium">{event.title}</td>
                                        <td className="p-3">
                                            <span
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                                                style={{
                                                    backgroundColor: `${categoryColors[categoryData.findIndex(c => c.label.toLowerCase() === event.category?.toLowerCase()) % categoryColors.length]}20`,
                                                    color: categoryColors[categoryData.findIndex(c => c.label.toLowerCase() === event.category?.toLowerCase()) % categoryColors.length]
                                                }}
                                            >
                                                {event.category}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-600 dark:text-gray-300">{event.capacity}</td>
                                        <td className="p-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400">
                                                {event.registrationCount}
                                            </span>
                                        </td>
                                        <td className="p-3 w-32">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${fillRate >= 80 ? 'bg-emerald-500' :
                                                            fillRate >= 50 ? 'bg-amber-500' :
                                                                'bg-red-500'
                                                            }`}
                                                        style={{ width: `${Math.min(fillRate, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[35px]">
                                                    {fillRate.toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-gray-500 dark:text-gray-400">
                                        Henüz etkinlik yok
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

export default EventAnalyticsPage;
