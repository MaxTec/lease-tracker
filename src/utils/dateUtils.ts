import { format, parseISO } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

export const formatDate = (
    date: string | Date,
    formatStr: string = 'MM/dd/yyyy',
    timeZone: string = 'America/Cancun',
) => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const zonedDate = toZonedTime(dateObj, timeZone);
    return format(zonedDate, formatStr);
}; 