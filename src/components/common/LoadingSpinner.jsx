const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="status"
      aria-busy="true"
      aria-label="Yükleniyor"
    >
      <div
        className={`${sizes[size]} border-primary-500/30 border-t-primary-500 rounded-full animate-spin`}
        aria-hidden="true"
      />
      <span className="sr-only">Yükleniyor...</span>
    </div>
  );
};

export default LoadingSpinner;
