import { useState } from 'react';
import { FiX, FiCopy, FiCheck } from 'react-icons/fi';
import QRCode from 'qrcode.react';
import toast from 'react-hot-toast';

/**
 * QR Code Display Component
 * Shows QR code with full-screen modal option
 */
const QRCodeDisplay = ({ qrCode, title = 'QR Kod', size = 200, showFullScreen = true }) => {
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
        <div className="p-4 bg-white rounded-xl shadow-lg">
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
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-700"
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
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{title}</h3>
              <button
                onClick={() => setIsFullScreen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-6">
              <div className="p-6 bg-white rounded-xl shadow-lg">
                <QRCode value={qrCode} size={300} level="H" />
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">QR Kod:</p>
                <p className="font-mono text-sm bg-slate-100 p-2 rounded break-all">{qrCode}</p>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

