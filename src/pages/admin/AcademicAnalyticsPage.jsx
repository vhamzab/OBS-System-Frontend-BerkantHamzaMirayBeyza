import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiTrendingUp, FiUsers, FiBarChart2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAcademicPerformance } from '../../services/analyticsService';

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

            {/* GPA by Department */}
            <div className="card mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FiBarChart2 className="text-blue-500" />
                    Bölümlere Göre Ortalama GPA
                </h2>
                <div className="space-y-3">
                    {data?.gpaByDepartment?.map((dept, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
                            <span className="text-gray-800 dark:text-gray-100">{dept.department || 'Bilinmeyen'}</span>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-600 dark:text-gray-300">{dept.studentCount} öğrenci</span>
                                <span className="text-lg font-bold text-emerald-600">{dept.averageGpa}</span>
                            </div>
                        </div>
                    )) || <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">{t('common.noData')}</p>}
                </div>
            </div>

            {/* Pass/Fail Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <FiTrendingUp className="text-emerald-500" />
                        Başarı Oranları
                    </h2>
                    <div className="flex justify-around">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-emerald-600">{data?.passFailRates?.passRate || 0}%</p>
                            <p className="text-gray-600 dark:text-gray-300">Geçen</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-red-600">{data?.passFailRates?.failRate || 0}%</p>
                            <p className="text-gray-600 dark:text-gray-300">Kalan</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <FiUsers className="text-amber-500" />
                        Risk Altındaki Öğrenciler
                    </h2>
                    <p className="text-4xl font-bold text-amber-600">{data?.atRiskStudents?.length || 0}</p>
                    <p className="text-gray-600 dark:text-gray-300">GPA {"<"} 2.0</p>
                </div>
            </div>

            {/* Top Students */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">En Başarılı Öğrenciler</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                                <th className="p-3 font-semibold">Öğrenci No</th>
                                <th className="p-3 font-semibold">Ad Soyad</th>
                                <th className="p-3 font-semibold">{t('profile.department')}</th>
                                <th className="p-3 font-semibold">GPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.topStudents?.slice(0, 5).map((student, idx) => (
                                <tr key={idx} className="border-b border-gray-100 dark:border-gray-700">
                                    <td className="p-3 text-gray-800 dark:text-gray-100">{student.studentNumber}</td>
                                    <td className="p-3 text-gray-800 dark:text-gray-100">{student.name}</td>
                                    <td className="p-3 text-gray-600 dark:text-gray-300">{student.department}</td>
                                    <td className="p-3 text-emerald-600 font-bold">{student.gpa}</td>
                                </tr>
                            )) || <tr><td colSpan={4} className="p-3 text-gray-500 dark:text-gray-400 dark:text-gray-500 text-center">{t('common.noData')}</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AcademicAnalyticsPage;
