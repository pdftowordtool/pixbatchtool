'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, ChevronDown } from 'lucide-react';
import { i18n, localeNames, localeFlags } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';

interface LanguageSwitcherProps {
  currentLocale: Locale;
  className?: string;
}

export default function LanguageSwitcher({ currentLocale, className = '' }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    // Set cookie for locale preference
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;

    // Figure out the base path without locale prefix
    let basePath = pathname;
    
    // Remove existing locale prefix if present
    for (const locale of i18n.locales) {
      if (pathname.startsWith(`/${locale}/`)) {
        basePath = pathname.substring(locale.length + 1);
        break;
      }
      if (pathname === `/${locale}`) {
        basePath = '/';
        break;
      }
    }

    // Build new path
    let newPath: string;
    if (newLocale === i18n.defaultLocale) {
      // English uses the root path (no prefix)
      newPath = basePath;
    } else {
      // Other locales get a prefix
      newPath = `/${newLocale}${basePath}`;
    }

    setIsOpen(false);
    router.push(newPath);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 shadow-sm"
        aria-label="Select language"
        id="language-switcher-button"
      >
        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="hidden sm:inline">{localeFlags[currentLocale]}</span>
        <span className="text-xs sm:text-sm">{localeNames[currentLocale]}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {i18n.locales.map((locale) => {
            const isActive = locale === currentLocale;
            return (
              <button
                key={locale}
                onClick={() => switchLocale(locale)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
                id={`lang-switch-${locale}`}
              >
                <span className="text-lg">{localeFlags[locale]}</span>
                <span className="flex-1 text-left">{localeNames[locale]}</span>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
