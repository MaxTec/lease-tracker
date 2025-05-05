"use client";

import { FaSpinner } from "react-icons/fa";
import type { FC } from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string; // Tailwind color class, e.g., 'text-gray-500'
}

const sizeClasses: Record<NonNullable<LoadingSpinnerProps["size"]>, string> = {
  sm: "text-lg", // ~1.125rem
  md: "text-3xl", // ~1.875rem
  lg: "text-5xl", // ~3rem
};

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size = "md", color = "text-gray-500" }) => {
  return (
    <FaSpinner
      className={`animate-spin ${sizeClasses[size]} ${color}`}
      role="status"
      aria-label="Loading"
      tabIndex={0}
      focusable="false"
      data-testid="loading-spinner"
    />
  );
};

export default LoadingSpinner;
