import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiBook, FiUser, FiUsers, FiEdit2, FiPlus,
    FiFilter, FiSearch, FiCalendar, FiMapPin
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import userService from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminSectionsPage = () => {
    const navigate = useNavigate();
    const [sections, setSections] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState('');

    // Filters
    const [filters, setFilters] = useState({
        semester: '',
        year: new Date().getFullYear(),
        search: '',
    });

    useEffect(() => {
        fetchData();
    }, [filters.semester, filters.year]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [sectionsRes, facultyRes] = await Promise.all([
                courseService.getSections({
                    semester: filters.semester,
                    year: filters.year,
                    limit: 100
                }),
                userService.getAllFaculty(),
            ]);

            if (sectionsRes.success) {
                setSections(sectionsRes.data?.sections || []);
            }
            if (facultyRes.success) {
                setFaculty(facultyRes.data || []);
            }
        } catch (error) {
            toast.error('Veriler yüklenirken hata oluştu');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignInstructor = (section) => {
        setSelectedSection(section);
        setSelectedInstructor(section.instructor?.id || '');
        setShowAssignModal(true);
    };

    const handleSaveAssignment = async () => {
        if (!selectedSection) return;

        try {
            setSaving(true);
            const response = await courseService.updateSection(selectedSection.id, {
                instructor_id: selectedInstructor || null,
            });

            if (response.success) {
                toast.success('Öğretim üyesi ataması güncellendi');
                setShowAssignModal(false);
                fetchData(); // Refresh list
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Atama güncellenirken hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const filteredSections = sections.filter(section => {
        if (!filters.search) return true;
        const searchLower = filters.search.toLowerCase();
        return (
            section.course?.code?.toLowerCase().includes(searchLower) ||
            section.course?.name?.toLowerCase().includes(searchLower) ||
            section.instructor?.name?.toLowerCase().includes(searchLower)
        );
    });

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
                    <h1 className="font-display text-3xl font-bold mb-2">Section Yönetimi</h1>
                    <p className="text-slate-400">Derslere öğretim üyesi atayın ve section'ları yönetin</p>
                </div>
                <button
                    onClick={() => navigate('/admin/sections/create')}
                    className="btn btn-primary"
                >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Yeni Section
                </button>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <FiFilter className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-400">Filtreler:</span>
                    </div>

                    <select
                        value={filters.semester}
                        onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                        className="input w-40"
                    >
                        <option value="">Tüm Dönemler</option>
                        <option value="fall">Güz</option>
                        <option value="spring">Bahar</option>
                        <option value="summer">Yaz</option>
                    </select>

                    <select
                        value={filters.year}
                        onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                        className="input w-32"
                    >
                        {[2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Ders kodu, adı veya öğretim üyesi ara..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="input pl-10 w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sections List */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700/50">
                                <th className="text-left p-4 font-medium text-slate-400">Ders</th>
                                <th className="text-left p-4 font-medium text-slate-400">Section</th>
                                <th className="text-left p-4 font-medium text-slate-400">Dönem</th>
                                <th className="text-left p-4 font-medium text-slate-400">Öğretim Üyesi</th>
                                <th className="text-left p-4 font-medium text-slate-400">Derslik</th>
                                <th className="text-left p-4 font-medium text-slate-400">Kapasite</th>
                                <th className="text-left p-4 font-medium text-slate-400">Durum</th>
                                <th className="text-right p-4 font-medium text-slate-400">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredSections.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-400">
                                        Hiç section bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                filteredSections.map((section) => (
                                    <tr key={section.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                                    <FiBook className="w-5 h-5 text-primary-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{section.course?.code}</div>
                                                    <div className="text-sm text-slate-400 truncate max-w-[200px]">
                                                        {section.course?.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded bg-slate-700 text-sm">
                                                Section {section.sectionNumber}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <FiCalendar className="w-4 h-4 text-slate-400" />
                                                <span>
                                                    {section.year} {section.semester === 'fall' ? 'Güz' : section.semester === 'spring' ? 'Bahar' : 'Yaz'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {section.instructor ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center">
                                                        <FiUser className="w-4 h-4 text-accent-400" />
                                                    </div>
                                                    <span className="text-sm">{section.instructor.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-amber-400 text-sm flex items-center gap-1">
                                                    <FiUser className="w-4 h-4" />
                                                    Atanmamış
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {section.classroom ? (
                                                <div className="flex items-center gap-1 text-sm">
                                                    <FiMapPin className="w-4 h-4 text-slate-400" />
                                                    {section.classroom.location}
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-sm">
                                                <FiUsers className="w-4 h-4 text-slate-400" />
                                                <span>{section.enrolledCount}/{section.capacity}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs ${section.isActive
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {section.isActive ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleAssignInstructor(section)}
                                                className="btn btn-secondary btn-sm"
                                            >
                                                <FiEdit2 className="w-4 h-4 mr-1" />
                                                Ata
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assignment Modal */}
            {showAssignModal && selectedSection && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="card w-full max-w-md mx-4">
                        <h3 className="font-display text-xl font-semibold mb-4">
                            Öğretim Üyesi Ata
                        </h3>

                        <div className="mb-4 p-3 rounded-lg bg-slate-800/50">
                            <div className="font-medium">{selectedSection.course?.code}</div>
                            <div className="text-sm text-slate-400">{selectedSection.course?.name}</div>
                            <div className="text-sm text-slate-400">Section {selectedSection.sectionNumber}</div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Öğretim Üyesi Seçin
                            </label>
                            <select
                                value={selectedInstructor}
                                onChange={(e) => setSelectedInstructor(e.target.value)}
                                className="input w-full"
                            >
                                <option value="">-- Öğretim Üyesi Yok --</option>
                                {faculty.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.name} {f.department ? `(${f.department})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="btn btn-secondary flex-1"
                                disabled={saving}
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleSaveAssignment}
                                className="btn btn-primary flex-1"
                                disabled={saving}
                            >
                                {saving ? <LoadingSpinner size="sm" /> : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSectionsPage;
