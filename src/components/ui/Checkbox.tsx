import { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  error?: string;
}

export default function Checkbox({
  label,
  id,
  className = '',
  error,
  ...props
}: CheckboxProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-start">
        <input
          type="checkbox"
          id={id}
          className={`h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
            error ? 'border-red-500' : ''
          } ${className}`}
          {...props}
        />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-700">
          {label}
        </label>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 