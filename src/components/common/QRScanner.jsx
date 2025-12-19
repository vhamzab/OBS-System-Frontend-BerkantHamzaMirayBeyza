import { useEffect, useRef, useState } from 'react';
import { FiCamera, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { BrowserMultiFormatReader } from '@zxing/browser';

/**
 * QR Scanner Component
 * Uses HTML5 QR Code Scanner
 */
const QRScanner = ({ onScan, onClose, title = 'QR Kod Tara' }) => {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const streamRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const videoInputDevices = await codeReader.listVideoInputDevices();
      const deviceId = videoInputDevices.length > 0 ? videoInputDevices[0].deviceId : undefined;

      if (videoRef.current) {
        setScanning(true);
        codeReader.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              codeReader.reset();
              stopScanning();
              onScan(result.getText());
            }
            if (err && err.name !== 'NotFoundException') {
              // Ignore NotFoundException (no QR code found yet)
              console.error('QR scan error:', err);
            }
          }
        );
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Kamera erişimi reddedildi veya kamera bulunamadı');
      toast.error('Kamera erişimi başarısız');
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const handleManualInput = (e) => {
    e.preventDefault();
    const qrCode = e.target.qrCode.value.trim();
    if (qrCode) {
      onScan(qrCode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button
            onClick={() => {
              stopScanning();
              onClose();
            }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          {!scanning ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
                <FiCamera className="w-12 h-12 text-slate-400" />
              </div>
              <button
                onClick={startScanning}
                className="btn-primary flex items-center gap-2"
              >
                <FiCamera />
                Kamerayı Başlat
              </button>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg"
                autoPlay
                playsInline
                muted
              />
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-slate-600 mb-2 text-center">veya</p>
          <form onSubmit={handleManualInput} className="flex gap-2">
            <input
              type="text"
              name="qrCode"
              placeholder="QR kodu manuel girin"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="btn-primary">
              Doğrula
            </button>
          </form>
        </div>

        {scanning && (
          <button
            onClick={stopScanning}
            className="mt-4 w-full btn-secondary"
          >
            Taramayı Durdur
          </button>
        )}
      </div>
    </div>
  );
};

export default QRScanner;

