'use client';

import { forwardRef, useEffect, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import { format, parse } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

interface DateInputProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  showMonthYearPicker?: boolean;
  disabled?: boolean;
}

const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  ({ label, value, onChange, error, className = '', ...props }, ref) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(
      value ? parse(value, 'yyyy-MM-dd', new Date()) : null
    );

    // Update the date when the value prop changes
    useEffect(() => {
      if (value) {
        try {
          setSelectedDate(parse(value, 'yyyy-MM-dd', new Date()));
        } catch {
          // If date parsing fails, set to null
          setSelectedDate(null);
        }
      } else {
        setSelectedDate(null);
      }
    }, [value]);

    const handleChange = (date: Date | null) => {
      setSelectedDate(date);
      if (date) {
        onChange(format(date, 'yyyy-MM-dd'));
      } else {
        onChange('');
      }
    };

    return (
      <div className={`w-full ${className}`} ref={ref}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <ReactDatePicker
          {...props}
          selected={selectedDate}
          onChange={handleChange}
          dateFormat="yyyy-MM-dd"
          className={`w-full p-2 border rounded-md ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholderText="YYYY-MM-DD"
          isClearable
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';

export default DateInput; 