'use client';

import {
  FileText,
  Scale,
  UserX,
  AlertTriangle,
  ShieldCheck,
  CreditCard,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';

import enDict from '@/dictionaries/en/terms.json';
import esDict from '@/dictionaries/es/terms.json';
import deDict from '@/dictionaries/de/terms.json';
import itDict from '@/dictionaries/it/terms.json';

const dictionaries: Record<string, typeof enDict> = {
  en: enDict,
  es: esDict,
  de: deDict,
  it: itDict,
};

export default function Terms() {
  const { locale } = useLocale();
  const t = dictionaries[locale] || enDict;

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:py-16">
        <div className="text-center space-y-8">
          <h1
            className="font-bold tracking-tight text-gray-900 dark:text-white leading-tight"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontSize: '3rem' }}
          >
            {t.hero.titlePrefix} <span className="text-blue-600">{t.hero.titleHighlight}</span>
          </h1>
          <p
            className="mx-auto max-w-3xl leading-relaxed text-gray-600 dark:text-gray-400"
            style={{ fontSize: '1.1rem' }}
          >
            {t.hero.description}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {t.hero.lastUpdatedLabel}: {t.hero.lastUpdatedDate}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 lg:px-8 pb-20">
        <div className="space-y-12">
          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.acceptanceOfTerms.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              {t.sections.acceptanceOfTerms.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-cyan-500 hover:shadow-lg"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-cyan-600 dark:text-cyan-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.useOfService.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.useOfService.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.useOfService.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-green-500 hover:shadow-lg"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 flex items-center justify-center flex-shrink-0">
                <UserX className="w-6 h-6 text-green-600 dark:text-green-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.userAccounts.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.userAccounts.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.userAccounts.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.userAccounts.outro}</p>
            </div>
          </div>

          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-amber-500 hover:shadow-lg"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 flex items-center justify-center flex-shrink-0">
                <Scale className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.intellectualPropertyRights.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              {t.sections.intellectualPropertyRights.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-orange-500 hover:shadow-lg"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6 text-orange-600 dark:text-orange-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.paymentAndBilling.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.paymentAndBilling.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.paymentAndBilling.items.map((item, index) => (
                  <li key={index}>
                    <strong>{item.label}:</strong> {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-rose-500 hover:shadow-lg"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.disclaimerOfWarranties.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.disclaimerOfWarranties.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.disclaimerOfWarranties.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.disclaimerOfWarranties.outro}</p>
            </div>
          </div>

          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-teal-500 hover:shadow-lg"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" strokeWidth={2} />
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

          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-sky-500 hover:shadow-lg"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/30 border border-sky-100 dark:border-sky-800 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-6 h-6 text-sky-600 dark:text-sky-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.termination.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.termination.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.termination.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.termination.outro}</p>
            </div>
          </div>

          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-lime-500 hover:shadow-lg"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-lime-50 dark:bg-lime-900/30 border border-lime-100 dark:border-lime-800 flex items-center justify-center flex-shrink-0">
                <Scale className="w-6 h-6 text-lime-600 dark:text-lime-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.governingLaw.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              {t.sections.governingLaw.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.sections.changesToTerms.title}
              </h2>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.changesToTerms.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.changesToTerms.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.changesToTerms.outro}</p>
            </div>
          </div>

          <div
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-8"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {t.sections.contactUs.title}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{t.sections.contactUs.intro}</p>
            <div className="space-y-2 text-base text-gray-600 dark:text-gray-400">
              <p>
                <strong>{t.sections.contactUs.emailLabel}:</strong>{' '}
                <a href={`mailto:${t.sections.contactUs.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
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
