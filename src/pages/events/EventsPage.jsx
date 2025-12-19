import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import eventService from '../../services/eventService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EventCard from '../../components/common/EventCard';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

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

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Etkinlikler</h1>
        <p className="text-slate-400">Yaklaşan etkinlikleri görüntüleyin ve kayıt olun</p>
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
    </div>
  );
};

export default EventsPage;

