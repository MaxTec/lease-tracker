"use client";

import React, { createContext, useContext, useState } from "react";

interface TimeZoneContextType {
  timeZone: string;
  setTimeZone: (tz: string) => void;
}

const TimeZoneContext = createContext<TimeZoneContextType | undefined>(undefined);
const DEFAULT_TIMEZONE = "UTC";
export function TimeZoneProvider({ children }: { children: React.ReactNode }) {
  // Default to the user's system timezone, falling back to 'UTC' if not available
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIMEZONE);


  return <TimeZoneContext.Provider value={{ timeZone, setTimeZone }}>{children}</TimeZoneContext.Provider>;
}

export function useTimeZone() {
  const context = useContext(TimeZoneContext);
  if (context === undefined) {
    throw new Error("useTimeZone must be used within a TimeZoneProvider");
  }
  return context;
}
