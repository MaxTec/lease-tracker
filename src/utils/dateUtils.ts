import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

/**
 * Convierte una fecha tipo "YYYY-MM-DD" a Date UTC a medianoche.
 */
export const parseToUTCDate = (isoDateString: string): Date => {
  const d = parseISO(isoDateString);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
};

/**
 * Formatea una fecha en UTC a string legible en español.
 * Ejemplo: 2025-05-01T00:00:00Z → "1 de mayo de 2025"
 */
export const formatDate = (
  date: string | Date,
  formatStr: string = "d 'de' MMMM 'de' yyyy",
  timeZone: string = 'UTC'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatInTimeZone(dateObj, timeZone, formatStr, { locale: es });
};

/**
 * Para debug: imprime fecha en UTC en formato completo legible.
 */
export const logDateUTC = (label: string, date: Date) => {
  const out = formatInTimeZone(date, 'UTC', 'yyyy-MM-dd HH:mm:ssXXX', {
    locale: es,
  });
  console.log(`${label}: ${out} (UTC)`);
};

/**
 * DateInput-ready helper: convierte un Date local a string YYYY-MM-DD en UTC.
 */
export const toUTCString = (localDate: Date): string => {
  const utcDate = new Date(Date.UTC(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate()
  ));
  return formatInTimeZone(utcDate, 'UTC', 'yyyy-MM-dd');
};

export type SupportedLocale = 'es' | 'en';

/**
 * Devuelve una etiqueta legible para un día del mes, internacionalizada.
 * @param day Día del mes (1-31), o 0 para el último día
 * @param locale Idioma ('es' o 'en'), por defecto 'es'
 * @returns Etiqueta legible en el idioma seleccionado
 */
export const getDayOfMonthLabel = (
  day: number,
  locale: SupportedLocale = 'es'
): string => {
  if (locale === 'en') {
    if (day === 1) return 'First day of the month';
    if (day === 0) return 'Last day of the month';
    return `Every ${day} of the month`;
  }
  // Default: Spanish
  if (day === 1) return 'Primer día del mes';
  if (day === 30 || day === 31) return 'Último día del mes';
  return `Cada ${day} del mes`;
};
