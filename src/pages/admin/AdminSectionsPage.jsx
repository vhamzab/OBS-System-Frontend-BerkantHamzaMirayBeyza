import { useState, useEffect } from 'react';
import {
    FiBook, FiUser, FiUsers, FiEdit2, FiPlus,
    FiFilter, FiSearch, FiCalendar, FiMapPin, FiX, FiSave
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import userService from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { useTranslation } from 'react-i18next';
const AdminSectionsPage = () => {
  const { t } = useTranslation();
    const [sections, setSections] = useState([]);
    const [courses, setCourses] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState('');
    const [newSectionData, setNewSectionData] = useState({
        course_id: '',
        section_number: 1,
        semester: 'spring',
        year: new Date().getFullYear(),
        instructor_id: '',
        classroom_id: '',
        capacity: 30,
    });

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
            const [sectionsRes, facultyRes, coursesRes, classroomsRes] = await Promise.all([
                courseService.getSections({
                    semester: filters.semester,
                    year: filters.year,
                    limit: 100
                }),
                userService.getAllFaculty(),
                courseService.getCourses({ limit: 200, is_active: true }),
                courseService.getClassrooms({ limit: 100 }),
            ]);

            if (sectionsRes.success) {
                setSections(sectionsRes.data?.sections || []);
            }
            if (facultyRes.success) {
                setFaculty(facultyRes.data || []);
            }
            if (coursesRes.success) {
                setCourses(coursesRes.data?.courses || []);
            }
            if (classroomsRes.success) {
                setClassrooms(classroomsRes.data || []);
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

    const handleOpenCreateModal = () => {
        setNewSectionData({
            course_id: '',
            section_number: 1,
            semester: 'spring',
            year: new Date().getFullYear(),
            instructor_id: '',
            classroom_id: '',
            capacity: 30,
        });
        setShowCreateModal(true);
    };

    const handleCreateSection = async (e) => {
        e.preventDefault();

        if (!newSectionData.course_id) {
            toast.error('Lütfen bir ders seçin');
            return;
        }

        try {
            setSaving(true);
            const response = await courseService.createSection({
                ...newSectionData,
                instructor_id: newSectionData.instructor_id || null,
                classroom_id: newSectionData.classroom_id || null,
            });

            if (response.success) {
                toast.success(response.message || 'Section başarıyla oluşturuldu');
                setShowCreateModal(false);
                fetchData();
            } else {
                toast.error(response.message || 'Section oluşturulurken hata oluştu');
            }
        } catch (error) {
            console.error('Create section error:', error);
            toast.error(error.response?.data?.message || 'Section oluşturulurken hata oluştu');
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
                    <p className="text-gray-600 dark:text-gray-300">Derslere öğretim üyesi atayın ve section'ları yönetin</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
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
                        <FiFilter className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Filtreler:</span>
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
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-300" />
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
                            <tr className="border-b border-gray-200 dark:border-gray-700/50">
                                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">Ders</th>
                                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">Section</th>
                                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">{t('courses.semester')}</th>
                                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">{t('roles.faculty')}</th>
                                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">Derslik</th>
                                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">{t('courses.capacity')}</th>
                                <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-300">{t('common.status')}</th>
                                <th className="text-right p-4 font-medium text-gray-600 dark:text-gray-300">{t('wallet.transactions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 dark:divide-gray-700">
                            {filteredSections.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-600 dark:text-gray-300">
                                        Hiç section bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                filteredSections.map((section) => (
                                    <tr key={section.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800/30 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                                    <FiBook className="w-5 h-5 text-primary-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{section.course?.code}</div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                                                        {section.course?.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded bg-primary-50 text-sm">
                                                Section {section.sectionNumber}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <FiCalendar className="w-4 h-4 text-gray-600 dark:text-gray-300" />
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
                                                    <FiMapPin className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                                    {section.classroom.location}
                                                </div>
                                            ) : (
                                                <span className="text-gray-700 dark:text-gray-200 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-sm">
                                                <FiUsers className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                                <span>{section.enrolledCount}/{section.capacity}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs ${section.isActive
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {section.isActive ? t('common.active') : t('common.inactive')}
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

            {/* Create Section Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="card w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-display text-xl font-semibold">
                                Yeni Section Oluştur
                            </h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 rounded-lg hover:bg-primary-50 transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSection} className="space-y-4">
                            {/* Course Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Ders *</label>
                                <select
                                    value={newSectionData.course_id}
                                    onChange={(e) => setNewSectionData({ ...newSectionData, course_id: e.target.value })}
                                    className="input w-full"
                                    required
                                >
                                    <option value="">-- Ders Seçin --</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.code} - {course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Section Number & Capacity */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Section No</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newSectionData.section_number}
                                        onChange={(e) => setNewSectionData({ ...newSectionData, section_number: parseInt(e.target.value) || 1 })}
                                        className="input w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">{t('courses.capacity')}</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newSectionData.capacity}
                                        onChange={(e) => setNewSectionData({ ...newSectionData, capacity: parseInt(e.target.value) || 30 })}
                                        className="input w-full"
                                    />
                                </div>
                            </div>

                            {/* Semester & Year */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">{t('courses.semester')}</label>
                                    <select
                                        value={newSectionData.semester}
                                        onChange={(e) => setNewSectionData({ ...newSectionData, semester: e.target.value })}
                                        className="input w-full"
                                    >
                                        <option value="fall">Güz</option>
                                        <option value="spring">Bahar</option>
                                        <option value="summer">Yaz</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">{t('courses.year')}</label>
                                    <select
                                        value={newSectionData.year}
                                        onChange={(e) => setNewSectionData({ ...newSectionData, year: parseInt(e.target.value) })}
                                        className="input w-full"
                                    >
                                        {[2024, 2025, 2026].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Instructor */}
                            <div>
                                <label className="block text-sm font-medium mb-2">{t('roles.faculty')}</label>
                                <select
                                    value={newSectionData.instructor_id}
                                    onChange={(e) => setNewSectionData({ ...newSectionData, instructor_id: e.target.value })}
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

                            {/* Classroom */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Derslik</label>
                                <select
                                    value={newSectionData.classroom_id}
                                    onChange={(e) => setNewSectionData({ ...newSectionData, classroom_id: e.target.value })}
                                    className="input w-full"
                                >
                                    <option value="">-- Derslik Yok --</option>
                                    {classrooms.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.building} {c.room_number} (Kapasite: {c.capacity})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="btn btn-secondary flex-1"
                                    disabled={saving}
                                >{t('common.cancel')}</button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-1"
                                    disabled={saving}
                                >
                                    {saving ? <LoadingSpinner size="sm" /> : (
                                        <>
                                            <FiSave className="w-4 h-4 mr-2" />
                                            Oluştur
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assignment Modal */}
            {showAssignModal && selectedSection && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="card w-full max-w-md mx-4">
                        <h3 className="font-display text-xl font-semibold mb-4">
                            Öğretim Üyesi Ata
                        </h3>

                        <div className="mb-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                            <div className="font-medium">{selectedSection.course?.code}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">{selectedSection.course?.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Section {selectedSection.sectionNumber}</div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-2">
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
                            >{t('common.cancel')}</button>
                            <button
                                onClick={handleSaveAssignment}
                                className="btn btn-primary flex-1"
                                disabled={saving}
                            >
                                {saving ? <LoadingSpinner size="sm" /> : t('common.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSectionsPage;
