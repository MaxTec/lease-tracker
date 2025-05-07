'use client';

type BadgeStatus = 'success' | 'error' | 'warning' | 'info' | 'default';

export interface BadgeProps {
  status?: BadgeStatus;
  children: React.ReactNode;
  className?: string;
}

const statusStyles = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
};

export default function Badge({ status = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]} ${className}`}
    >
      {children}
    </span>
  );
} 