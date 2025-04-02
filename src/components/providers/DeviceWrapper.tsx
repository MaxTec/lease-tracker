'use client';

import { DeviceProvider } from '@/contexts/DeviceContext';

interface DeviceWrapperProps {
  children: React.ReactNode;
  isMobile: boolean;
}

export default function DeviceWrapper({ children, isMobile }: DeviceWrapperProps) {
  return <DeviceProvider isMobile={isMobile}>{children}</DeviceProvider>;
} 