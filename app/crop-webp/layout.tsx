import type { Metadata } from 'next';

import enCropWebpDict from '@/dictionaries/en/crop-webp.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Crop WebP Images Online Free - WebP Cropper Tool',
  description: 'Free online WebP cropper. Easily crop WebP images with custom aspect ratios directly in your browser. Fast, private, and no server uploads.',
  keywords: ['crop webp', 'webp cropper', 'crop webp online', 'free webp cropper'],
  openGraph: {
    title: 'Crop WebP Images Online Free - WebP Cropper Tool',
    description: 'Easily crop WebP images with custom aspect ratios internally in your browser cleanly and privately.',
    type: 'website',
    url: 'https://pixbatch.com/crop-webp',
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crop WebP Images Online Free',
    description: 'Crop WebP images with custom aspect ratios safely.',
  },
  alternates: {
    canonical: `${baseUrl}/crop-webp`,
    languages: {
      en: `${baseUrl}/crop-webp`,
      es: `${baseUrl}/es/crop-webp`,
      de: `${baseUrl}/de/crop-webp`,
      it: `${baseUrl}/it/crop-webp`,
      'x-default': `${baseUrl}/crop-webp`,
    },
  },
};

export default function CropWebpLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/crop-webp`;

  const faqEntities = enCropWebpDict.faq.items.map((item, index) => ({
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
