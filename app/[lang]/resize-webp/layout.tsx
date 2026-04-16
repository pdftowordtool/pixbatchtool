import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { i18n } from '@/lib/i18n/config';

import enMeta from '@/dictionaries/en/metadata.json';
import esMeta from '@/dictionaries/es/metadata.json';
import deMeta from '@/dictionaries/de/metadata.json';
import itMeta from '@/dictionaries/it/metadata.json';

import enDict from '@/dictionaries/en/resize-webp.json';
import esDict from '@/dictionaries/es/resize-webp.json';
import deDict from '@/dictionaries/de/resize-webp.json';
import itDict from '@/dictionaries/it/resize-webp.json';

const metaDicts: Record<string, typeof enMeta> = {
  en: enMeta,
  es: esMeta,
  de: deMeta,
  it: itMeta,
};

const pageDicts: Record<string, typeof enDict> = {
  en: enDict,
  es: esDict,
  de: deDict,
  it: itDict,
};

const localeMap: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  de: 'de_DE',
  it: 'it_IT',
};

const baseUrl = 'https://pixbatch.com';

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang = (i18n.locales.includes(params.lang as Locale) ? params.lang : 'en') as Locale;
  const meta = metaDicts[lang].resizeWebp;

  const languages: Record<string, string> = {};
  for (const locale of i18n.locales) {
    if (locale === 'en') {
      languages[locale] = `${baseUrl}/resize-webp`;
    } else {
      languages[locale] = `${baseUrl}/${locale}/resize-webp`;
    }
  }
  languages['x-default'] = `${baseUrl}/resize-webp`;

  const canonicalUrl = lang === 'en' ? `${baseUrl}/resize-webp` : `${baseUrl}/${lang}/resize-webp`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: ['resize webp', 'webp resizer', 'resize webp online', 'bulk webp resize', 'change webp dimensions', 'webp image resizer'],
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      type: 'website',
      url: canonicalUrl,
      locale: localeMap[lang],
      alternateLocale: i18n.locales.filter((l) => l !== lang).map((l) => localeMap[l]),
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.twitterTitle,
      description: meta.twitterDescription,
    },
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
  };
}

export default function ResizeWebpLangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = (i18n.locales.includes(params.lang as Locale) ? params.lang : 'en') as Locale;
  const canonicalUrl = lang === 'en' ? `${baseUrl}/resize-webp` : `${baseUrl}/${lang}/resize-webp`;
  const dict = pageDicts[lang];

  const faqEntities = dict.faq.items.map((item, index) => ({
    '@type': 'Question',
    '@id': `${canonicalUrl}#faq-${index + 1}`,
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  }));

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${canonicalUrl}#webapp`,
        name: 'PixBatch WebP Resizer',
        url: canonicalUrl,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        inLanguage: lang,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        mainEntity: faqEntities,
      },
    ],
  };

  const structuredDataString = JSON.stringify(structuredData).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataString }} />
      {children}
    </>
  );
}
