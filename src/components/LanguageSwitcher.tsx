'use client';

import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Locale, locales } from '@/i18n/settings';
import { Menu } from '@headlessui/react';
import { FiChevronDown } from 'react-icons/fi';
import Image from 'next/image';

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Handle language change
  const handleLocaleChange = (newLocale: Locale) => {
    if (locale === newLocale) return;
    
    try {
      // Get the path without the locale prefix
      const pathWithoutLocale = pathname.replace(new RegExp(`^/(${locales.join('|')})`), '') || '/';
      
      // Determine the new path
      const newPath = '/' + newLocale + (pathWithoutLocale === '/' ? '' : pathWithoutLocale);
      
      startTransition(() => {
        router.replace(newPath);
      });
    } catch (e) {
      console.error('Error switching language:', e);
    }
  };

  // Language display names and country flags
  const languageData: Record<Locale, { name: string, flagCode: string }> = {
    en: { name: 'English', flagCode: 'US' },
    es: { name: 'Español', flagCode: 'MX' }
  };

  return (
    <div className="relative">
      <Menu>
        <Menu.Button
          className={`flex items-center gap-2 px-3 py-1.5 rounded bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none text-sm ${
            isPending ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isPending}
        >
          <Image 
            src={`https://flagsapi.com/${languageData[locale].flagCode}/flat/24.png`}
            alt={`${languageData[locale].name} flag`}
            width={24}
            height={24}
            className="rounded-sm"
          />
          {languageData[locale].name}
          <FiChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
        </Menu.Button>
        <Menu.Items className="absolute right-0 mt-1 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            {locales.map((localeOption) => (
              <Menu.Item key={localeOption}>
                {({ active }) => (
                  <button
                    onClick={() => handleLocaleChange(localeOption)}
                    disabled={locale === localeOption || isPending}
                    className={`${
                      active || locale === localeOption ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                      locale === localeOption ? 'font-medium' : 'font-normal'
                    }`}
                  >
                    <Image 
                      src={`https://flagsapi.com/${languageData[localeOption].flagCode}/flat/24.png`}
                      alt={`${languageData[localeOption].name} flag`}
                      width={24}
                      height={24}
                      className="rounded-sm"
                    />
                    {languageData[localeOption].name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Menu>
    </div>
  );
} 