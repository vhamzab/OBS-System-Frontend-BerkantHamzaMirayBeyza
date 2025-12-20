import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX, FiPlus, FiCalendar, FiClock, FiMapPin, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import eventService from '../../services/eventService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EventCard from '../../components/common/EventCard';
import Button from '../../components/common/Button';

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'social',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    capacity: '',
    registration_deadline: '',
  });

  useEffect(() => {
    fetchEvents();
  }, [categoryFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.search = search;

      const response = await eventService.getEvents(params);
      if (response.success) {
        // Filter by search term if provided
        let filteredEvents = response.data;
        if (search) {
          filteredEvents = filteredEvents.filter(
            (event) =>
              event.title.toLowerCase().includes(search.toLowerCase()) ||
              event.description?.toLowerCase().includes(search.toLowerCase())
          );
        }
        setEvents(filteredEvents);
      }
    } catch (error) {
      toast.error('Etkinlikler yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: '', label: 'Tüm Kategoriler' },
    { value: 'conference', label: 'Konferans' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'social', label: 'Sosyal' },
    { value: 'sports', label: 'Spor' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const hasActiveFilters = search.trim() || categoryFilter;

  const canCreateEvent = user?.role === 'admin' || user?.role === 'faculty';

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.start_time || !formData.end_time) {
      toast.error('Başlık, tarih ve saat bilgileri zorunludur');
      return;
    }

    setCreating(true);
    try {
      const response = await eventService.createEvent(formData);
      if (response.success) {
        toast.success('Etkinlik başarıyla oluşturuldu');
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          category: 'social',
          date: '',
          start_time: '',
          end_time: '',
          location: '',
          capacity: '',
          registration_deadline: '',
        });
        fetchEvents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Etkinlik oluşturulurken hata oluştu');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Etkinlikler</h1>
          <p className="text-slate-400">Yaklaşan etkinlikleri görüntüleyin ve kayıt olun</p>
        </div>
        {canCreateEvent && (
          <Button onClick={() => setShowCreateModal(true)}>
            <FiPlus className="w-4 h-4 mr-2" />
            Yeni Etkinlik
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="card mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Etkinlik adı ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 pr-10 w-full"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  fetchEvents();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input min-w-[200px]"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary">
            Ara
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategoryFilter('');
                fetchEvents();
              }}
              className="btn-secondary"
            >
              <FiX className="mr-2" />
              Temizle
            </button>
          )}
        </form>
      </div>

      {/* Events Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : events.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400">Etkinlik bulunamadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Yeni Etkinlik Oluştur</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white hover:text-slate-300"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Başlık *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                  >
                    <option value="conference">Konferans</option>
                    <option value="workshop">Workshop</option>
                    <option value="social">Sosyal</option>
                    <option value="sports">Spor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Tarih *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Başlangıç Saati *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Bitiş Saati *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Konum</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Kapasite</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Kayıt Son Tarihi</label>
                <input
                  type="datetime-local"
                  value={formData.registration_deadline}
                  onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button type="submit" loading={creating} className="flex-1">
                  Oluştur
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;

