import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { i18n } from '@/lib/i18n/config';

import enMeta from '@/dictionaries/en/metadata.json';
import esMeta from '@/dictionaries/es/metadata.json';
import deMeta from '@/dictionaries/de/metadata.json';
import itMeta from '@/dictionaries/it/metadata.json';
import enResizerDict from '@/dictionaries/en/image-resizer.json';
import esResizerDict from '@/dictionaries/es/image-resizer.json';
import deResizerDict from '@/dictionaries/de/image-resizer.json';
import itResizerDict from '@/dictionaries/it/image-resizer.json';

const metaDicts: Record<string, typeof enMeta> = {
  en: enMeta,
  es: esMeta,
  de: deMeta,
  it: itMeta,
};

const resizerDicts: Record<string, typeof enResizerDict> = {
  en: enResizerDict,
  es: esResizerDict,
  de: deResizerDict,
  it: itResizerDict,
};

const localeMap: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  de: 'de_DE',
  it: 'it_IT',
};

const baseUrl = 'https://pixbatch.com';

type FaqItem = { question: string; answer: string };

function extractFaqItems(faq: unknown): FaqItem[] {
  if (!faq || typeof faq !== 'object') return [];
  const faqRecord = faq as Record<string, unknown>;

  if (Array.isArray(faqRecord.items)) {
    return faqRecord.items.filter((item): item is FaqItem => {
      if (!item || typeof item !== 'object') return false;
      const record = item as Record<string, unknown>;
      return typeof record.question === 'string' && typeof record.answer === 'string';
    });
  }

  const items: FaqItem[] = [];
  for (const [key, value] of Object.entries(faqRecord)) {
    if (!/^q\d+$/.test(key) || typeof value !== 'string') continue;
    const index = key.slice(1);
    const answer = faqRecord[`a${index}`];
    if (typeof answer === 'string') {
      items.push({ question: value, answer });
    }
  }
  return items;
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang = (i18n.locales.includes(params.lang as Locale) ? params.lang : 'en') as Locale;
  const meta = metaDicts[lang].imageResizer;

  const languages: Record<string, string> = {};
  for (const locale of i18n.locales) {
    if (locale === 'en') {
      languages[locale] = `${baseUrl}/image-resizer`;
    } else {
      languages[locale] = `${baseUrl}/${locale}/image-resizer`;
    }
  }
  languages['x-default'] = `${baseUrl}/image-resizer`;

  const canonicalUrl = lang === 'en'
    ? `${baseUrl}/image-resizer`
    : `${baseUrl}/${lang}/image-resizer`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: ['resize images', 'image resizer', 'bulk image resize', 'resize photos online', 'change image dimensions', 'photo resizer'],
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      type: 'website',
      url: canonicalUrl,
      locale: localeMap[lang],
      alternateLocale: i18n.locales
        .filter((l) => l !== lang)
        .map((l) => localeMap[l]),
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

export default function ImageResizerLangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = (i18n.locales.includes(params.lang as Locale) ? params.lang : 'en') as Locale;
  const canonicalUrl = lang === 'en'
    ? `${baseUrl}/image-resizer`
    : `${baseUrl}/${lang}/image-resizer`;

  const faqItems = extractFaqItems(resizerDicts[lang].faq);

  const faqEntities = faqItems.map((item, index) => ({
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
        name: 'PixBatch Image Resizer',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataString }}
      />
      {children}
    </>
  );
}
