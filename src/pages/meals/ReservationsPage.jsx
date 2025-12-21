import { useState, useEffect } from 'react';
import { FiCalendar, FiX, FiCheckCircle, FiXCircle, FiUser } from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';
import toast from 'react-hot-toast';
import mealService from '../../services/mealService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import QRCodeDisplay from '../../components/common/QRCodeDisplay';

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [loadingTransfers, setLoadingTransfers] = useState(true);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    fetchReservations();
    fetchPendingTransfers();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await mealService.getMyReservations();
      if (response.success) {
        setReservations(response.data);
      }
    } catch (error) {
      toast.error('Rezervasyonlar yüklenirken hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingTransfers = async () => {
    try {
      setLoadingTransfers(true);
      const response = await mealService.getPendingTransfers();
      if (response.success) {
        setPendingTransfers(response.data);
      }
    } catch (error) {
      console.error('Bekleyen transferler yüklenirken hata oluştu:', error);
    } finally {
      setLoadingTransfers(false);
    }
  };

  const handleAcceptTransfer = async (transferId) => {
    try {
      setAccepting(transferId);
      const response = await mealService.acceptTransfer(transferId);
      if (response.success) {
        toast.success(response.message || 'Rezervasyon devri kabul edildi');
        fetchPendingTransfers();
        fetchReservations();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transfer kabul edilirken hata oluştu');
    } finally {
      setAccepting(null);
    }
  };

  const handleCancel = async (reservationId) => {
    if (!confirm('Bu rezervasyonu iptal etmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      setCancelling(reservationId);
      const response = await mealService.cancelReservation(reservationId);
      if (response.success) {
        toast.success('Rezervasyon iptal edildi');
        fetchReservations();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rezervasyon iptal edilirken hata oluştu');
    } finally {
      setCancelling(null);
    }
  };

  const getMealTypeLabel = (type) => {
    const labels = {
      breakfast: 'Kahvaltı',
      lunch: 'Öğle Yemeği',
      dinner: 'Akşam Yemeği',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status) => {
    const badges = {
      reserved: (
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
          <FiCheckCircle />
          Rezerve Edildi
        </span>
      ),
      used: (
        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
          <FiCheckCircle />
          Kullanıldı
        </span>
      ),
      cancelled: (
        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
          <FiXCircle />
          İptal Edildi
        </span>
      ),
    };
    return badges[status] || <span>{status}</span>;
  };

  const canCancel = (reservation) => {
    if (reservation.status !== 'reserved') return false;
    const reservationDate = new Date(reservation.date);
    const now = new Date();
    const hoursUntilMeal = (reservationDate - now) / (1000 * 60 * 60);
    return hoursUntilMeal >= 2;
  };

  const upcomingReservations = reservations.filter(
    (r) => r.status === 'reserved' && new Date(r.date) >= new Date()
  );
  const pastReservations = reservations.filter(
    (r) => r.status !== 'reserved' || new Date(r.date) < new Date()
  );

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Yemek Rezervasyonlarım</h1>
        <p className="text-slate-400">Rezervasyonlarınızı görüntüleyin ve yönetin</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          {/* Pending Transfers */}
          {pendingTransfers.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Bekleyen Rezervasyon Devirleri</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingTransfers.map((transfer) => (
                  <div key={transfer.id} className="card border-2 border-yellow-500/30">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FiCalendar className="text-slate-400" />
                          <span className="font-semibold">
                            {new Date(transfer.date).toLocaleDateString('tr-TR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <FaUtensils className="text-slate-400" />
                          <span>{getMealTypeLabel(transfer.meal_type)}</span>
                        </div>
                        <div className="text-sm text-slate-400 mb-3">
                          {transfer.cafeteria?.name} - {transfer.cafeteria?.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <FiUser className="text-slate-400" />
                          <span>
                            {transfer.user?.first_name} {transfer.user?.last_name}
                            {transfer.user?.student?.student_number && (
                              <span className="text-slate-400 ml-1">
                                ({transfer.user.student.student_number})
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full inline-block mt-2">
                          Beklemede
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-slate-700/50 pt-4 mt-4">
                      <Button
                        onClick={() => handleAcceptTransfer(transfer.id)}
                        loading={accepting === transfer.id}
                        fullWidth
                      >
                        <FiCheckCircle className="w-4 h-4 mr-2" />
                        Rezervasyonu Kabul Et
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Reservations */}
          {upcomingReservations.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Yaklaşan Rezervasyonlar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingReservations.map((reservation) => (
                  <div key={reservation.id} className="card">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FiCalendar className="text-slate-400" />
                          <span className="font-semibold">
                            {new Date(reservation.date).toLocaleDateString('tr-TR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <FaUtensils className="text-slate-400" />
                          <span>{getMealTypeLabel(reservation.meal_type)}</span>
                        </div>
                        <div className="text-sm text-slate-400 mb-3">
                          {reservation.cafeteria?.name} - {reservation.cafeteria?.location}
                        </div>
                        {getStatusBadge(reservation.status)}
                      </div>
                    </div>

                    {reservation.status === 'reserved' && (
                      <div className="border-t border-slate-700/50 pt-4 mt-4">
                        <div className="mb-4 flex flex-col items-center">
                          <h3 className="text-sm font-semibold mb-3 text-slate-300">Yemek Rezervasyon QR Kodu</h3>
                          <QRCodeDisplay 
                            qrCode={reservation.qr_code || `MEAL-RES-${reservation.id}-${reservation.date}`} 
                            title="Yemek QR Kodu" 
                            size={250} 
                          />
                          <p className="text-xs text-slate-400 mt-2 text-center">
                            Bu QR kodu kafeteryada göstererek yemeğinizi alabilirsiniz
                          </p>
                        </div>
                        {canCancel(reservation) && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancel(reservation.id)}
                            loading={cancelling === reservation.id}
                            fullWidth
                          >
                            İptal Et
                          </Button>
                        )}
                        {!canCancel(reservation) && reservation.status === 'reserved' && (
                          <p className="text-xs text-slate-400 text-center">
                            Rezervasyonu iptal etmek için en az 2 saat önceden iptal etmeniz gerekir
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Reservations */}
          {pastReservations.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Geçmiş Rezervasyonlar</h2>
              <div className="space-y-3">
                {pastReservations.map((reservation) => (
                  <div key={reservation.id} className="card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-semibold">
                            {new Date(reservation.date).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="text-sm text-slate-400">
                            {getMealTypeLabel(reservation.meal_type)} - {reservation.cafeteria?.name}
                          </div>
                        </div>
                        {getStatusBadge(reservation.status)}
                      </div>
                      {reservation.amount > 0 && (
                        <div className="text-sm text-slate-400">
                          {reservation.amount} TRY
                        </div>
                      )}
                    </div>
                    {reservation.status === 'reserved' && (
                      <div className="border-t border-slate-700/50 pt-4 mt-4">
                        <div className="mb-4 flex flex-col items-center">
                          <h3 className="text-sm font-semibold mb-3 text-slate-300">Yemek Rezervasyon QR Kodu</h3>
                          <QRCodeDisplay 
                            qrCode={reservation.qr_code || `MEAL-RES-${reservation.id}-${reservation.date}`} 
                            title="Yemek QR Kodu" 
                            size={250} 
                          />
                          <div className="mt-4 w-full">
                            <p className="text-xs text-slate-400 mb-2 text-center">QR Kod Barkodu:</p>
                            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                              <p className="font-mono text-sm text-white text-center break-all">
                                {reservation.qr_code || `MEAL-RES-${reservation.id}-${reservation.date}`}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 mt-2 text-center">
                            Bu QR kodu kafeteryada göstererek yemeğinizi alabilirsiniz
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {reservations.length === 0 && pendingTransfers.length === 0 && (
            <div className="card text-center py-12">
              <FaUtensils className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Henüz rezervasyonunuz yok</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;

