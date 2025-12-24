import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiTag, FiArrowLeft, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import eventService from '../../services/eventService';
import walletService from '../../services/walletService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';

import { useTranslation } from 'react-i18next';
const EventDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [customFields, setCustomFields] = useState({});
  const [walletBalance, setWalletBalance] = useState(null);

  useEffect(() => {
    fetchEvent();
    if (event?.is_paid && event?.price > 0) {
      fetchWalletBalance();
    }
  }, [id, event?.is_paid, event?.price]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventById(id);
      if (response.success) {
        setEvent(response.data);
        // If paid event, fetch wallet balance
        if (response.data.is_paid && response.data.price > 0) {
          fetchWalletBalance();
        }
      }
    } catch (error) {
      toast.error('Etkinlik yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await walletService.getBalance();
      if (response.success) {
        setWalletBalance(response.data.balance);
      }
    } catch (error) {
      console.error('Bakiye yüklenirken hata:', error);
    }
  };

  const handleRegister = async () => {
    try {
      setRegistering(true);
      const response = await eventService.registerForEvent(id, customFields);
      if (response.success) {
        toast.success('Etkinliğe başarıyla kaydoldunuz');
        navigate('/my-events');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Kayıt başarısız');
    } finally {
      setRegistering(false);
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

  const remainingSpots = event ? event.capacity - event.registered_count : 0;
  const isFull = remainingSpots <= 0;
  const isPaidEvent = event?.is_paid && event?.price > 0;
  const hasSufficientBalance = walletBalance !== null && walletBalance >= (event?.price || 0);
  const canRegister = event && event.status === 'published' && !isFull && (!isPaidEvent || hasSufficientBalance);
  const registrationDeadline = event?.registration_deadline
    ? new Date(event.registration_deadline)
    : null;
  const isDeadlinePassed = registrationDeadline && registrationDeadline < new Date();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Etkinlik bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-400 dark:text-gray-500 mb-6"
      >
        <FiArrowLeft />
        Geri Dön
      </button>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full inline-flex items-center gap-1">
              <FiTag />
              {event.category}
            </span>
          </div>
          {event.is_paid && event.price > 0 && (
            <div className="text-2xl font-bold text-green-400">
              {event.price} TRY
            </div>
          )}
        </div>

        <div className="prose prose-invert max-w-none mb-6">
          <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 whitespace-pre-wrap">{event.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-primary-50/50 rounded-lg">
            <FiCalendar className="text-gray-600 dark:text-gray-300" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('common.date')}</div>
              <div className="font-semibold">{formatDate(event.date)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary-50/50 rounded-lg">
            <FiClock className="text-gray-600 dark:text-gray-300" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('common.time')}</div>
              <div className="font-semibold">
                {formatTime(event.start_time)} - {formatTime(event.end_time)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary-50/50 rounded-lg">
            <FiMapPin className="text-gray-600 dark:text-gray-300" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Yer</div>
              <div className="font-semibold">{event.location}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-primary-50/50 rounded-lg">
            <FiUsers className="text-gray-600 dark:text-gray-300" />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('courses.capacity')}</div>
              <div className="font-semibold">
                {event.registered_count}/{event.capacity} kayıtlı
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">
                {remainingSpots > 0 ? `${remainingSpots} boş yer` : 'Dolu'}
              </div>
            </div>
          </div>
        </div>

        {registrationDeadline && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="text-sm text-yellow-400">
              <strong>Kayıt Son Tarihi:</strong>{' '}
              {formatDate(event.registration_deadline)}
            </div>
          </div>
        )}

        {isPaidEvent && walletBalance !== null && (
          <div className="mb-6 p-4 bg-primary-50/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiDollarSign className="text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Cüzdan Bakiyeniz:</span>
                <span className={`font-bold ${hasSufficientBalance ? 'text-green-400' : 'text-red-400'}`}>
                  {walletBalance.toFixed(2)} TRY
                </span>
              </div>
              {!hasSufficientBalance && (
                <button
                  onClick={() => navigate('/wallet')}
                  className="text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  Para Yükle
                </button>
              )}
            </div>
            {!hasSufficientBalance && (
              <p className="text-xs text-red-400 mt-2">
                Yetersiz bakiye. Etkinlik ücreti: {event.price} TRY
              </p>
            )}
          </div>
        )}

        {canRegister && !isDeadlinePassed && (
          <div className="border-t border-gray-200 dark:border-gray-700/50 pt-6">
            <Button
              onClick={handleRegister}
              loading={registering}
              fullWidth
              size="lg"
              disabled={isPaidEvent && !hasSufficientBalance}
            >
              {isPaidEvent ? `Etkinliğe Kayıt Ol (${event.price} TRY)` : 'Etkinliğe Kayıt Ol'}
            </Button>
          </div>
        )}

        {isPaidEvent && !hasSufficientBalance && !isDeadlinePassed && !isFull && (
          <div className="border-t border-gray-200 dark:border-gray-700/50 pt-6">
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center">
              <p className="text-red-400 font-semibold">Yetersiz bakiye. Lütfen cüzdanınıza para yükleyin.</p>
            </div>
          </div>
        )}

        {isFull && (
          <div className="border-t border-gray-200 dark:border-gray-700/50 pt-6">
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center">
              <p className="text-red-400 font-semibold">Etkinlik dolu</p>
            </div>
          </div>
        )}

        {isDeadlinePassed && (
          <div className="border-t border-gray-200 dark:border-gray-700/50 pt-6">
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-center">
              <p className="text-red-400 font-semibold">Kayıt süresi dolmuş</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailPage;

