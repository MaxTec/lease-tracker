'use client';

import { TimeZoneProvider } from '@/contexts/TimeZoneContext';

export default function TimeZoneWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TimeZoneProvider>{children}</TimeZoneProvider>;
} 