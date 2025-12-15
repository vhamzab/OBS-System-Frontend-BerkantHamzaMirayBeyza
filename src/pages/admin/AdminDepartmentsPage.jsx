import { useState, useEffect } from 'react';
import { FiBookOpen, FiPlus, FiEdit2, FiTrash2, FiUsers, FiBook, FiSave, FiX, FiAlertCircle, FiDatabase } from 'react-icons/fi';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDepartmentsPage = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [seeding, setSeeding] = useState(false);
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
            let response;
            if (editingDept) {
                // Update existing department
                response = await userService.updateDepartment(editingDept.id, formData);
            } else {
                // Create new department
                response = await userService.createDepartment(formData);
            }

            if (response.success) {
                toast.success(response.message || (editingDept ? 'Bölüm güncellendi' : 'Bölüm oluşturuldu'));
                handleCloseModal();
                fetchDepartments();
            } else {
                toast.error(response.message || 'İşlem sırasında hata oluştu');
            }
        } catch (error) {
            console.error('Department save error:', error);
            toast.error(error.response?.data?.message || 'İşlem sırasında hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (deptId) => {
        setDeleting(true);
        try {
            const response = await userService.deleteDepartment(deptId);
            if (response.success) {
                toast.success(response.message || 'Bölüm silindi');
                setShowDeleteModal(null);
                fetchDepartments();
            } else {
                toast.error(response.message || 'Bölüm silinirken hata oluştu');
            }
        } catch (error) {
            console.error('Delete department error:', error);
            toast.error(error.response?.data?.message || 'Bölüm silinirken hata oluştu');
        } finally {
            setDeleting(false);
        }
    };

    const handleSeedDepartments = async () => {
        if (seeding) return;
        
        setSeeding(true);
        try {
            const response = await userService.seedDepartments();
            if (response.success) {
                toast.success(`${response.data?.added || 0} bölüm eklendi, ${response.data?.updated || 0} bölüm aktif edildi`);
                fetchDepartments();
            } else {
                toast.error(response.message || 'Bölümler eklenirken hata oluştu');
            }
        } catch (error) {
            console.error('Seed departments error:', error);
            toast.error(error.response?.data?.message || 'Bölümler eklenirken hata oluştu');
        } finally {
            setSeeding(false);
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
                    <h1 className="font-display text-3xl font-bold mb-2 text-gray-800">Bölüm Yönetimi</h1>
                    <p className="text-gray-500">Üniversite bölümlerini görüntüleyin ve yönetin</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSeedDepartments}
                        disabled={seeding}
                        className="btn btn-secondary"
                        title="26 adet hazır bölüm ekle"
                    >
                        {seeding ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <>
                                <FiDatabase className="w-4 h-4 mr-2" />
                                Tüm Bölümleri Ekle
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn btn-primary"
                    >
                        <FiPlus className="w-4 h-4 mr-2" />
                        Yeni Bölüm
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="card text-center py-4">
                    <div className="text-2xl font-bold text-gray-800">{departments.length}</div>
                    <div className="text-sm text-gray-500">Toplam Bölüm</div>
                </div>
                <div className="card text-center py-4">
                    <div className="text-2xl font-bold text-primary-600">
                        {[...new Set(departments.map(d => d.faculty))].length}
                    </div>
                    <div className="text-sm text-gray-500">Fakülte</div>
                </div>
                <div className="card text-center py-4">
                    <div className="text-2xl font-bold text-green-600">
                        {departments.filter(d => d.code?.startsWith('CSE') || d.code?.startsWith('MATH')).length}
                    </div>
                    <div className="text-sm text-gray-500">Mühendislik/Fen</div>
                </div>
            </div>

            {/* Departments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.length === 0 ? (
                    <div className="col-span-full card text-center py-16">
                        <FiBookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2 text-gray-800">Bölüm Bulunamadı</h3>
                        <p className="text-gray-500 mb-4">Henüz hiç bölüm eklenmemiş.</p>
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
                        <div key={dept.id} className="card hover:ring-1 hover:ring-primary-300 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                    <FiBookOpen className="w-6 h-6 text-primary-600" />
                                </div>
                                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                                    {dept.code}
                                </span>
                            </div>

                            <h3 className="font-semibold text-lg mb-2 text-gray-800">{dept.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{dept.faculty || 'Fakülte belirtilmemiş'}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <FiUsers className="w-4 h-4" />
                                        Öğretim Üyeleri
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FiBook className="w-4 h-4" />
                                        Dersler
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleOpenModal(dept)}
                                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                        title="Düzenle"
                                    >
                                        <FiEdit2 className="w-4 h-4 text-gray-500" />
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteModal(dept)}
                                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                        title="Sil"
                                    >
                                        <FiTrash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="card w-full max-w-md mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                <FiAlertCircle className="w-5 h-5 text-red-500" />
                            </div>
                            <h3 className="font-display text-xl font-semibold text-gray-800">Bölümü Sil</h3>
                        </div>

                        <p className="text-gray-600 mb-4">
                            <strong className="text-gray-800">{showDeleteModal.name}</strong> bölümünü silmek istediğinizden emin misiniz?
                        </p>
                        <p className="text-sm text-amber-600 mb-6">
                            Bu işlem geri alınamaz. Bölüme bağlı öğrenci, öğretim üyesi veya ders varsa silme işlemi başarısız olur.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="btn btn-secondary"
                                disabled={deleting}
                            >
                                İptal
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteModal.id)}
                                className="btn bg-red-500 hover:bg-red-600 text-white"
                                disabled={deleting}
                            >
                                {deleting ? <LoadingSpinner size="sm" /> : 'Sil'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="card w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-display text-xl font-semibold text-gray-800">
                                {editingDept ? 'Bölüm Düzenle' : 'Yeni Bölüm'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <FiX className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700">Bölüm Kodu</label>
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
                                <label className="block text-sm font-medium mb-2 text-gray-700">Bölüm Adı</label>
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
                                <label className="block text-sm font-medium mb-2 text-gray-700">Fakülte</label>
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
