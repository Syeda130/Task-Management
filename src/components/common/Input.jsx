import React from 'react';

const Input = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  label,
  error,
  required = false,
  className = '',
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
      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm dark:bg-gray-700 dark:text-white ${errorStyle} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Input;