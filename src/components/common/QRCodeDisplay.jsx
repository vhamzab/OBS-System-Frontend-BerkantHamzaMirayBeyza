import { useState } from 'react';
import { FiX, FiCopy, FiCheck } from 'react-icons/fi';
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';

import { useTranslation } from 'react-i18next';
/**
 * QR Code Display Component
 * Shows QR code with full-screen modal option
 */
const QRCodeDisplay = ({ qrCode, title = 'QR Kod', size = 200, showFullScreen = true }) => {
  const { t } = useTranslation();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      toast.success('QR kod kopyalandı');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Kopyalama başarısız');
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <QRCode value={qrCode} size={size} level="H" />
        </div>
        {showFullScreen && (
          <button
            onClick={() => setIsFullScreen(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Tam Ekran Görüntüle
          </button>
        )}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 hover:text-gray-700 dark:text-gray-200"
        >
          {copied ? (
            <>
              <FiCheck className="text-green-600" />
              Kopyalandı
            </>
          ) : (
            <>
              <FiCopy />
              Kodu Kopyala
            </>
          )}
        </button>
      </div>

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setIsFullScreen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{title}</h3>
              <button
                onClick={() => setIsFullScreen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-6">
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <QRCode value={qrCode} size={300} level="H" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">QR Kod:</p>
                <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">{qrCode}</p>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copied ? (
                  <>
                    <FiCheck />
                    Kopyalandı
                  </>
                ) : (
                  <>
                    <FiCopy />
                    Kodu Kopyala
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QRCodeDisplay;

