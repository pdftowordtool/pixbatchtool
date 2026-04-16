'use client';

import Link from 'next/link';
import { Users, Target, Award, Heart, Code, TrendingUp, Shield } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';

import enDict from '@/dictionaries/en/about.json';
import esDict from '@/dictionaries/es/about.json';
import deDict from '@/dictionaries/de/about.json';
import itDict from '@/dictionaries/it/about.json';

const dictionaries: Record<string, typeof enDict> = {
  en: enDict,
  es: esDict,
  de: deDict,
  it: itDict,
};

export default function About() {
  const { locale, localePath } = useLocale();
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
        </div>
      </div>

      <div style={{ paddingTop: '1rem' }}>
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {t.story.title}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {t.story.p1}
            </p>
            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {t.story.p2}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {t.values.title}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400">
              {t.values.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.values.items[0].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.values.items[0].description}
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:border-cyan-500 hover:shadow-lg"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              <div className="w-16 h-16 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center mb-4">
                <Code className="w-8 h-8 text-cyan-600 dark:text-cyan-400" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.values.items[1].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.values.items[1].description}
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:border-green-500 hover:shadow-lg"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              <div className="w-16 h-16 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-green-600 dark:text-green-400" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.values.items[2].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.values.items[2].description}
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:border-amber-500 hover:shadow-lg"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              }}
            >
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-amber-600 dark:text-amber-400" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.values.items[3].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t.values.items[3].description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {t.why.title}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400">
              {t.why.subtitle}
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.why.items[0].title}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.why.items[0].description}
                </p>
              </div>
            </div>

            <div className="flex gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-cyan-600 dark:text-cyan-400" strokeWidth={2} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.why.items[1].title}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.why.items[1].description}
                </p>
              </div>
            </div>

            <div className="flex gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600 dark:text-green-400" strokeWidth={2} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.why.items[2].title}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.why.items[2].description}
                </p>
              </div>
            </div>

            <div className="flex gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {t.why.items[3].title}
                </h3>
                <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t.why.items[3].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {t.cta.title}
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {t.cta.description}
          </p>
          <Link
            href={localePath('/')}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            style={{
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
            }}
          >
            {t.cta.button}
          </Link>
        </div>
      </div>
    </div>
  );
}
