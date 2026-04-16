import type { Metadata } from 'next';

import enCropPngDict from '@/dictionaries/en/crop-png.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Crop PNG Images Online Free - PNG Cropper Tool',
  description: 'Free online PNG cropper. Crop PNG images while preserving transparency. Fast, private, and works completely in your browser.',
  keywords: ['crop png', 'png cropper', 'crop png online', 'crop transparent png', 'free png cropper'],
  openGraph: {
    title: 'Crop PNG Images Online Free',
    description: 'Crop PNG images while preserving transparency. Fast, private, browser-based.',
    type: 'website',
    url: `${baseUrl}/crop-png`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crop PNG Images Online Free',
    description: 'Crop PNG images while preserving transparency.',
  },
  alternates: {
    canonical: `${baseUrl}/crop-png`,
    languages: {
      en: `${baseUrl}/crop-png`,
      es: `${baseUrl}/es/crop-png`,
      de: `${baseUrl}/de/crop-png`,
      it: `${baseUrl}/it/crop-png`,
      'x-default': `${baseUrl}/crop-png`,
    },
  },
};

export default function CropPngLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/crop-png`;

  const faqEntities = enCropPngDict.faq.items.map((item, index) => ({
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
        name: 'PixBatch PNG Cropper',
        url: canonicalUrl,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        inLanguage: 'en',
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
