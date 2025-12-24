import { useState, useCallback } from 'react';
import { MapPin, AlertCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';

import { useTranslation } from 'react-i18next';
/**
 * GPS Permission Handler Component
 * Handles GPS permission requests and location retrieval
 */
const GPSPermissionHandler = ({ onLocationReceived, onError, className = '' }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('idle'); // idle, requesting, success, error, denied
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Tarayıcınız konum servislerini desteklemiyor');
      onError?.('Tarayıcınız konum servislerini desteklemiyor');
      return;
    }

    setStatus('requesting');
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
        };

        setLocation(locationData);
        setAccuracy(position.coords.accuracy);
        setStatus('success');
        onLocationReceived?.(locationData);
      },
      (error) => {
        let errorMessage = 'Konum alınamadı';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini etkinleştirin.';
            setStatus('denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Konum bilgisi alınamıyor. Lütfen GPS\'inizin açık olduğundan emin olun.';
            setStatus('error');
            break;
          case error.TIMEOUT:
            errorMessage = 'Konum alınırken zaman aşımı oluştu. Lütfen tekrar deneyin.';
            setStatus('error');
            break;
          default:
            errorMessage = 'Bilinmeyen bir hata oluştu';
            setStatus('error');
        }

        setError(errorMessage);
        onError?.(errorMessage);
      },
      options
    );
  }, [onLocationReceived, onError]);

  const getStatusIcon = () => {
    switch (status) {
      case 'requesting':
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
      case 'denied':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <MapPin className="h-6 w-6 text-gray-400 dark:text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'requesting':
        return 'Konum alınıyor...';
      case 'success':
        return `Konum alındı (±${Math.round(accuracy)}m doğruluk)`;
      case 'error':
        return error;
      case 'denied':
        return error;
      default:
        return 'Yoklama vermek için konum izni gereklidir';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'requesting':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
      case 'denied':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()} ${className}`}>
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className={`text-sm ${status === 'error' || status === 'denied' ? 'text-red-700' : 'text-gray-700 dark:text-gray-200'}`}>
            {getStatusText()}
          </p>
          {location && status === 'success' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1">
              Koordinatlar: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
          )}
        </div>
        {(status === 'idle' || status === 'error') && (
          <button
            onClick={requestLocation}
            className="px-4 py-2 bg-indigo-600 text-gray-800 dark:text-gray-100 text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            {status === 'error' ? 'Tekrar Dene' : 'Konum Al'}
          </button>
        )}
      </div>

      {status === 'denied' && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium">Konum izni nasıl verilir:</p>
              <ol className="list-decimal ml-4 mt-1 space-y-1">
                <li>Tarayıcı adres çubuğundaki kilit simgesine tıklayın</li>
                <li>Site ayarlarını açın</li>
                <li>Konum iznini "İzin ver" olarak değiştirin</li>
                <li>Sayfayı yenileyin</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GPSPermissionHandler;
