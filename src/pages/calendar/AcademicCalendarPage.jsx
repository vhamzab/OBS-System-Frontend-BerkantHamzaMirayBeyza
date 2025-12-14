import { useState, useEffect } from 'react';
import { FiCalendar, FiPlus, FiTrash2, FiX, FiSave, FiClock, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import calendarService from '../../services/calendarService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const AcademicCalendarPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    // Filter state
    const [filterType, setFilterType] = useState('all');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'academic',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await calendarService.getEvents();
            if (response.success) {
                // Sort by date descending
                const sortedEvents = (response.data || []).sort((a, b) =>
                    new Date(a.start_date) - new Date(b.start_date)
                );
                setEvents(sortedEvents);
            }
        } catch (error) {
            toast.error('Takvim yüklenirken hata oluştu');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWrapper = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await calendarService.createEvent(formData);
            toast.success('Etkinlik başarıyla oluşturuldu');
            setShowModal(false);
            setFormData({
                title: '',
                description: '',
                type: 'academic',
                start_date: '',
                end_date: '',
            });
            fetchEvents();
        } catch (error) {
            console.error('Create error:', error);
            toast.error(error.response?.data?.message || 'Etkinlik oluşturulurken hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) return;

        try {
            await calendarService.deleteEvent(id);
            toast.success('Etkinlik silindi');
            setEvents(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Silme işlemi başarısız');
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'holiday': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'exam': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'registration': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'holiday': return 'Tatil';
            case 'exam': return 'Sınav';
            case 'registration': return 'Kayıt';
            case 'academic': return 'Akademik';
            default: return type;
        }
    };

    const formatDateRange = (start, end) => {
        if (!start) return 'Tarih belirtilmemiş';

        const startDate = new Date(start);
        if (isNaN(startDate.getTime())) return 'Geçersiz Tarih';

        const endDate = end ? new Date(end) : null;
        if (endDate && isNaN(endDate.getTime())) return 'Geçersiz Tarih';

        const options = { day: 'numeric', month: 'long', year: 'numeric' };

        try {
            const startStr = new Intl.DateTimeFormat('tr-TR', options).format(startDate);

            if (!endDate || startDate.toDateString() === endDate.toDateString()) {
                return startStr;
            }

            const endStr = new Intl.DateTimeFormat('tr-TR', options).format(endDate);
            return `${startStr} - ${endStr}`;
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Tarih Hatası';
        }
    };

    // Filter events
    const filteredEvents = events.filter(item => {
        if (filterType !== 'all' && item.type !== filterType) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-accent-500/20">
                        <FiCalendar className="w-6 h-6 text-accent-400" />
                    </div>
                    <div>
                        <h1 className="font-display text-3xl font-bold">Akademik Takvim</h1>
                        <p className="text-slate-400">Dönem içi önemli tarihler</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="input py-2 px-4 w-full sm:w-40"
                    >
                        <option value="all">Tümü</option>
                        <option value="academic">Akademik</option>
                        <option value="exam">Sınavlar</option>
                        <option value="registration">Kayıt Dönemi</option>
                        <option value="holiday">Resmi Tatiller</option>
                    </select>

                    {isAdmin && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn btn-primary whitespace-nowrap"
                        >
                            <FiPlus className="w-4 h-4 mr-2" />
                            Yeni Etkinlik
                        </button>
                    )}
                </div>
            </div>

            {filteredEvents.length === 0 ? (
                <div className="card text-center py-12">
                    <FiCalendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Etkinlik Yok</h3>
                    <p className="text-slate-400">Görüntülenecek etkinlik bulunamadı.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredEvents.map((event) => (
                        <div
                            key={event.id}
                            className="card p-5 hover:ring-1 hover:ring-primary-500/30 transition-all relative group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                {/* Date Box */}
                                <div className="flex-shrink-0 w-full md:w-48 p-3 rounded-lg bg-slate-800 border border-slate-700 text-center">
                                    <div className="text-sm text-slate-400 mb-1 flex items-center justify-center gap-2">
                                        <FiClock className="w-4 h-4" />
                                        Tarih
                                    </div>
                                    <div className="font-semibold text-white">
                                        {formatDateRange(event.start_date, event.end_date)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(event.type)}`}>
                                            {getTypeLabel(event.type)}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                                    {event.description && (
                                        <p className="text-slate-400 text-sm">{event.description}</p>
                                    )}
                                </div>
                            </div>

                            {isAdmin && (
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700"
                                    title="Sil"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Event Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-lg shadow-xl border border-slate-700">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
                            <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                                <FiPlus className="w-5 h-5 text-primary-400" />
                                Yeni Etkinlik
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateWrapper} className="space-y-4">
                            <Input
                                label="Etkinlik Başlığı"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Örn: Güz Dönemi Başlangıcı"
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-300">Açıklama</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detaylı açıklama (isteğe bağlı)..."
                                    className="input w-full min-h-[80px] resize-y"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Select
                                    label="Etkinlik Tipi"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    options={[
                                        { value: 'academic', label: 'Akademik' },
                                        { value: 'exam', label: 'Sınav' },
                                        { value: 'registration', label: 'Kayıt' },
                                        { value: 'holiday', label: 'Tatil' },
                                    ]}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    type="date"
                                    label="Başlangıç Tarihi"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    required
                                />
                                <Input
                                    type="date"
                                    label="Bitiş Tarihi (Opsiyonel)"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-slate-700/50 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1"
                                    disabled={saving}
                                >
                                    İptal
                                </Button>
                                <Button
                                    type="submit"
                                    loading={saving}
                                    className="flex-1"
                                >
                                    <FiSave className="w-4 h-4 mr-2" />
                                    Kaydet
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicCalendarPage;
