import { FiChevronDown } from 'react-icons/fi';

const Select = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  options = [],
  placeholder = 'Seçiniz...',
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const hasError = touched && error;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="label">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`
            input-field appearance-none pr-10 cursor-pointer
            ${hasError ? 'input-error' : ''}
            ${!value ? 'text-slate-500' : ''}
          `}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
      </div>
      {hasError && <p className="error-text">{error}</p>}
    </div>
  );
};

export default Select;

