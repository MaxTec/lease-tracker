"use client";

import React from "react";

interface TextareaProps {
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  label?: string;
  value?: string;
  disabled?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({
  onChange,
  placeholder,
  required,
  label,
  error,
  value,
  disabled,
  ...props
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        onChange={onChange}
        placeholder={placeholder}
        // required={required}
        className={`w-full p-2 border rounded-md ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        value={value}
        disabled={disabled}
        {...props}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Textarea;
