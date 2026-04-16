import type { Metadata } from 'next';

import enRemoveExifDict from '@/dictionaries/en/remove-exif.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Remove EXIF Data Online Free - Strip Image Metadata',
  description: 'Free online EXIF remover. Remove metadata from images including GPS location, camera info, and personal data. Protect your privacy before sharing photos.',
  keywords: ['remove exif', 'strip metadata', 'delete image exif', 'remove gps from photo', 'privacy image tool', 'bulk exif remover'],
  openGraph: {
    title: 'Remove EXIF Data Online Free - Strip Image Metadata',
    description: 'Remove metadata from images including GPS location and personal data. Protect your privacy.',
    type: 'website',
    url: `${baseUrl}/remove-exif`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remove EXIF Data Online Free',
    description: 'Strip metadata from photos to protect your privacy.',
  },
  alternates: {
    canonical: `${baseUrl}/remove-exif`,
    languages: {
      en: `${baseUrl}/remove-exif`,
      es: `${baseUrl}/es/remove-exif`,
      de: `${baseUrl}/de/remove-exif`,
      it: `${baseUrl}/it/remove-exif`,
      'x-default': `${baseUrl}/remove-exif`,
    },
  },
};

export default function RemoveExifLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/remove-exif`;

  const faqEntities = enRemoveExifDict.faq.items.map((item, index) => ({
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
        name: 'PixBatch EXIF Remover',
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
