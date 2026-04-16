'use client';

import {
  Shield,
  Eye,
  Lock,
  Database,
  UserCheck,
  FileText,
  AlertCircle,
  Mail,
} from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';

import enDict from '@/dictionaries/en/privacy-policy.json';
import esDict from '@/dictionaries/es/privacy-policy.json';
import deDict from '@/dictionaries/de/privacy-policy.json';
import itDict from '@/dictionaries/it/privacy-policy.json';

const dictionaries: Record<string, typeof enDict> = {
  en: enDict,
  es: esDict,
  de: deDict,
  it: itDict,
};

export default function Privacy() {
  const { locale } = useLocale();
  const t = dictionaries[locale] || enDict;

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:py-16">
        <div className="text-center space-y-8">
          <h1 className="font-bold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', fontSize: '3rem' }}>
            {t.hero.titlePrefix} <span className="text-blue-600">{t.hero.titleHighlight}</span>
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
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-blue-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.sections.informationWeCollect.title}
                </h2>
              </div>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.informationWeCollect.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.informationWeCollect.items.map((item, index) => (
                  <li key={index}>
                    <strong>{item.label}:</strong> {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-cyan-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6 text-cyan-600 dark:text-cyan-400" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.sections.imagesPrivate.title}
                </h2>
              </div>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.imagesPrivate.promise}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.imagesPrivate.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.imagesPrivate.outro}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-green-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-green-600 dark:text-green-400" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.sections.howWeUseInformation.title}
                </h2>
              </div>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.howWeUseInformation.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.howWeUseInformation.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.howWeUseInformation.outro}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-amber-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.sections.dataSecurity.title}
                </h2>
              </div>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.dataSecurity.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.dataSecurity.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-purple-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.sections.yourRights.title}
                </h2>
              </div>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.yourRights.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.yourRights.items.map((item, index) => (
                  <li key={index}>
                    <strong>{item.label}:</strong> {item.text}
                  </li>
                ))}
              </ul>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.sections.yourRights.outroPrefix}{' '}
                <a href={`mailto:${t.sections.contactUs.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {t.sections.contactUs.email}
                </a>
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-rose-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-rose-600 dark:text-rose-400" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.sections.thirdPartyServices.title}
                </h2>
              </div>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.thirdPartyServices.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.thirdPartyServices.items.map((item, index) => (
                  <li key={index}>
                    <strong>{item.label}:</strong> {item.text}
                  </li>
                ))}
              </ul>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.thirdPartyServices.outro}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-indigo-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.sections.childrenPrivacy.title}
                </h2>
              </div>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.childrenPrivacy.body}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 transition-all duration-300 hover:border-teal-500 hover:shadow-lg" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-teal-600 dark:text-teal-400" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.sections.changesToPolicy.title}
                </h2>
              </div>
            </div>
            <div className="ml-16 space-y-4">
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.changesToPolicy.intro}</p>
              <ul className="list-disc list-inside space-y-2 text-base text-gray-600 dark:text-gray-400">
                {t.sections.changesToPolicy.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">{t.sections.changesToPolicy.outro}</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-8" style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
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
