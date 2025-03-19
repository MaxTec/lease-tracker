'use client';

import { forwardRef, useEffect, useState } from 'react';
import DatePicker from 'react-date-picker';
import { format } from 'date-fns';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { FORMAT_DATE } from '@/constants';

interface DateInputProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

type DateValue = Date | null;

const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  ({ label, value, onChange, error, className = '' }, ref) => {
    const [date, setDate] = useState<DateValue>(value ? new Date(value) : null);

    // Update the date when the value prop changes
    useEffect(() => {
      if (value) {
        try {
          setDate(new Date(value));
        } catch {
          // If date parsing fails, set to null
          setDate(null);
        }
      } else {
        setDate(null);
      }
    }, [value]);

    const handleChange = (newDate: DateValue | [DateValue, DateValue]) => {
      if (newDate instanceof Date) {
        setDate(newDate);
        // Format the date as YYYY-MM-DD for form submission
        onChange(format(newDate, FORMAT_DATE));
      } else if (Array.isArray(newDate) && newDate[0] instanceof Date) {
        setDate(newDate[0]);
        onChange(format(newDate[0], FORMAT_DATE));
      } else {
        setDate(null);
        onChange('');
      }
    };

    return (
      <div className={`w-full ${className}`} ref={ref}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <DatePicker
          onChange={handleChange}
          value={date}
          format="y-MM-dd"
          clearIcon={null}
          className={`w-full rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
          dayPlaceholder="dd"
          monthPlaceholder="mm"
          yearPlaceholder="yyyy"
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