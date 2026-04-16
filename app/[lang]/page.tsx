'use client';

import { Image, Maximize2, Crop, RotateCw, Layers, Zap, ImageIcon, Shield, Box, Globe } from 'lucide-react';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import enHome from '@/dictionaries/en/home.json';
import esHome from '@/dictionaries/es/home.json';
import deHome from '@/dictionaries/de/home.json';
import itHome from '@/dictionaries/it/home.json';

const dictionaries: Record<string, typeof enHome> = {
  en: enHome,
  es: esHome,
  de: deHome,
  it: itHome,
};

const toolIcons = [Image, Maximize2, Crop, RotateCw, Layers, Zap, ImageIcon, Shield];
const toolIconBg = ['bg-red-50', 'bg-blue-50', 'bg-green-50', 'bg-cyan-50', 'bg-indigo-50', 'bg-amber-50', 'bg-purple-50', 'bg-emerald-50'];
const toolIconColor = ['text-red-600', 'text-blue-600', 'text-green-600', 'text-cyan-600', 'text-indigo-600', 'text-amber-600', 'text-purple-600', 'text-emerald-600'];

export default function LocalizedHomePage({ params }: { params: { lang: string } }) {
  const lang = (params.lang && Object.keys(dictionaries).includes(params.lang) ? params.lang : 'en') as Locale;
  const t = dictionaries[lang];
  const langPrefix = lang === 'en' ? '' : `/${lang}`;

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-6 py-20 lg:py-16">
        <div className="text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
            {t.hero.titleLine1}<br className="hidden lg:block" />
            <span className="text-blue-600"> {t.hero.titleHighlight}</span>
          </h1>
          <p className="mx-auto max-w-3xl leading-relaxed text-gray-600 dark:text-gray-400" style={{ fontSize: '1.1rem' }}>
            {t.hero.description}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8" style={{ paddingBottom: '3rem' }}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {t.tools.map((tool, index) => {
            const Icon = toolIcons[index];
            return (
              <Link
                key={tool.title}
                href={`${langPrefix}${tool.href}`}
                className="group relative flex flex-col border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-300 hover:border-blue-500 hover:shadow-xl hover:-translate-y-1"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                  borderRadius: '0'
                }}
              >
                <svg className="absolute top-0 right-0 w-4 h-4" style={{ pointerEvents: 'none' }}>
                  <path d="M 0 0 L 16 0 L 16 16 Z" className="fill-gray-300 group-hover:fill-blue-500 transition-all duration-300" />
                </svg>

                <div className={`inline-flex h-14 w-14 items-center justify-center rounded-lg ${toolIconBg[index]} mb-4 border border-gray-200/60 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
                  <Icon className={`h-7 w-7 ${toolIconColor[index]} transition-all duration-300 group-hover:scale-110`} strokeWidth={2} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300 group-hover:text-blue-600" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  {tool.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed transition-colors duration-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                  {tool.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {t.howItWorks.title}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t.howItWorks.subtitle}
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start justify-center gap-6 lg:gap-8 mb-10">
            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-800 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.howItWorks.steps[0].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t.howItWorks.steps[0].description}</p>
            </div>

            <div className="hidden md:block w-8 h-0.5 bg-gray-300 dark:bg-gray-600 flex-shrink-0 mt-10" />

            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-cyan-50 dark:bg-cyan-900/30 border-2 border-cyan-200 dark:border-cyan-800 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-cyan-600 dark:text-cyan-400" strokeWidth={2} />
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.howItWorks.steps[1].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t.howItWorks.steps[1].description}</p>
            </div>

            <div className="hidden md:block w-8 h-0.5 bg-gray-300 dark:bg-gray-600 flex-shrink-0 mt-10" />

            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 flex items-center justify-center">
                  <Box className="w-8 h-8 text-green-600 dark:text-green-400" strokeWidth={2} />
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-green-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.howItWorks.steps[2].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t.howItWorks.steps[2].description}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-gray-700 dark:text-gray-300">
              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium">{t.howItWorks.badge}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                {t.privacy.title}
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                {t.privacy.description}
              </p>

              <div className="space-y-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-100 dark:border-cyan-800 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-cyan-600 dark:text-cyan-400" strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      {t.privacy.items[0].title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t.privacy.items[0].description}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      {t.privacy.items[1].title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t.privacy.items[1].description}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      {t.privacy.items[2].title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t.privacy.items[2].description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-sm aspect-square bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                <div className="text-center">
                  <Shield className="w-32 h-32 text-blue-600 dark:text-blue-400 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-blue-600 dark:text-blue-400 font-bold text-base tracking-wider">
                    {t.privacy.badge}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              {t.faq.title}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400">{t.faq.subtitle}</p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {t.faq.items.map((item, index) => (
              <AccordionItem key={index} value={`item-${index + 1}`} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
