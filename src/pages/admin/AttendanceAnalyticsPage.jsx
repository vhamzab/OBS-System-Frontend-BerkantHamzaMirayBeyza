import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiAlertTriangle, FiTrendingDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAttendanceAnalytics } from '../../services/analyticsService';

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

            {/* Attendance by Course */}
            <div className="card mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FiCheckCircle className="text-emerald-500" />
                    Ders Bazında Devam Oranları
                </h2>
                <div className="space-y-3">
                    {data?.attendanceByCourse?.length > 0 ? data.attendanceByCourse.map((course, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
                            <div>
                                <span className="text-gray-800 dark:text-gray-100 font-medium">{course.courseCode}</span>
                                <span className="text-gray-600 dark:text-gray-300 ml-2">{course.courseName}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-600 dark:text-gray-300">{course.totalRecords} kayıt</span>
                                <span className={`text-lg font-bold ${parseFloat(course.attendanceRate) >= 70 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    %{course.attendanceRate}
                                </span>
                            </div>
                        </div>
                    )) : <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Henüz yoklama verisi yok</p>}
                </div>
            </div>

            {/* Low Attendance Courses */}
            <div className="card mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FiTrendingDown className="text-red-500" />
                    Düşük Devam Oranlı Dersler ({"%70"} altı)
                </h2>
                <div className="space-y-3">
                    {data?.lowAttendanceCourses?.length > 0 ? data.lowAttendanceCourses.map((course, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div>
                                <span className="text-gray-800 dark:text-gray-100 font-medium">{course.courseCode}</span>
                                <span className="text-gray-600 dark:text-gray-300 ml-2">{course.courseName}</span>
                            </div>
                            <span className="text-lg font-bold text-red-600">%{course.attendanceRate}</span>
                        </div>
                    )) : <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Düşük devam oranlı ders yok</p>}
                </div>
            </div>

            {/* Critical Absence Students */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FiAlertTriangle className="text-amber-500" />
                    Kritik Devamsızlık Oranı Olan Öğrenciler ({"%30"} üstü)
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
                                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                                    <td className="p-3 text-gray-800 dark:text-gray-100">{student.studentNumber}</td>
                                    <td className="p-3 text-gray-800 dark:text-gray-100">{student.firstName} {student.lastName}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">{student.email}</td>
                                    <td className="p-3 text-red-600 font-bold">%{student.absenceRate}</td>
                                </tr>
                            )) : <tr><td colSpan={4} className="p-3 text-gray-500 dark:text-gray-400 dark:text-gray-500 text-center">Kritik devamsızlığı olan öğrenci yok</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttendanceAnalyticsPage;
