"use client";

import React from "react";

interface TextareaProps {
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  label?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  onChange,
  placeholder,
  required,
  label,
  error,
  ...props
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full p-2 border rounded-md ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Textarea;
