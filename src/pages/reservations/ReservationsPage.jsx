import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import reservationService from '../../services/reservationService';
import courseService from '../../services/courseService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import Calendar from '../../components/common/Calendar';

import { useTranslation } from 'react-i18next';
const ReservationsPage = () => {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [purpose, setPurpose] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchReservations();
    }
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classroomsRes, reservationsRes] = await Promise.all([
        courseService.getClassrooms(),
        reservationService.getReservations({ date: selectedDate }),
      ]);

      if (classroomsRes.success) {
        setClassrooms(classroomsRes.data || []);
      }
      if (reservationsRes.success) {
        setReservations(reservationsRes.data || []);
      }
    } catch (error) {
      toast.error('Veriler yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await reservationService.getReservations({ date: selectedDate });
      if (response.success) {
        setReservations(response.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateReservation = async () => {
    if (!selectedClassroom || !selectedDate || !startTime || !endTime) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    try {
      setCreating(true);
      const response = await reservationService.createReservation({
        classroom_id: selectedClassroom,
        date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        purpose: purpose || 'Ders',
      });

      if (response.success) {
        toast.success('Rezervasyon oluşturuldu');
        setShowReservationModal(false);
        setSelectedClassroom('');
        setPurpose('');
        fetchReservations();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rezervasyon oluşturulurken hata oluştu');
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: (
        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
          <FiAlertCircle />
          Beklemede
        </span>
      ),
      approved: (
        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
          <FiCheckCircle />
          Onaylandı
        </span>
      ),
      rejected: (
        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
          <FiXCircle />
          Reddedildi
        </span>
      ),
    };
    return badges[status] || <span>{status}</span>;
  };

  const isClassroomAvailable = (classroomId, date, startTime, endTime) => {
    return !reservations.some(
      (r) =>
        r.classroom_id === classroomId &&
        r.date === date &&
        r.status !== 'rejected' &&
        ((r.start_time <= startTime && r.end_time > startTime) ||
          (r.start_time < endTime && r.end_time >= endTime) ||
          (r.start_time >= startTime && r.end_time <= endTime))
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Derslik Rezervasyonları</h1>
          <p className="text-gray-600 dark:text-gray-300">Derslik rezervasyonu yapın ve yönetin</p>
        </div>
        <Button onClick={() => setShowReservationModal(true)}>
          Yeni Rezervasyon
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={(date) => setSelectedDate(date.toISOString().split('T')[0])}
              minDate={new Date()}
            />
          </div>

          {/* Reservations List */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">
                {new Date(selectedDate).toLocaleDateString('tr-TR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h2>

              {reservations.length === 0 ? (
                <div className="text-center py-12">
                  <FiCalendar className="w-16 h-16 text-gray-600 dark:text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Bu tarih için rezervasyon yok</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reservations.map((reservation) => (
                    <div key={reservation.id} className="p-4 bg-primary-50/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-semibold">
                            {reservation.classroom?.building} {reservation.classroom?.room_number}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {reservation.start_time} - {reservation.end_time}
                          </div>
                        </div>
                        {getStatusBadge(reservation.status)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {reservation.purpose} - {reservation.user?.first_name}{' '}
                        {reservation.user?.last_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Yeni Rezervasyon</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Derslik</label>
                <select
                  value={selectedClassroom}
                  onChange={(e) => setSelectedClassroom(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Seçiniz</option>
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.building} {classroom.room_number} (Kapasite: {classroom.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Başlangıç Saati</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bitiş Saati</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amaç</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Ders, Toplantı, vb."
                  className="input w-full"
                />
              </div>

              {selectedClassroom &&
                selectedDate &&
                startTime &&
                endTime &&
                !isClassroomAvailable(selectedClassroom, selectedDate, startTime, endTime) && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">
                      Bu saatlerde derslik dolu
                    </p>
                  </div>
                )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowReservationModal(false);
                    setSelectedClassroom('');
                    setPurpose('');
                  }}
                  className="flex-1"
                >{t('common.cancel')}</Button>
                <Button
                  onClick={handleCreateReservation}
                  loading={creating}
                  disabled={
                    !selectedClassroom ||
                    !startTime ||
                    !endTime ||
                    !isClassroomAvailable(selectedClassroom, selectedDate, startTime, endTime)
                  }
                  className="flex-1"
                >
                  Rezerve Et
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;

