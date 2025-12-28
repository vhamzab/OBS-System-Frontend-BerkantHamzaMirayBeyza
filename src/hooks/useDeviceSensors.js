import { useState, useEffect, useRef } from 'react';

/**
 * Hook to collect device sensor data for spoofing detection
 * Collects accelerometer, gyroscope, and orientation data
 */
const useDeviceSensors = (enabled = true) => {
  const [sensorData, setSensorData] = useState(null);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const permissionRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // Check if DeviceMotionEvent is supported
    if (typeof DeviceMotionEvent === 'undefined' || !DeviceMotionEvent.requestPermission) {
      // iOS 13+ requires permission
      setIsSupported(true);
      return;
    }

    // Check if already have permission
    if (DeviceMotionEvent.permission === 'granted') {
      setIsSupported(true);
      startSensorCollection();
    } else if (DeviceMotionEvent.permission === 'denied') {
      setError('Cihaz sensör erişimi reddedildi');
      setIsSupported(false);
    } else {
      // Request permission
      DeviceMotionEvent.requestPermission()
        .then((permission) => {
          if (permission === 'granted') {
            setIsSupported(true);
            startSensorCollection();
          } else {
            setError('Cihaz sensör erişimi reddedildi');
            setIsSupported(false);
          }
        })
        .catch((err) => {
          setError('Sensör izni alınamadı: ' + err.message);
          setIsSupported(false);
        });
    }

    return () => {
      if (permissionRef.current) {
        window.removeEventListener('devicemotion', permissionRef.current);
        window.removeEventListener('deviceorientation', permissionRef.current);
      }
    };
  }, [enabled]);

  const startSensorCollection = () => {
    const motionHandler = (event) => {
      const data = {
        timestamp: Date.now(),
        accelerometer: {
          x: event.acceleration?.x || null,
          y: event.acceleration?.y || null,
          z: event.acceleration?.z || null,
          // Including gravity
          xWithGravity: event.accelerationIncludingGravity?.x || null,
          yWithGravity: event.accelerationIncludingGravity?.y || null,
          zWithGravity: event.accelerationIncludingGravity?.z || null,
        },
        rotationRate: {
          alpha: event.rotationRate?.alpha || null, // z-axis rotation
          beta: event.rotationRate?.beta || null,  // x-axis rotation
          gamma: event.rotationRate?.gamma || null, // y-axis rotation
        },
        interval: event.interval || null,
      };

      setSensorData(data);
    };

    const orientationHandler = (event) => {
      setSensorData((prev) => ({
        ...prev,
        orientation: {
          alpha: event.alpha || null, // z-axis rotation (0-360)
          beta: event.beta || null,    // x-axis rotation (-180 to 180)
          gamma: event.gamma || null,  // y-axis rotation (-90 to 90)
        },
      }));
    };

    window.addEventListener('devicemotion', motionHandler);
    window.addEventListener('deviceorientation', orientationHandler);

    permissionRef.current = { motionHandler, orientationHandler };
  };

  /**
   * Get current sensor snapshot
   */
  const getSnapshot = () => {
    return sensorData;
  };

  /**
   * Collect sensor data over a period of time
   * @param {number} durationMs - Duration in milliseconds
   * @param {number} sampleRate - Samples per second
   */
  const collectSamples = (durationMs = 2000, sampleRate = 10) => {
    return new Promise((resolve) => {
      const samples = [];
      const interval = 1000 / sampleRate;
      const endTime = Date.now() + durationMs;

      const collect = () => {
        if (Date.now() >= endTime) {
          resolve(samples);
          return;
        }

        if (sensorData) {
          samples.push({
            ...sensorData,
            timestamp: Date.now(),
          });
        }

        setTimeout(collect, interval);
      };

      collect();
    });
  };

  return {
    sensorData,
    error,
    isSupported,
    getSnapshot,
    collectSamples,
  };
};

export default useDeviceSensors;

