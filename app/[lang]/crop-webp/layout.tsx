import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { i18n } from '@/lib/i18n/config';

import enMeta from '@/dictionaries/en/metadata.json';
import esMeta from '@/dictionaries/es/metadata.json';
import deMeta from '@/dictionaries/de/metadata.json';
import itMeta from '@/dictionaries/it/metadata.json';

import enCropWebpDict from '@/dictionaries/en/crop-webp.json';
import esCropWebpDict from '@/dictionaries/es/crop-webp.json';
import deCropWebpDict from '@/dictionaries/de/crop-webp.json';
import itCropWebpDict from '@/dictionaries/it/crop-webp.json';

const metaDicts: Record<string, typeof enMeta> = {
  en: enMeta,
  es: esMeta,
  de: deMeta,
  it: itMeta,
};

const cropDicts: Record<string, typeof enCropWebpDict> = {
  en: enCropWebpDict,
  es: esCropWebpDict,
  de: deCropWebpDict,
  it: itCropWebpDict,
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
  const meta = metaDicts[lang].cropWebp;

  const languages: Record<string, string> = {};
  for (const locale of i18n.locales) {
    if (locale === 'en') {
      languages[locale] = `${baseUrl}/crop-webp`;
    } else {
      languages[locale] = `${baseUrl}/${locale}/crop-webp`;
    }
  }
  languages['x-default'] = `${baseUrl}/crop-webp`;

  const canonicalUrl = lang === 'en' ? `${baseUrl}/crop-webp` : `${baseUrl}/${lang}/crop-webp`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: ['crop webp', 'webp cropper', 'crop webp online', 'bulk webp crop', 'free webp cropper'],
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

export default function CropWebpLangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = (i18n.locales.includes(params.lang as Locale) ? params.lang : 'en') as Locale;
  const canonicalUrl = lang === 'en' ? `${baseUrl}/crop-webp` : `${baseUrl}/${lang}/crop-webp`;

  const faqEntities = cropDicts[lang].faq.items.map((item, index) => ({
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
        name: 'PixBatch WebP Cropper',
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
