import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBookOpen, FiCheck, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { useTranslation } from 'react-i18next';
const DepartmentSelectionPage = () => {
  const { t } = useTranslation();
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllDepartments();
            if (response.success) {
                setDepartments(response.data);
            }
        } catch (error) {
            toast.error('Bölümler yüklenirken hata oluştu');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedDepartment) {
            toast.error('Lütfen bir bölüm seçin');
            return;
        }

        try {
            setSubmitting(true);
            const response = await userService.updateStudentDepartment(selectedDepartment);
            if (response.success) {
                toast.success('Bölüm başarıyla seçildi!');
                // Update local storage user data
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.departmentId = selectedDepartment;
                localStorage.setItem('user', JSON.stringify(user));
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Bölüm kaydedilirken hata oluştu');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-lg w-full">
                <div className="card p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
                            <FiBookOpen className="w-8 h-8 text-primary-400" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Bölüm Seçimi</h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Ders kaydı yapabilmek için önce bölümünüzü seçmeniz gerekmektedir.
                        </p>
                    </div>

                    <div className="space-y-3 mb-8">
                        {departments.map((dept) => (
                            <button
                                key={dept.id}
                                onClick={() => setSelectedDepartment(dept.id)}
                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedDepartment === dept.id
                                        ? 'border-primary-500 bg-primary-500/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold">{dept.name}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-300">{dept.faculty}</div>
                                    </div>
                                    {selectedDepartment === dept.id && (
                                        <FiCheck className="w-5 h-5 text-primary-400" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!selectedDepartment || submitting}
                        className="btn btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <>
                                Devam Et <FiArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepartmentSelectionPage;
