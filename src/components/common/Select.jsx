import React from 'react';

const Select = ({
  id,
  name,
  value,
  onChange,
  label,
  error,
  required = false,
  children, // To pass <option> elements
  className = '',
  disabled = false,
  ...props
}) => {
  const errorStyle = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:focus:ring-blue-600 dark:focus:border-blue-600';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id || name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none sm:text-sm dark:bg-gray-700 dark:text-white ${errorStyle} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Select;