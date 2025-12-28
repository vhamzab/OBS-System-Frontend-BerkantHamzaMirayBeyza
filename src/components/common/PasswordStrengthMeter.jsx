import { useMemo } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

/**
 * Password Strength Meter Component
 * Shows visual feedback for password strength
 */
const PasswordStrengthMeter = ({ password = '' }) => {
  const strength = useMemo(() => {
    if (!password) return { level: 0, label: '', color: '', percentage: 0 };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    // Calculate score
    if (checks.length) score += 1;
    if (checks.lowercase) score += 1;
    if (checks.uppercase) score += 1;
    if (checks.number) score += 1;
    if (checks.special) score += 1;
    if (password.length >= 12) score += 1; // Bonus for longer passwords

    let level, label, color, percentage;

    if (score <= 2) {
      level = 1;
      label = 'Zayıf';
      color = 'red';
      percentage = 33;
    } else if (score <= 4) {
      level = 2;
      label = 'Orta';
      color = 'yellow';
      percentage = 66;
    } else if (score <= 5) {
      level = 3;
      label = 'İyi';
      color = 'blue';
      percentage = 85;
    } else {
      level = 4;
      label = 'Güçlü';
      color = 'green';
      percentage = 100;
    }

    return { level, label, color, percentage, checks };
  }, [password]);

  if (!password) return null;

  const getColorClasses = (color) => {
    switch (color) {
      case 'red':
        return 'bg-red-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getTextColorClasses = (color) => {
    switch (color) {
      case 'red':
        return 'text-red-600 dark:text-red-400';
      case 'yellow':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'blue':
        return 'text-blue-600 dark:text-blue-400';
      case 'green':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getColorClasses(strength.color)}`}
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${getTextColorClasses(strength.color)}`}>
          {strength.label}
        </span>
      </div>

      {/* Requirements Checklist */}
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className={`flex items-center gap-1.5 ${strength.checks.length ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {strength.checks.length ? (
            <FiCheck className="w-3.5 h-3.5" />
          ) : (
            <FiX className="w-3.5 h-3.5" />
          )}
          <span>En az 8 karakter</span>
        </div>
        <div className={`flex items-center gap-1.5 ${strength.checks.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {strength.checks.lowercase ? (
            <FiCheck className="w-3.5 h-3.5" />
          ) : (
            <FiX className="w-3.5 h-3.5" />
          )}
          <span>Küçük harf</span>
        </div>
        <div className={`flex items-center gap-1.5 ${strength.checks.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {strength.checks.uppercase ? (
            <FiCheck className="w-3.5 h-3.5" />
          ) : (
            <FiX className="w-3.5 h-3.5" />
          )}
          <span>Büyük harf</span>
        </div>
        <div className={`flex items-center gap-1.5 ${strength.checks.number ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {strength.checks.number ? (
            <FiCheck className="w-3.5 h-3.5" />
          ) : (
            <FiX className="w-3.5 h-3.5" />
          )}
          <span>Rakam</span>
        </div>
        {password.length > 0 && (
          <div className={`flex items-center gap-1.5 ${strength.checks.special ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {strength.checks.special ? (
              <FiCheck className="w-3.5 h-3.5" />
            ) : (
              <FiX className="w-3.5 h-3.5" />
            )}
            <span>Özel karakter (opsiyonel)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;

