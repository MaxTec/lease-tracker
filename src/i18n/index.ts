import { getRequestConfig } from 'next-intl/server';
import { Locale, locales, defaultLocale } from './settings';

export default getRequestConfig(async ({ locale }) => {
    // Validate that the incoming locale is supported and use default if not
    const currentLocale = (locales.includes(locale as Locale))
        ? locale
        : defaultLocale;

    // Load messages for the current locale
    const messages = (await import(`./messages/${currentLocale}.json`)).default;

    // Use type assertion to satisfy TypeScript
    return {
        locale: currentLocale as string,
        messages,
        timeZone: 'America/Los_Angeles'
    };
}); 