import type { Metadata } from 'next';
import type { Locale } from '@/lib/i18n/config';
import { i18n } from '@/lib/i18n/config';

import enMeta from '@/dictionaries/en/metadata.json';
import esMeta from '@/dictionaries/es/metadata.json';
import deMeta from '@/dictionaries/de/metadata.json';
import itMeta from '@/dictionaries/it/metadata.json';

import enCropDict from '@/dictionaries/en/crop-image.json';
import esCropDict from '@/dictionaries/es/crop-image.json';
import deCropDict from '@/dictionaries/de/crop-image.json';
import itCropDict from '@/dictionaries/it/crop-image.json';

const metaDicts: Record<string, typeof enMeta> = {
  en: enMeta,
  es: esMeta,
  de: deMeta,
  it: itMeta,
};

const cropDicts: Record<string, typeof enCropDict> = {
  en: enCropDict,
  es: esCropDict,
  de: deCropDict,
  it: itCropDict,
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
  const meta = metaDicts[lang].cropImage;

  const languages: Record<string, string> = {};
  for (const locale of i18n.locales) {
    if (locale === 'en') {
      languages[locale] = `${baseUrl}/crop-image`;
    } else {
      languages[locale] = `${baseUrl}/${locale}/crop-image`;
    }
  }
  languages['x-default'] = `${baseUrl}/crop-image`;

  const canonicalUrl = lang === 'en'
    ? `${baseUrl}/crop-image`
    : `${baseUrl}/${lang}/crop-image`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: ['crop image', 'image cropper', 'aspect ratio crop', 'crop jpg', 'crop png', 'crop webp', 'crop avif', 'online image crop tool'],
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

export default function CropImageLangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const lang = (i18n.locales.includes(params.lang as Locale) ? params.lang : 'en') as Locale;
  const canonicalUrl = lang === 'en' ? `${baseUrl}/crop-image` : `${baseUrl}/${lang}/crop-image`;

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
        name: 'PixBatch Image Cropper',
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
