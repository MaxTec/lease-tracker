"use client";

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", type, required, ...props }, ref) => {
    console.log("props", props);
    const isRadio = type === "radio";
    // const isRequired = required;

    return (
      <div className={`${isRadio ? "flex items-center" : "w-full"}`}>
        {isRadio ? (
          <label className="flex items-center cursor-pointer">
            <input
              ref={ref}
              type={type}
              className={`${
                error ? "border-red-500" : "border-gray-300"
              } ${className}`}
              {...props}
            />
            <span className="ml-1 text-sm font-medium text-gray-700">
              {label}
            </span>
          </label>
        ) : (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
              {required && <span className="text-red-500">*</span>}
            </label>
            <input
              ref={ref}
              type={type}
              className={`w-full p-2 border rounded-md ${
                error ? "border-red-500" : "border-gray-300"
              } ${className}`}
              {...props}
            />
          </>
        )}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
