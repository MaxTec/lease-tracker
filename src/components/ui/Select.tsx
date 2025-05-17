'use client';

import { forwardRef } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', required, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className={`block text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-700"} mb-1`}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <select
          disabled={disabled}
          ref={ref}
          className={`w-full p-2 border rounded-md ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : ""} ${className}`}
          {...props}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select; 