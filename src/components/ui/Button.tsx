'use client';

import { forwardRef } from 'react';
import { Button as HeadlessUIButton } from '@headlessui/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullwidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    className = '', 
    disabled,
    fullwidth = false,
    ...props 
  }, ref) => {
    const variantClasses = {
      primary: 'bg-blue-500 hover:bg-blue-600 text-white',
      secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
      success: 'bg-green-500 hover:bg-green-600 text-white',
      danger: 'bg-red-500 hover:bg-red-600 text-white',
      outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50'
    };

    const sizeClasses = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
    };

    return (
      <HeadlessUIButton
        ref={ref}
        className={`
          ${variantClasses[variant]} 
          ${sizeClasses[size]} 
          rounded-md font-medium transition-colors
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          ${fullwidth ? 'w-full' : ''}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        ) : children}
      </HeadlessUIButton>
    );
  }
);

Button.displayName = 'Button';

export default Button; 