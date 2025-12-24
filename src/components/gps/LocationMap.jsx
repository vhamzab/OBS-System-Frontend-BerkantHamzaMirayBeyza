import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Maximize2, Minimize2 } from 'lucide-react';

import { useTranslation } from 'react-i18next';
/**
 * Location Map Component using Leaflet
 * Displays user location and classroom location on a map
 */
const LocationMap = ({
  userLocation,
  classroomLocation,
  geofenceRadius = 15,
  className = '',
  height = '300px',
}) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const circleRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [distance, setDistance] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Load Leaflet CSS and JS dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.L) {
      // Add Leaflet CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      // Add Leaflet JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    } else if (window.L) {
      setMapLoaded(true);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    if (!L) return;

    // Default center (Istanbul)
    const defaultCenter = [41.0082, 28.9784];
    const center = classroomLocation
      ? [classroomLocation.latitude, classroomLocation.longitude]
      : userLocation
      ? [userLocation.latitude, userLocation.longitude]
      : defaultCenter;

    const map = L.map(mapRef.current).setView(center, 17);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded]);

  // Update markers and circle
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    const L = window.L;
    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    if (circleRef.current) circleRef.current.remove();

    // Add classroom marker and geofence circle
    if (classroomLocation) {
      const classroomIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-8 h-8 bg-indigo-600 rounded-full border-2 border-white shadow-lg">
                 <svg class="w-5 h-5 text-gray-800 dark:text-gray-100" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                 </svg>
               </div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      markersRef.current.classroom = L.marker(
        [classroomLocation.latitude, classroomLocation.longitude],
        { icon: classroomIcon }
      )
        .addTo(map)
        .bindPopup(`<b>Derslik</b><br/>Geofence: ${geofenceRadius}m`);

      // Add geofence circle
      circleRef.current = L.circle([classroomLocation.latitude, classroomLocation.longitude], {
        color: '#4f46e5',
        fillColor: '#4f46e5',
        fillOpacity: 0.1,
        radius: geofenceRadius,
      }).addTo(map);
    }

    // Add user location marker
    if (userLocation) {
      const isWithinGeofence =
        classroomLocation &&
        calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          classroomLocation.latitude,
          classroomLocation.longitude
        ) <= geofenceRadius + (userLocation.accuracy || 0) + 5;

      const userIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-8 h-8 ${isWithinGeofence ? 'bg-green-500' : 'bg-red-500'} rounded-full border-2 border-white shadow-lg animate-pulse">
                 <svg class="w-5 h-5 text-gray-800 dark:text-gray-100" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                 </svg>
               </div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      markersRef.current.user = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userIcon,
      })
        .addTo(map)
        .bindPopup(
          `<b>Konumunuz</b><br/>Doğruluk: ±${Math.round(userLocation.accuracy || 0)}m`
        );

      // Add accuracy circle for user
      if (userLocation.accuracy) {
        L.circle([userLocation.latitude, userLocation.longitude], {
          color: isWithinGeofence ? '#22c55e' : '#ef4444',
          fillColor: isWithinGeofence ? '#22c55e' : '#ef4444',
          fillOpacity: 0.1,
          radius: userLocation.accuracy,
          dashArray: '5, 5',
        }).addTo(map);
      }
    }

    // Calculate distance
    if (userLocation && classroomLocation) {
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        classroomLocation.latitude,
        classroomLocation.longitude
      );
      setDistance(Math.round(dist));

      // Fit bounds to show both markers
      const bounds = L.latLngBounds([
        [userLocation.latitude, userLocation.longitude],
        [classroomLocation.latitude, classroomLocation.longitude],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 17);
    } else if (classroomLocation) {
      map.setView([classroomLocation.latitude, classroomLocation.longitude], 17);
    }
  }, [mapLoaded, userLocation, classroomLocation, geofenceRadius]);

  const isWithinGeofence =
    distance !== null && distance <= geofenceRadius + (userLocation?.accuracy || 0) + 5;

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Map Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Konum Haritası</span>
        </div>
        <div className="flex items-center gap-3">
          {distance !== null && (
            <span
              className={`text-sm font-medium px-2 py-1 rounded ${
                isWithinGeofence
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {distance}m uzaklıkta
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 dark:bg-gray-700 rounded"
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" />
            ) : (
              <Maximize2 className="h-4 w-4 text-gray-500 dark:text-gray-400 dark:text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{ height: isExpanded ? '500px' : height }}
        className="w-full transition-all duration-300"
      />

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t text-xs text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-indigo-600 rounded-full" />
          <span>Derslik</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span>Siz (Geofence içinde)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span>Siz (Geofence dışında)</span>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
