import { useState, useEffect } from 'react';
import { FiBook, FiPlus, FiEdit2, FiSearch, FiFilter, FiUsers, FiSave, FiX, FiHash } from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import userService from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [saving, setSaving] = useState(false);
    const [filters, setFilters] = useState({
        department_id: '',
        search: '',
    });
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        credits: 3,
        ects: 5,
        department_id: '',
    });

    useEffect(() => {
        fetchData();
    }, [filters.department_id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [coursesRes, deptsRes] = await Promise.all([
                courseService.getCourses({
                    department_id: filters.department_id || undefined,
                    limit: 100,
                }),
                userService.getAllDepartments(),
            ]);

            if (coursesRes.success) {
                setCourses(coursesRes.data?.courses || []);
            }
            if (deptsRes.success) {
                setDepartments(deptsRes.data || []);
            }
        } catch (error) {
            toast.error('Veriler yüklenirken hata oluştu');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchData();
    };

    const handleOpenModal = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({
                code: course.code,
                name: course.name,
                description: course.description || '',
                credits: course.credits,
                ects: course.ects,
                department_id: course.department_id || '',
            });
        } else {
            setEditingCourse(null);
            setFormData({
                code: '',
                name: '',
                description: '',
                credits: 3,
                ects: 5,
                department_id: '',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCourse(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code || !formData.name) {
            toast.error('Ders kodu ve adı zorunludur');
            return;
        }

        setSaving(true);
        try {
            if (editingCourse) {
                await courseService.updateCourse(editingCourse.id, formData);
                toast.success('Ders güncellendi');
            } else {
                await courseService.createCourse(formData);
                toast.success('Ders oluşturuldu');
            }
            handleCloseModal();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'İşlem sırasında hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const filteredCourses = courses.filter((course) => {
        if (!filters.search) return true;
        const searchLower = filters.search.toLowerCase();
        return (
            course.code?.toLowerCase().includes(searchLower) ||
            course.name?.toLowerCase().includes(searchLower)
        );
    });

    if (loading && courses.length === 0) {
        return (
            <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-sans text-3xl font-bold mb-2">Ders Yönetimi</h1>
                    <p className="text-slate-400">Tüm dersleri görüntüleyin ve yönetin</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary"
                >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Yeni Ders
                </button>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <FiFilter className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">Filtreler:</span>
                    </div>

                    <select
                        value={filters.department_id}
                        onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
                        className="input w-48"
                    >
                        <option value="">Tüm Bölümler</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>

                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Ders kodu veya adı ara..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="input pl-10 w-full"
                            />
                        </div>
                    </div>
                </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="card text-center py-4">
                    <div className="text-2xl font-bold text-white">{courses.length}</div>
                    <div className="text-sm text-slate-400">Toplam Ders</div>
                </div>
                <div className="card text-center py-4">
                    <div className="text-2xl font-bold text-blue-400">
                        {courses.filter(c => c.code?.startsWith('CSE')).length}
                    </div>
                    <div className="text-sm text-slate-400">Bilgisayar Müh.</div>
                </div>
                <div className="card text-center py-4">
                    <div className="text-2xl font-bold text-green-400">
                        {courses.filter(c => c.code?.startsWith('MATH')).length}
                    </div>
                    <div className="text-sm text-slate-400">Matematik</div>
                </div>
                <div className="card text-center py-4">
                    <div className="text-2xl font-bold text-accent-400">
                        {courses.filter(c => c.credits >= 4).length}
                    </div>
                    <div className="text-sm text-slate-400">4+ Kredi Ders</div>
                </div>
            </div>

            {/* Courses Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700/50">
                                <th className="text-left p-4 font-medium text-slate-400">Ders</th>
                                <th className="text-left p-4 font-medium text-slate-400">Bölüm</th>
                                <th className="text-center p-4 font-medium text-slate-400">Kredi</th>
                                <th className="text-center p-4 font-medium text-slate-400">ECTS</th>
                                <th className="text-center p-4 font-medium text-slate-400">Durum</th>
                                <th className="text-right p-4 font-medium text-slate-400">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredCourses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400">
                                        Ders bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                                                    <FiBook className="w-5 h-5 text-primary-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{course.code}</div>
                                                    <div className="text-sm text-slate-400 max-w-xs truncate">{course.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-slate-300">
                                                {course.department?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-1 rounded bg-primary-100 border-2 border-primary-300 text-primary-700 text-sm font-medium shadow-sm">
                                                {course.credits}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-1 rounded bg-accent-100 border-2 border-accent-300 text-accent-700 text-sm font-medium shadow-sm">
                                                {course.ects}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.isActive !== false
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {course.isActive !== false ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleOpenModal(course)}
                                                className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                                                title="Düzenle"
                                            >
                                                <FiEdit2 className="w-4 h-4 text-slate-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="card w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-sans text-xl font-semibold">
                                {editingCourse ? 'Ders Düzenle' : 'Yeni Ders'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Ders Kodu</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="Örn: CSE101"
                                        className="input w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Bölüm</label>
                                    <select
                                        value={formData.department_id}
                                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                        className="input w-full"
                                    >
                                        <option value="">Seçiniz</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Ders Adı</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Örn: Programlamaya Giriş"
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Açıklama</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ders açıklaması..."
                                    className="input w-full h-24 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Kredi</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.credits}
                                        onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                                        className="input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">ECTS</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={formData.ects}
                                        onChange={(e) => setFormData({ ...formData, ects: parseInt(e.target.value) })}
                                        className="input w-full"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="btn btn-secondary flex-1"
                                    disabled={saving}
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-1"
                                    disabled={saving}
                                >
                                    {saving ? <LoadingSpinner size="sm" /> : (
                                        <>
                                            <FiSave className="w-4 h-4 mr-2" />
                                            Kaydet
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoursesPage;
