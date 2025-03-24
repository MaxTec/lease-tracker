import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export const formatDate = (
  date: string | Date,
  formatStr: string = "MM/dd/yyyy",
  timeZone: string = "UTC"
) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(dateObj, timeZone, formatStr);
};
