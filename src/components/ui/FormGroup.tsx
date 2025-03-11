'use client';

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export default function FormGroup({ children, className = '' }: FormGroupProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
} 