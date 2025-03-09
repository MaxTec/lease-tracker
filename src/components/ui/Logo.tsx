import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <div className={`bg-white rounded-full w-16 h-16 flex items-center justify-center ${className}`}>
      <Image
        src="/logo.png"
        alt="LeaseTracker Logo"
        width={size}
        height={size}
        className="object-contain"
      />
    </div>
  );
} 