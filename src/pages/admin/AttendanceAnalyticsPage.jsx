import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiAlertTriangle, FiTrendingDown, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAttendanceAnalytics } from '../../services/analyticsService';
import { HorizontalBarChart, ProgressRingChart, DonutChart } from '../../components/charts';
import { useTranslation } from 'react-i18next';

const AttendanceAnalyticsPage = () => {
    const { t } = useTranslation();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await getAttendanceAnalytics();
            console.log('Attendance Analytics API Response:', response);
            if (response.success) {
                setData(response.data);
            } else {
                console.warn('API returned success: false', response);
                toast.error('Yoklama verileri alınamadı');
            }
        } catch (error) {
            toast.error('Yoklama verileri yüklenemedi');
            console.error('Attendance Analytics Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Demo data for fuller chart visualization
    const demoAttendanceData = [
        { courseCode: 'CSE101', courseName: 'Algoritma ve Programlama', attendanceRate: 92, totalRecords: 45 },
        { courseCode: 'CSE201', courseName: 'Veri Yapıları', attendanceRate: 87, totalRecords: 38 },
        { courseCode: 'MATH101', courseName: 'Matematik I', attendanceRate: 78, totalRecords: 52 },
        { courseCode: 'PHYS101', courseName: 'Fizik I', attendanceRate: 65, totalRecords: 40 },
        { courseCode: 'ENG101', courseName: 'İngilizce I', attendanceRate: 95, totalRecords: 30 },
        { courseCode: 'CSE301', courseName: 'Veritabanı Sistemleri', attendanceRate: 82, totalRecords: 35 },
    ];

    const demoLowAttendance = [
        { courseCode: 'PHYS101', courseName: 'Fizik I', attendanceRate: 65 },
        { courseCode: 'CHEM101', courseName: 'Kimya I', attendanceRate: 58 },
    ];

    // Check if we're in development mode
    const isDev = import.meta.env.DEV;

    // Transform attendance by course data for chart
    const attendanceChartData = useMemo(() => {
        const realData = data?.attendanceByCourse || [];
        // Only use demo data in development mode
        const sourceData = (realData.length >= 3 || !isDev) ? realData : [...realData, ...demoAttendanceData.slice(0, 6 - realData.length)];
        return sourceData.map(course => ({
            label: `${course.courseCode} - ${course.courseName}`,
            value: parseFloat(course.attendanceRate) || 0,
            totalRecords: course.totalRecords,
        }));
    }, [data, isDev]);

    // Low attendance courses for donut chart
    const lowAttendanceData = useMemo(() => {
        const realData = data?.lowAttendanceCourses || [];
        const sourceData = (realData.length >= 2 || !isDev) ? realData : [...realData, ...demoLowAttendance.slice(0, 3 - realData.length)];
        return sourceData.map(course => ({
            label: course.courseCode,
            value: parseFloat(course.attendanceRate) || 0,
        }));
    }, [data, isDev]);

    // Calculate summary stats
    const summaryStats = useMemo(() => {
        const realData = data?.attendanceByCourse || [];
        const sourceData = (realData.length >= 3 || !isDev) ? realData : [...realData, ...demoAttendanceData];

        const rates = sourceData.map(c => parseFloat(c.attendanceRate) || 0);
        const avgRate = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;

        return {
            avgRate: avgRate.toFixed(1),
            totalCourses: sourceData.length,
            lowCount: isDev ? ((data?.lowAttendanceCourses?.length || 0) + (data?.lowAttendanceCourses?.length < 2 ? demoLowAttendance.length : 0)) : (data?.lowAttendanceCourses?.length || 0),
            criticalStudents: isDev ? (data?.criticalAbsenceStudents?.length || 2) : (data?.criticalAbsenceStudents?.length || 0),
        };
    }, [data, isDev]);

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
                    <h1 className="font-display text-3xl font-bold text-gray-800 dark:text-gray-100">Yoklama Analizi</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">Devam oranları ve riskli öğrenciler</p>
                </div>
            </div>

            {/* Summary Stats with Progress Rings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="card flex flex-col items-center justify-center py-6">
                    <ProgressRingChart
                        value={parseFloat(summaryStats.avgRate)}
                        max={100}
                        size={100}
                        strokeWidth={10}
                        colorThresholds={{ success: 70, warning: 50 }}
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Ortalama Devam</p>
                </div>
                <div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <FiCheckCircle className="text-xl text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{summaryStats.totalCourses}</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">Toplam Ders</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-500/20 rounded-xl">
                            <FiTrendingDown className="text-xl text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{summaryStats.lowCount}</p>
                            <p className="text-sm text-red-600 dark:text-red-400">Düşük Devam</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-500/20 rounded-xl">
                            <FiAlertTriangle className="text-xl text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{summaryStats.criticalStudents}</p>
                            <p className="text-sm text-amber-600 dark:text-amber-400">Kritik Öğrenci</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance by Course Chart */}
            <HorizontalBarChart
                data={attendanceChartData}
                title="Ders Bazında Devam Oranları"
                valueKey="value"
                labelKey="label"
                maxValue={100}
                colorScheme="gradient"
                valueFormatter={(val) => `%${val.toFixed(0)}`}
                className="mb-8"
            />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Low Attendance Courses */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <FiTrendingDown className="text-red-500" />
                        Düşük Devam Oranlı Dersler (%70 altı)
                    </h2>
                    <div className="space-y-3">
                        {data?.lowAttendanceCourses?.length > 0 ? data.lowAttendanceCourses.map((course, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div>
                                    <span className="text-gray-800 dark:text-gray-100 font-medium">{course.courseCode}</span>
                                    <span className="text-gray-600 dark:text-gray-300 ml-2 text-sm">{course.courseName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-500 rounded-full transition-all duration-500"
                                            style={{ width: `${course.attendanceRate}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-lg font-bold text-red-600 dark:text-red-400 min-w-[50px] text-right">%{course.attendanceRate}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <FiCheckCircle className="mx-auto text-3xl text-emerald-500 mb-2" />
                                <p>Düşük devam oranlı ders yok 🎉</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Donut Chart */}
                {lowAttendanceData.length > 0 && (
                    <DonutChart
                        data={lowAttendanceData}
                        title="Düşük Devam Oranları Dağılımı"
                        valueKey="value"
                        labelKey="label"
                        size={180}
                        strokeWidth={30}
                        totalLabel="Ortalama %"
                        colors={['#EF4444', '#F97316', '#F59E0B', '#FBBF24', '#FCD34D']}
                    />
                )}
            </div>

            {/* Critical Absence Students */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FiAlertTriangle className="text-amber-500" />
                    Kritik Devamsızlık Oranı Olan Öğrenciler (%30 üstü)
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                                <th className="p-3 font-semibold">Öğrenci No</th>
                                <th className="p-3 font-semibold">Ad Soyad</th>
                                <th className="p-3 font-semibold">{t('auth.email')}</th>
                                <th className="p-3 font-semibold">Devamsızlık</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.criticalAbsenceStudents?.length > 0 ? data.criticalAbsenceStudents.map((student, idx) => (
                                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="p-3 text-gray-800 dark:text-gray-100">{student.studentNumber}</td>
                                    <td className="p-3 text-gray-800 dark:text-gray-100 font-medium">{student.firstName} {student.lastName}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">{student.email}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-red-500 rounded-full"
                                                    style={{ width: `${Math.min(student.absenceRate, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-red-600 dark:text-red-400 font-bold">%{student.absenceRate}</span>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center">
                                        <FiUsers className="mx-auto text-3xl text-emerald-500 mb-2" />
                                        <p className="text-gray-500 dark:text-gray-400">Kritik devamsızlığı olan öğrenci yok 🎉</p>
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

export default AttendanceAnalyticsPage;
