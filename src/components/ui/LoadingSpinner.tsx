"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string; // Color of the spinner
}

export default function LoadingSpinner({
  size = "md",
  color = "indigo-600",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4", // Adjusted sizes for Tailwind compatibility
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-[var(--tw-border-color)] ${sizeClasses[size]}`}
      style={`--tw-border-color:${color}`}
    ></div>
  );
}
