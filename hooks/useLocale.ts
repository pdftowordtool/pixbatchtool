'use client';

import { usePathname } from 'next/navigation';
import { i18n } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';

import enCommon from '@/dictionaries/en/common.json';
import esCommon from '@/dictionaries/es/common.json';
import deCommon from '@/dictionaries/de/common.json';
import itCommon from '@/dictionaries/it/common.json';

const commonDicts: Record<string, typeof enCommon> = {
  en: enCommon,
  es: esCommon,
  de: deCommon,
  it: itCommon,
};

/**
 * Hook to detect the current locale from the URL path
 * and return the appropriate common dictionary (header/footer translations).
 */
export function useLocale() {
  const pathname = usePathname();

  let currentLocale: Locale = i18n.defaultLocale;

  for (const locale of i18n.locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      currentLocale = locale;
      break;
    }
  }

  return {
    locale: currentLocale,
    t: commonDicts[currentLocale],
    /** Returns a path with the correct locale prefix */
    localePath: (path: string) => {
      if (currentLocale === i18n.defaultLocale) return path;
      return `/${currentLocale}${path}`;
    },
  };
}
