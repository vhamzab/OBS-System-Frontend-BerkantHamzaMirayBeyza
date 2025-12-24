import LoadingSpinner from './LoadingSpinner';

import { useTranslation } from 'react-i18next';
const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) => {
  const { t } = useTranslation();
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-red-600 text-gray-800 dark:text-gray-100 font-semibold rounded-xl border-2 border-red-700 hover:bg-red-500 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-lg shadow-red-500/30',
  };

  const sizes = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        inline-flex items-center justify-center gap-2
        ${className}
      `}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
};

export default Button;

