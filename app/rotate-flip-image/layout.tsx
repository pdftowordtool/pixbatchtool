import type { Metadata } from 'next';

import enRotateFlipDict from '@/dictionaries/en/rotate-flip-image.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Rotate & Flip Images Online Free - Image Rotation Tool',
  description: 'Free online image rotator. Rotate images 90°, 180°, 270° or flip horizontally/vertically. Bulk rotate and flip multiple images at once.',
  keywords: ['rotate image', 'flip image', 'image rotation', 'rotate photo', 'flip photo horizontally', 'flip vertically', 'bulk rotate images'],
  openGraph: {
    title: 'Rotate & Flip Images Online Free',
    description: 'Rotate images 90°, 180°, 270° or flip horizontally/vertically. Bulk process multiple images.',
    type: 'website',
    url: `${baseUrl}/rotate-flip-image`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rotate & Flip Images Online Free',
    description: 'Bulk rotate and flip images with ease.',
  },
  alternates: {
    canonical: `${baseUrl}/rotate-flip-image`,
    languages: {
      en: `${baseUrl}/rotate-flip-image`,
      es: `${baseUrl}/es/rotate-flip-image`,
      de: `${baseUrl}/de/rotate-flip-image`,
      it: `${baseUrl}/it/rotate-flip-image`,
      'x-default': `${baseUrl}/rotate-flip-image`,
    },
  },
};

export default function RotateFlipLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/rotate-flip-image`;

  const faqEntities = enRotateFlipDict.faq.items.map((item, index) => ({
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
        name: 'PixBatch Image Rotator',
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
