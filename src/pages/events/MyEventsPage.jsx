import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiCheckCircle, FiXCircle, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import eventService from '../../services/eventService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import QRCodeDisplay from '../../components/common/QRCodeDisplay';
import { useAuth } from '../../context/AuthContext';

import { useTranslation } from 'react-i18next';
const MyEventsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const canCreateEvent = user?.role === 'admin' || user?.role === 'faculty';

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getMyEventRegistrations();
      if (response.success) {
        setRegistrations(response.data || []);
      }
    } catch (error) {
      toast.error('Etkinlikler yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (eventId, registrationId) => {
    if (!confirm('Bu etkinlik kaydını iptal etmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      setCancelling(registrationId);
      const response = await eventService.cancelRegistration(eventId, registrationId);
      if (response.success) {
        toast.success('Kayıt iptal edildi');
        fetchMyEvents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Kayıt iptal edilirken hata oluştu');
    } finally {
      setCancelling(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return timeString?.substring(0, 5) || '';
  };

  const upcomingEvents = registrations.filter(
    (reg) => !reg.checked_in && new Date(reg.event?.date) >= new Date()
  );
  const pastEvents = registrations.filter(
    (reg) => reg.checked_in || new Date(reg.event?.date) < new Date()
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">{t('events.myEvents')}</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {canCreateEvent ? 'Etkinliklerinizi yönetin ve yeni etkinlik oluşturun' : 'Kayıt olduğunuz etkinlikleri görüntüleyin'}
          </p>
        </div>
        {canCreateEvent && (
          <button
            onClick={() => navigate('/events/create')}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-gray-800 dark:text-gray-100 font-medium transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            Yeni Etkinlik Oluştur
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">{t('events.upcomingEvents')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingEvents.map((registration) => (
                  <div key={registration.id} className="card">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-2">{registration.event?.title}</h3>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <FiCalendar />
                          {formatDate(registration.event?.date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock />
                          {formatTime(registration.event?.start_time)} -{' '}
                          {formatTime(registration.event?.end_time)}
                        </div>
                        <div className="flex items-center gap-2">
                          <FiMapPin />
                          {registration.event?.location}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700/50 pt-4 mt-4">
                      <div className="mb-4">
                        <QRCodeDisplay
                          qrCode={registration.qr_code}
                          title="Etkinlik Giriş QR Kodu"
                        />
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancel(registration.event?.id || registration.event_id, registration.id)}
                        loading={cancelling === registration.id}
                        fullWidth
                      >{t('events.unregister')}</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">{t('events.pastEvents')}</h2>
              <div className="space-y-3">
                {pastEvents.map((registration) => (
                  <div key={registration.id} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{registration.event?.title}</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {formatDate(registration.event?.date)}
                        </div>
                      </div>
                      {registration.checked_in ? (
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full flex items-center gap-1">
                          <FiCheckCircle />
                          Giriş Yapıldı
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-300/20 text-gray-600 dark:text-gray-300 text-sm rounded-full flex items-center gap-1">
                          <FiXCircle />
                          Giriş Yapılmadı
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {registrations.length === 0 && (
            <div className="card text-center py-12">
              <FiCalendar className="w-16 h-16 text-gray-600 dark:text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-4">Henüz etkinliğe kayıt olmadınız</p>
              <Link to="/events">
                <Button>Etkinlikleri Görüntüle</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;

