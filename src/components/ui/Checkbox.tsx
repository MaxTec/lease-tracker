import { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          ref={ref}
          className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${className}`}
          {...props}
        />
        <label className="text-sm text-gray-700">{label}</label>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox; 