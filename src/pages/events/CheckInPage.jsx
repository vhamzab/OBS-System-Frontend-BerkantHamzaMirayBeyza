import { useState } from 'react';
import { FiCamera, FiCheckCircle, FiUser, FiUsers } from 'react-icons/fi';
import toast from 'react-hot-toast';
import eventService from '../../services/eventService';
import QRScanner from '../../components/common/QRScanner';
import Button from '../../components/common/Button';

import { useTranslation } from 'react-i18next';
const CheckInPage = () => {
  const { t } = useTranslation();
  const [showScanner, setShowScanner] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [event, setEvent] = useState(null);

  const handleScan = async (qrCode) => {
    setShowScanner(false);
    setCheckingIn(true);

    try {
      const response = await eventService.getRegistrationByQR(qrCode);
      if (response.success) {
        setRegistration(response.data);
        setEvent(response.data.event);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Geçersiz QR kod');
      console.error(error);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckIn = async () => {
    if (!registration || !event) return;

    try {
      setCheckingIn(true);
      const response = await eventService.checkIn(
        event.id,
        registration.id,
        registration.qr_code
      );
      if (response.success) {
        toast.success('Giriş başarılı');
        // Refresh registration to get updated checked_in status
        const refreshResponse = await eventService.getRegistrationByQR(registration.qr_code);
        if (refreshResponse.success) {
          setRegistration(refreshResponse.data);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Giriş yapılırken hata oluştu');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Etkinlik Girişi</h1>
        <p className="text-gray-600 dark:text-gray-300">Etkinlik kayıt QR kodunu tarayın</p>
      </div>

      {!registration ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
              <FiCamera className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">QR Kodu Tara</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Etkinlik kayıt QR kodunu taramak için kamerayı başlatın
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

          <h2 className="text-xl font-bold text-center mb-6">Kayıt Bilgileri</h2>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-primary-50/50 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Etkinlik</div>
              <div className="font-semibold text-lg">{event?.title}</div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-primary-50/50 rounded-lg">
              <FiUser className="text-gray-600 dark:text-gray-300" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Katılımcı</div>
                <div className="font-semibold">
                  {registration.user?.first_name} {registration.user?.last_name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{registration.user?.email}</div>
              </div>
            </div>

            {registration.checked_in && (
              <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-400">
                  <FiCheckCircle />
                  <span className="font-semibold">Bu kayıt zaten giriş yapmış</span>
                </div>
                {registration.checked_in_at && (
                  <div className="text-sm text-yellow-300 mt-1">
                    Giriş zamanı:{' '}
                    {new Date(registration.checked_in_at).toLocaleString('tr-TR')}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setRegistration(null);
                setEvent(null);
              }}
              className="flex-1"
            >{t('common.cancel')}</Button>
            <Button
              onClick={handleCheckIn}
              loading={checkingIn}
              disabled={registration.checked_in}
              className="flex-1"
            >
              Girişi Onayla
            </Button>
          </div>
        </div>
      )}

      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
          title="Etkinlik QR Kodu Tara"
        />
      )}
    </div>
  );
};

export default CheckInPage;

