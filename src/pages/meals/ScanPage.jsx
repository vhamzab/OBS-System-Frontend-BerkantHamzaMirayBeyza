import { useState } from 'react';
import { FiCamera, FiCheckCircle, FiXCircle, FiUser, FiCalendar } from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';
import toast from 'react-hot-toast';
import mealService from '../../services/mealService';
import QRScanner from '../../components/common/QRScanner';
import Button from '../../components/common/Button';

const ScanPage = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [using, setUsing] = useState(false);

  const handleScan = async (qrCode) => {
    setShowScanner(false);
    setScanning(true);

    try {
      const response = await mealService.getReservationByQR(qrCode);
      if (response.success) {
        setReservation(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Geçersiz QR kod');
      console.error(error);
    } finally {
      setScanning(false);
    }
  };

  const handleUse = async () => {
    if (!reservation) return;

    try {
      setUsing(true);
      const response = await mealService.useReservation(reservation.id, reservation.qr_code);
      if (response.success) {
        toast.success('Yemek kullanıldı');
        setReservation(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Yemek kullanılırken hata oluştu');
    } finally {
      setUsing(false);
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

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">QR Kod Tarama</h1>
        <p className="text-slate-400">Yemek rezervasyonu QR kodunu tarayın</p>
      </div>

      {!reservation ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
              <FiCamera className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">QR Kodu Tara</h2>
            <p className="text-slate-400 mb-6">
              Yemek rezervasyonu QR kodunu taramak için kamerayı başlatın
            </p>
            <Button onClick={() => setShowScanner(true)} size="lg">
              <FiCamera className="mr-2" />
              Kamerayı Başlat
            </Button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <FiCheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-center mb-6">Rezervasyon Bilgileri</h2>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
              <FiUser className="text-slate-400" />
              <div>
                <div className="text-sm text-slate-400">Kullanıcı</div>
                <div className="font-semibold">
                  {reservation.user?.first_name} {reservation.user?.last_name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
              <FaUtensils className="text-slate-400" />
              <div>
                <div className="text-sm text-slate-400">Öğün</div>
                <div className="font-semibold">
                  {getMealTypeLabel(reservation.meal_type)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-700/50 rounded-lg">
              <FiCalendar className="text-slate-400" />
              <div>
                <div className="text-sm text-slate-400">Tarih</div>
                <div className="font-semibold">
                  {new Date(reservation.date).toLocaleDateString('tr-TR')}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Kafeterya</div>
              <div className="font-semibold">{reservation.cafeteria?.name}</div>
              <div className="text-sm text-slate-400">{reservation.cafeteria?.location}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setReservation(null)}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              onClick={handleUse}
              loading={using}
              className="flex-1"
            >
              Kullanımı Onayla
            </Button>
          </div>
        </div>
      )}

      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          title="Yemek QR Kodu Tara"
        />
      )}
    </div>
  );
};

export default ScanPage;

