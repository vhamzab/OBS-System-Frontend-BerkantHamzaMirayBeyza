import { useMemo } from 'react';
import { Navigation, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

import { useTranslation } from 'react-i18next';
/**
 * Distance Calculator Component
 * Shows distance from classroom and whether student is within geofence
 */
const DistanceCalculator = ({
  userLocation,
  classroomLocation,
  geofenceRadius = 15,
  className = '',
}) => {
  const { t } = useTranslation();
  // Calculate distance using Haversine formula
  const { distance, isWithin, allowedDistance } = useMemo(() => {
    if (!userLocation || !classroomLocation) {
      return { distance: null, isWithin: false, allowedDistance: 0 };
    }

    const R = 6371000; // Earth's radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;

    const lat1 = parseFloat(userLocation.latitude);
    const lon1 = parseFloat(userLocation.longitude);
    const lat2 = parseFloat(classroomLocation.latitude);
    const lon2 = parseFloat(classroomLocation.longitude);

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const dist = R * c;

    // Calculate allowed distance with accuracy buffer
    const accuracyBuffer = Math.min(userLocation.accuracy || 0, 20);
    const allowed = geofenceRadius + accuracyBuffer + 5;

    return {
      distance: Math.round(dist),
      isWithin: dist <= allowed,
      allowedDistance: Math.round(allowed),
    };
  }, [userLocation, classroomLocation, geofenceRadius]);

  if (!userLocation || !classroomLocation) {
    return (
      <div className={`rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900 ${className}`}>
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 dark:text-gray-500">
          <Navigation className="h-5 w-5" />
          <span className="text-sm">Mesafe hesaplamak için konum bilgisi gerekli</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border p-4 ${
        isWithin ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isWithin ? (
            <CheckCircle className="h-6 w-6 text-green-500" />
          ) : (
            <XCircle className="h-6 w-6 text-red-500" />
          )}
          <div>
            <p className={`font-medium ${isWithin ? 'text-green-700' : 'text-red-700'}`}>
              {isWithin ? 'Geofence İçindesiniz' : 'Geofence Dışındasınız'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Derslikten <span className="font-semibold">{distance}m</span> uzaklıktasınız
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">İzin verilen mesafe</p>
          <p className="font-semibold text-gray-700 dark:text-gray-200">{allowedDistance}m</p>
        </div>
      </div>

      {!isWithin && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <p>
                Yoklama verebilmek için dersliğin <strong>{geofenceRadius}m</strong> yarıçapındaki
                alanda olmanız gerekmektedir.
              </p>
              <p className="mt-1">
                Şu an <strong>{distance - allowedDistance}m</strong> fazla uzaktasınız.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Distance visualization */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-1">
          <span>0m</span>
          <span>Derslik</span>
          <span>{Math.max(distance, allowedDistance) + 10}m</span>
        </div>
        <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* Geofence area */}
          <div
            className="absolute h-full bg-green-200"
            style={{
              width: `${(allowedDistance / (Math.max(distance, allowedDistance) + 10)) * 100}%`,
            }}
          />
          {/* User position marker */}
          <div
            className={`absolute h-full w-1 ${isWithin ? 'bg-green-600' : 'bg-red-600'}`}
            style={{
              left: `${Math.min((distance / (Math.max(distance, allowedDistance) + 10)) * 100, 100)}%`,
              transform: 'translateX(-50%)',
            }}
          />
          {/* Classroom marker */}
          <div
            className="absolute h-full w-2 bg-indigo-600"
            style={{ left: '0%' }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-green-200 rounded" />
            <span className="text-gray-600 dark:text-gray-300">Geofence ({allowedDistance}m)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-3 h-3 rounded ${isWithin ? 'bg-green-600' : 'bg-red-600'}`} />
            <span className="text-gray-600 dark:text-gray-300">Konumunuz ({distance}m)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistanceCalculator;
