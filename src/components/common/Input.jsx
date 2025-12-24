import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

import { useTranslation } from 'react-i18next';
const Input = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  disabled = false,
  required = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const hasError = touched && error;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
        )}
        <input
          id={name}
          name={name}
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            input-field
            ${Icon ? 'pl-12' : ''}
            ${isPassword ? 'pr-12' : ''}
            ${hasError ? 'input-error' : ''}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300 transition-colors"
          >
            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {hasError && <p className="error-text">{error}</p>}
    </div>
  );
};

export default Input;

