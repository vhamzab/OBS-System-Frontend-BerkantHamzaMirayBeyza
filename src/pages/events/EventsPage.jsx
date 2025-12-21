import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiX, FiPlus, FiCalendar, FiClock, FiMapPin, FiUsers, FiTag, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import eventService from '../../services/eventService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EventCard from '../../components/common/EventCard';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

const EventsPage = () => {
  const navigate = useNavigate();
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
    category: 'conference',
    date: '',
    start_time: '',
    end_time: '',
    location: '',
    capacity: '',
    is_paid: false,
    price: '',
    registration_deadline: '',
    status: 'published',
  });

  const canCreateEvent = user?.role === 'admin' || user?.role === 'faculty';

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

  const eventCategories = [
    { value: 'conference', label: 'Konferans' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'social', label: 'Sosyal' },
    { value: 'sports', label: 'Spor' },
  ];

  const statusOptions = [
    { value: 'draft', label: 'Taslak' },
    { value: 'published', label: 'Yayınlandı' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description || !formData.date || !formData.start_time || !formData.end_time || !formData.location || !formData.capacity) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    if (formData.is_paid && (!formData.price || parseFloat(formData.price) <= 0)) {
      toast.error('Ücretli etkinlik için geçerli bir fiyat girin');
      return;
    }

    if (new Date(formData.date) < new Date()) {
      toast.error('Etkinlik tarihi geçmiş bir tarih olamaz');
      return;
    }

    if (formData.registration_deadline && new Date(formData.registration_deadline) > new Date(formData.date)) {
      toast.error('Kayıt son tarihi etkinlik tarihinden sonra olamaz');
      return;
    }

    try {
      setCreating(true);
      const submitData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        price: formData.is_paid ? parseFloat(formData.price) : 0,
        registration_deadline: formData.registration_deadline || null,
      };

      const response = await eventService.createEvent(submitData);
      if (response.success) {
        toast.success('Etkinlik başarıyla oluşturuldu');
        setShowCreateModal(false);
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: 'conference',
          date: '',
          start_time: '',
          end_time: '',
          location: '',
          capacity: '',
          is_paid: false,
          price: '',
          registration_deadline: '',
          status: 'published',
        });
        // Refresh events list
        fetchEvents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Etkinlik oluşturulurken hata oluştu');
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const hasActiveFilters = search.trim() || categoryFilter;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Etkinlikler</h1>
          <p className="text-slate-400">Yaklaşan etkinlikleri görüntüleyin ve kayıt olun</p>
        </div>
        {canCreateEvent && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Etkinlik Oluştur
          </button>
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
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-slate-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Yeni Etkinlik Oluştur</h2>
                <p className="text-sm text-slate-400 mt-1">Etkinlik bilgilerini doldurun</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Etkinlik Başlığı <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Etkinlik başlığını girin"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Açıklama <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input w-full min-h-[120px]"
                  placeholder="Etkinlik açıklamasını girin"
                  required
                />
              </div>

              {/* Category and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kategori <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input w-full"
                    required
                  >
                    {eventCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Durum <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input w-full"
                    required
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <FiCalendar className="inline mr-1" />
                    Tarih <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="input w-full"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <FiClock className="inline mr-1" />
                    Başlangıç Saati <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <FiClock className="inline mr-1" />
                    Bitiş Saati <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="input w-full"
                    required
                  />
                </div>
              </div>

              {/* Location and Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <FiMapPin className="inline mr-1" />
                    Konum <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Etkinlik konumu"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <FiUsers className="inline mr-1" />
                    Kapasite <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Maksimum katılımcı sayısı"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Registration Deadline */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <FiCalendar className="inline mr-1" />
                  Kayıt Son Tarihi (Opsiyonel)
                </label>
                <input
                  type="date"
                  name="registration_deadline"
                  value={formData.registration_deadline}
                  onChange={handleChange}
                  className="input w-full"
                  max={formData.date || undefined}
                />
              </div>

              {/* Paid Event */}
              <div className="border-t border-slate-700/50 pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    name="is_paid"
                    id="is_paid"
                    checked={formData.is_paid}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_paid" className="text-sm font-medium cursor-pointer">
                    Ücretli Etkinlik
                  </label>
                </div>

                {formData.is_paid && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FiDollarSign className="inline mr-1" />
                      Ücret (TRY) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required={formData.is_paid}
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-700/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  loading={creating}
                  className="flex-1"
                >
                  Etkinlik Oluştur
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

