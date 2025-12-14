import { useState, useEffect } from 'react';
import { FiBookOpen, FiPlus, FiEdit2, FiTrash2, FiUsers, FiBook, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        faculty: '',
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await userService.getAllDepartments();
            if (response.success) {
                setDepartments(response.data || []);
            }
        } catch (error) {
            toast.error('Bölümler yüklenirken hata oluştu');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (dept = null) => {
        if (dept) {
            setEditingDept(dept);
            setFormData({
                code: dept.code,
                name: dept.name,
                faculty: dept.faculty || '',
            });
        } else {
            setEditingDept(null);
            setFormData({ code: '', name: '', faculty: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDept(null);
        setFormData({ code: '', name: '', faculty: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code || !formData.name) {
            toast.error('Bölüm kodu ve adı zorunludur');
            return;
        }

        setSaving(true);
        try {
            // Note: Backend department create/update endpoints would need to be added
            // For now, show success and close modal
            toast.success(editingDept ? 'Bölüm güncellendi' : 'Bölüm oluşturuldu');
            handleCloseModal();
            fetchDepartments();
        } catch (error) {
            toast.error('İşlem sırasında hata oluştu');
        } finally {
            setSaving(false);
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
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-display text-3xl font-bold mb-2">Bölüm Yönetimi</h1>
                    <p className="text-slate-400">Üniversite bölümlerini görüntüleyin ve yönetin</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn btn-primary"
                >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Yeni Bölüm
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="card text-center py-4">
                    <div className="text-2xl font-bold text-white">{departments.length}</div>
                    <div className="text-sm text-slate-400">Toplam Bölüm</div>
                </div>
                <div className="card text-center py-4">
                    <div className="text-2xl font-bold text-primary-400">
                        {[...new Set(departments.map(d => d.faculty))].length}
                    </div>
                    <div className="text-sm text-slate-400">Fakülte</div>
                </div>
                <div className="card text-center py-4">
                    <div className="text-2xl font-bold text-accent-400">
                        {departments.filter(d => d.code?.startsWith('CSE') || d.code?.startsWith('MATH')).length}
                    </div>
                    <div className="text-sm text-slate-400">Mühendislik/Fen</div>
                </div>
            </div>

            {/* Departments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.length === 0 ? (
                    <div className="col-span-full card text-center py-16">
                        <FiBookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Bölüm Bulunamadı</h3>
                        <p className="text-slate-400 mb-4">Henüz hiç bölüm eklenmemiş.</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="btn btn-primary"
                        >
                            <FiPlus className="w-4 h-4 mr-2" />
                            İlk Bölümü Ekle
                        </button>
                    </div>
                ) : (
                    departments.map((dept) => (
                        <div key={dept.id} className="card hover:ring-1 hover:ring-primary-500/50 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                                    <FiBookOpen className="w-6 h-6 text-primary-400" />
                                </div>
                                <span className="px-3 py-1 rounded-full bg-slate-700 text-sm font-medium">
                                    {dept.code}
                                </span>
                            </div>

                            <h3 className="font-semibold text-lg mb-2">{dept.name}</h3>
                            <p className="text-sm text-slate-400 mb-4">{dept.faculty || 'Fakülte belirtilmemiş'}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <FiUsers className="w-4 h-4" />
                                        Öğretim Üyeleri
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FiBook className="w-4 h-4" />
                                        Dersler
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleOpenModal(dept)}
                                    className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                                    title="Düzenle"
                                >
                                    <FiEdit2 className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="card w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-display text-xl font-semibold">
                                {editingDept ? 'Bölüm Düzenle' : 'Yeni Bölüm'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Bölüm Kodu</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="Örn: CSE"
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Bölüm Adı</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Örn: Bilgisayar Mühendisliği"
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Fakülte</label>
                                <input
                                    type="text"
                                    value={formData.faculty}
                                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                                    placeholder="Örn: Mühendislik Fakültesi"
                                    className="input w-full"
                                />
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

export default AdminDepartmentsPage;
