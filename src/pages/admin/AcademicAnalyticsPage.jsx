import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiTrendingUp, FiUsers, FiBarChart2, FiAward } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAcademicPerformance } from '../../services/analyticsService';
import { HorizontalBarChart, DonutChart, ProgressRingChart } from '../../components/charts';
import { useTranslation } from 'react-i18next';

const AcademicAnalyticsPage = () => {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getAcademicPerformance();
            console.log('Academic Performance API Response:', response);
            if (response.success) {
                setData(response.data);
            } else {
                console.warn('API returned success: false', response);
                toast.error('Akademik veriler alınamadı');
            }
        } catch (error) {
            toast.error('Akademik veriler yüklenemedi');
            console.error('Academic Analytics Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Demo data for fuller chart visualization
    const demoGpaData = [
        { department: 'Bilgisayar Mühendisliği', averageGpa: 3.45, studentCount: 120 },
        { department: 'Elektrik-Elektronik Müh.', averageGpa: 3.28, studentCount: 95 },
        { department: 'Makine Mühendisliği', averageGpa: 3.12, studentCount: 85 },
        { department: 'İnşaat Mühendisliği', averageGpa: 3.05, studentCount: 78 },
        { department: 'İşletme', averageGpa: 3.35, studentCount: 150 },
        { department: 'Hukuk', averageGpa: 3.52, studentCount: 110 },
    ];

    const demoTopStudents = [
        { studentNumber: '2021001', name: 'Ahmet Yılmaz', department: 'Bilgisayar Müh.', gpa: 3.95 },
        { studentNumber: '2021015', name: 'Zeynep Kaya', department: 'Hukuk', gpa: 3.92 },
        { studentNumber: '2020042', name: 'Mehmet Demir', department: 'İşletme', gpa: 3.88 },
        { studentNumber: '2021078', name: 'Ayşe Çelik', department: 'Elektrik-Elektronik', gpa: 3.85 },
        { studentNumber: '2020156', name: 'Can Öztürk', department: 'Makine Müh.', gpa: 3.82 },
    ];

    // Check if we're in development mode
    const isDev = import.meta.env.DEV;

    // Transform data for charts
    const gpaChartData = useMemo(() => {
        const realData = data?.gpaByDepartment || [];
        const sourceData = (realData.length >= 3 || !isDev) ? realData : [...realData, ...demoGpaData.slice(0, 6 - realData.length)];
        return sourceData.map(dept => ({
            label: dept.department || 'Bilinmeyen',
            value: parseFloat(dept.averageGpa) || 0,
            studentCount: dept.studentCount,
        }));
    }, [data, isDev]);

    // GPA distribution for donut chart
    const gpaDistributionData = useMemo(() => {
        const realData = data?.gpaByDepartment || [];
        const sourceData = (realData.length >= 3 || !isDev) ? realData : [...realData, ...demoGpaData.slice(0, 6 - realData.length)];
        return sourceData.map(dept => ({
            label: dept.department || 'Bilinmeyen',
            value: dept.studentCount,
        }));
    }, [data, isDev]);

    // Combined top students data
    const topStudentsData = useMemo(() => {
        const realData = data?.topStudents || [];
        return (realData.length >= 3 || !isDev) ? realData : [...realData, ...demoTopStudents.slice(0, 5 - realData.length)];
    }, [data, isDev]);

    // Enhanced pass/fail data
    const passFailData = useMemo(() => {
        return {
            passRate: isDev ? (data?.passFailRates?.passRate || 85) : (data?.passFailRates?.passRate || 0),
            failRate: isDev ? (data?.passFailRates?.failRate || 15) : (data?.passFailRates?.failRate || 0),
        };
    }, [data, isDev]);

    const atRiskCount = isDev ? (data?.atRiskStudents?.length || 8) : (data?.atRiskStudents?.length || 0);

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
                    <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-gray-100">Akademik Performans</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">GPA dağılımı ve başarı oranları</p>
                </div>
            </div>

            {/* Summary Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                            <FiTrendingUp className="text-xl text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{passFailData.passRate}%</p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400">Geçen</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-500/20 rounded-xl">
                            <FiBarChart2 className="text-xl text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{passFailData.failRate}%</p>
                            <p className="text-sm text-red-600 dark:text-red-400">Kalan</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-500/20 rounded-xl">
                            <FiUsers className="text-xl text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{atRiskCount}</p>
                            <p className="text-sm text-amber-600 dark:text-amber-400">Risk Altında</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <FiAward className="text-xl text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{topStudentsData.length}</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">En Başarılı</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Pass/Fail Progress Rings */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <FiTrendingUp className="text-emerald-500" />
                        Başarı Oranları
                    </h2>
                    <div className="flex justify-around items-center py-4">
                        <ProgressRingChart
                            value={passFailData.passRate}
                            max={100}
                            size={140}
                            strokeWidth={14}
                            title="Geçen"
                            colorThresholds={{ success: 60, warning: 40 }}
                        />
                        <ProgressRingChart
                            value={passFailData.failRate}
                            max={100}
                            size={140}
                            strokeWidth={14}
                            title="Kalan"
                            colorThresholds={{ success: 0, warning: 20 }}
                        />
                    </div>
                </div>

                {/* Student Distribution Donut */}
                <DonutChart
                    data={gpaDistributionData}
                    title="Bölüm Bazında Öğrenci Dağılımı"
                    valueKey="value"
                    labelKey="label"
                    size={180}
                    strokeWidth={35}
                    totalLabel="Öğrenci"
                />
            </div>

            {/* GPA by Department - Horizontal Bar Chart */}
            <HorizontalBarChart
                data={gpaChartData}
                title="Bölümlere Göre Ortalama GPA"
                valueKey="value"
                labelKey="label"
                maxValue={4.0}
                colorScheme="rainbow"
                valueFormatter={(val) => val.toFixed(2)}
                className="mb-8"
            />

            {/* Top Students Table */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FiAward className="text-amber-500" />
                    En Başarılı Öğrenciler
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                                <th className="p-3 font-semibold">Sıra</th>
                                <th className="p-3 font-semibold">Öğrenci No</th>
                                <th className="p-3 font-semibold">Ad Soyad</th>
                                <th className="p-3 font-semibold">{t('profile.department')}</th>
                                <th className="p-3 font-semibold">GPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topStudentsData.slice(0, 5).map((student, idx) => (
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
                                    <td className="p-3 text-gray-800 dark:text-gray-100">{student.studentNumber}</td>
                                    <td className="p-3 text-gray-800 dark:text-gray-100 font-medium">{student.name}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">{student.department}</td>
                                    <td className="p-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                            {student.gpa}
                                        </span>
                                    </td>
                                </tr>
                            )) || <tr><td colSpan={5} className="p-3 text-gray-500 dark:text-gray-400 text-center">{t('common.noData')}</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AcademicAnalyticsPage;
