import type { Metadata } from 'next';

import enExifViewerDict from '@/dictionaries/en/exif-viewer.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'EXIF Viewer Online Free - View Image Metadata',
  description: 'Free online EXIF viewer. View image metadata including camera settings, GPS location, date taken, and more. Supports JPG, PNG, WebP, TIFF formats.',
  keywords: ['exif viewer', 'image metadata', 'photo exif data', 'view image info', 'camera settings', 'gps location photo', 'free exif viewer'],
  openGraph: {
    title: 'EXIF Viewer Online Free - View Image Metadata',
    description: 'View image metadata including camera settings, GPS location, date taken, and more.',
    type: 'website',
    url: `${baseUrl}/exif-viewer`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EXIF Viewer Online Free',
    description: 'View photo metadata - camera settings, GPS, date, and more.',
  },
  alternates: {
    canonical: `${baseUrl}/exif-viewer`,
    languages: {
      en: `${baseUrl}/exif-viewer`,
      es: `${baseUrl}/es/exif-viewer`,
      de: `${baseUrl}/de/exif-viewer`,
      it: `${baseUrl}/it/exif-viewer`,
      'x-default': `${baseUrl}/exif-viewer`,
    },
  },
};

export default function ExifViewerLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/exif-viewer`;

  const faqEntities = enExifViewerDict.faq.items.map((item, index) => ({
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
        name: 'PixBatch EXIF Viewer',
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
