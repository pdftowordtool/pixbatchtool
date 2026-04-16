'use client';

import {
  AlertTriangle,
  ShieldAlert,
  FileWarning,
  Info,
  ExternalLink,
  Lightbulb,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';

import enDict from '@/dictionaries/en/disclaimer.json';
import esDict from '@/dictionaries/es/disclaimer.json';
import deDict from '@/dictionaries/de/disclaimer.json';
import itDict from '@/dictionaries/it/disclaimer.json';

const dictionaries: Record<string, typeof enDict> = {
  en: enDict,
  es: esDict,
  de: deDict,
  it: itDict,
};

export default function Disclaimer() {
  const { locale } = useLocale();
  const t = dictionaries[locale] || enDict;

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:py-16">
        <div className="text-center space-y-8">
          <h1 className="font-bold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontSize: '3rem' }}>
            {t.hero.titlePrefix} <span className="text-amber-600">{t.hero.titleHighlight}</span>
          </h1>
          <p className="mx-auto max-w-3xl leading-relaxed text-gray-600 dark:text-gray-400" style={{ fontSize: '1.1rem' }}>
            {t.hero.description}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t.hero.lastUpdatedLabel}: {t.hero.lastUpdatedDate}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 lg:px-8 pb-20">
        <div className="space-y-12">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-amber-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.generalDisclaimer.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              {t.sections.generalDisclaimer.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-red-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.noWarranties.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.noWarranties.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.noWarranties.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.noWarranties.outro}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-orange-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800 flex items-center justify-center flex-shrink-0">
                <FileWarning className="w-6 h-6 text-orange-600 dark:text-orange-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.imageProcessingDisclaimer.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.imageProcessingDisclaimer.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.imageProcessingDisclaimer.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.imageProcessingDisclaimer.outro}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-cyan-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-6 h-6 text-cyan-600 dark:text-cyan-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.externalLinksDisclaimer.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              {t.sections.externalLinksDisclaimer.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-blue-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.professionalAdviceDisclaimer.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              {t.sections.professionalAdviceDisclaimer.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-green-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-green-600 dark:text-green-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.intellectualPropertyRights.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.intellectualPropertyRights.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.intellectualPropertyRights.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.intellectualPropertyRights.outro}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-purple-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.resultsAndPerformance.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.resultsAndPerformance.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.resultsAndPerformance.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.resultsAndPerformance.outro}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-rose-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.limitationOfLiability.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.limitationOfLiability.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.limitationOfLiability.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.limitationOfLiability.outro}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-teal-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-teal-600 dark:text-teal-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.changesToDisclaimer.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              {t.sections.changesToDisclaimer.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-8" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {t.sections.contactUs.title}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t.sections.contactUs.intro}</p>
            <div className="space-y-2 text-base text-gray-600 dark:text-gray-400">
              <p>
                <strong>{t.sections.contactUs.emailLabel}:</strong>{' '}
                <a href={`mailto:${t.sections.contactUs.email}`} className="text-amber-600 dark:text-amber-400 hover:underline">
                  {t.sections.contactUs.email}
                </a>
              </p>
              <p>
                <strong>{t.sections.contactUs.addressLabel}:</strong> {t.sections.contactUs.address}
              </p>
              <p>
                <strong>{t.sections.contactUs.phoneLabel}:</strong> {t.sections.contactUs.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
