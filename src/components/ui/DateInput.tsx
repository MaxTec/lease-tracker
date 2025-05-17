"use client";

import { forwardRef, useEffect, useState } from "react";
import ReactDatePicker from "react-datepicker";
import { format as formatDate, parse } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

interface DateInputProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
  showMonthYearPicker?: boolean;
  showYearPicker?: boolean;
  disabled?: boolean;
}

const DateInput = forwardRef<HTMLDivElement, DateInputProps>(
  (
    {
      label,
      value,
      onChange,
      error,
      className = "",
      showMonthYearPicker,
      showYearPicker,
      required,
      ...props
    },
    ref
  ) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
      if (!value) return null;
      try {
        let dateFormat = "yyyy-MM-dd";
        if (showMonthYearPicker) dateFormat = "yyyy-MM";
        if (showYearPicker) dateFormat = "yyyy";
        return parse(value, dateFormat, new Date());
      } catch {
        return null;
      }
    });

    useEffect(() => {
      if (!value) {
        setSelectedDate(null);
        return;
      }
      try {
        let dateFormat = "yyyy-MM-dd";
        if (showMonthYearPicker) dateFormat = "yyyy-MM";
        if (showYearPicker) dateFormat = "yyyy";
        const date = parse(value, dateFormat, new Date());
        setSelectedDate(date);
      } catch {
        setSelectedDate(null);
      }
    }, [value, showMonthYearPicker, showYearPicker]);

    const handleChange = (date: Date | null) => {
      setSelectedDate(date);
      if (date) {
        let dateFormat = "yyyy-MM-dd";
        if (showMonthYearPicker) dateFormat = "yyyy-MM";
        if (showYearPicker) dateFormat = "yyyy";
        onChange(formatDate(date, dateFormat));
      } else {
        onChange("");
      }
    };

    return (
      <div className={`w-full ${className}`} ref={ref}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <ReactDatePicker
          {...props}
          selected={selectedDate}
          onChange={handleChange}
          dateFormat={
            showYearPicker
              ? "yyyy"
              : showMonthYearPicker
              ? "MMMM yyyy"
              : "yyyy-MM-dd"
          }
          className={`w-full p-2 border rounded-md ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          placeholderText={
            showYearPicker
              ? "Select Year"
              : showMonthYearPicker
              ? "Select Month"
              : "YYYY-MM-DD"
          }
          // isClearable
          showMonthDropdown={!showMonthYearPicker && !showYearPicker}
          showYearDropdown={!showMonthYearPicker && !showYearPicker}
          showMonthYearPicker={showMonthYearPicker}
          showYearPicker={showYearPicker}
          dropdownMode="select"
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

DateInput.displayName = "DateInput";

export default DateInput;
