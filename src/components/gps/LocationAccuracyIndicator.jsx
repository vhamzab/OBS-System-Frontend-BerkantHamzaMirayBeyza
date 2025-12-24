import { Signal, SignalLow, SignalMedium, SignalHigh, AlertTriangle } from 'lucide-react';

import { useTranslation } from 'react-i18next';
/**
 * Location Accuracy Indicator Component
 * Shows GPS accuracy level with visual indicator
 */
const LocationAccuracyIndicator = ({ accuracy, className = '' }) => {
  const { t } = useTranslation();
  const getAccuracyLevel = () => {
    if (!accuracy) return 'unknown';
    if (accuracy <= 5) return 'excellent';
    if (accuracy <= 10) return 'good';
    if (accuracy <= 20) return 'fair';
    if (accuracy <= 50) return 'poor';
    return 'very-poor';
  };

  const getAccuracyConfig = () => {
    const level = getAccuracyLevel();

    switch (level) {
      case 'excellent':
        return {
          icon: SignalHigh,
          label: 'Mükemmel',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          description: 'GPS sinyali çok güçlü',
          bars: 4,
        };
      case 'good':
        return {
          icon: SignalHigh,
          label: 'İyi',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          description: 'GPS sinyali güçlü',
          bars: 3,
        };
      case 'fair':
        return {
          icon: SignalMedium,
          label: 'Orta',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          description: 'GPS sinyali kabul edilebilir',
          bars: 2,
        };
      case 'poor':
        return {
          icon: SignalLow,
          label: 'Zayıf',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          description: 'GPS sinyali zayıf, dışarı çıkmayı deneyin',
          bars: 1,
        };
      case 'very-poor':
        return {
          icon: AlertTriangle,
          label: 'Çok Zayıf',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          description: 'GPS sinyali yetersiz, açık alana geçin',
          bars: 0,
        };
      default:
        return {
          icon: Signal,
          label: 'Bilinmiyor',
          color: 'text-gray-500 dark:text-gray-400 dark:text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-900',
          borderColor: 'border-gray-200 dark:border-gray-700',
          description: 'GPS durumu bilinmiyor',
          bars: 0,
        };
    }
  };

  const config = getAccuracyConfig();
  const IconComponent = config.icon;

  return (
    <div className={`rounded-lg border p-3 ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${config.bgColor}`}>
            <IconComponent className={`h-5 w-5 ${config.color}`} />
          </div>
          <div>
            <p className={`font-medium ${config.color}`}>
              GPS Doğruluğu: {config.label}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              {accuracy ? `±${Math.round(accuracy)}m` : 'Hesaplanıyor...'}
            </p>
          </div>
        </div>

        {/* Signal bars */}
        <div className="flex items-end gap-0.5">
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              className={`w-1.5 rounded-sm transition-all ${
                bar <= config.bars ? config.color.replace('text-', 'bg-') : 'bg-gray-300'
              }`}
              style={{ height: `${bar * 4 + 4}px` }}
            />
          ))}
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">{config.description}</p>

      {getAccuracyLevel() === 'very-poor' && (
        <div className="mt-2 text-xs text-red-600 flex items-start gap-1">
          <AlertTriangle className="h-3 w-3 mt-0.5" />
          <span>Bu doğruluk seviyesiyle yoklama veremeyebilirsiniz.</span>
        </div>
      )}
    </div>
  );
};

export default LocationAccuracyIndicator;
