import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { i18n } from '@/lib/i18n/config';

import enMeta from '@/dictionaries/en/metadata.json';
import esMeta from '@/dictionaries/es/metadata.json';
import deMeta from '@/dictionaries/de/metadata.json';
import itMeta from '@/dictionaries/it/metadata.json';
import enCompressDict from '@/dictionaries/en/compress-image.json';
import esCompressDict from '@/dictionaries/es/compress-image.json';
import deCompressDict from '@/dictionaries/de/compress-image.json';
import itCompressDict from '@/dictionaries/it/compress-image.json';

const metaDicts: Record<string, typeof enMeta> = {
  en: enMeta,
  es: esMeta,
  de: deMeta,
  it: itMeta,
};

const compressDicts: Record<string, typeof enCompressDict> = {
  en: enCompressDict,
  es: esCompressDict,
  de: deCompressDict,
  it: itCompressDict,
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
  const meta = metaDicts[lang].compressImage;

  const languages: Record<string, string> = {};
  for (const locale of i18n.locales) {
    if (locale === 'en') {
      languages[locale] = `${baseUrl}/compress-image`;
    } else {
      languages[locale] = `${baseUrl}/${locale}/compress-image`;
    }
  }
  languages['x-default'] = `${baseUrl}/compress-image`;

  const canonicalUrl = lang === 'en'
    ? `${baseUrl}/compress-image`
    : `${baseUrl}/${lang}/compress-image`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: ['compress images', 'image compressor', 'reduce image size', 'compress jpg', 'compress png', 'bulk image compression', 'free image compressor'],
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

export default function CompressImageLangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = (i18n.locales.includes(params.lang as Locale) ? params.lang : 'en') as Locale;
  const canonicalUrl = lang === 'en'
    ? `${baseUrl}/compress-image`
    : `${baseUrl}/${lang}/compress-image`;

  const faqItems = extractFaqItems(compressDicts[lang].faq);

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
        name: 'PixBatch Image Compressor',
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
