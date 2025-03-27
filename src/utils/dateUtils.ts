import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { es } from 'date-fns/locale';
import type { Locale } from 'date-fns';

export const formatDate = (
  date: string | Date,
  formatStr: string = "MM/dd/yyyy",
  timeZone: string = "UTC",
  locale: Locale = es
) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(dateObj, timeZone, formatStr, { locale });
};
