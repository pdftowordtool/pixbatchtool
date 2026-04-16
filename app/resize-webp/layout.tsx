import type { Metadata } from 'next';
import enDict from '@/dictionaries/en/resize-webp.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Resize WebP Images Online Free - WebP Resizer Tool',
  description: 'Free online WebP resizer. Resize WebP images by pixels, percentage, or custom dimensions. Bulk resize multiple WebP files while maintaining quality.',
  keywords: ['resize webp', 'webp resizer', 'resize webp online', 'bulk webp resize', 'change webp dimensions', 'webp image resizer'],
  openGraph: {
    title: 'Resize WebP Images Online Free',
    description: 'Resize WebP images by pixels or percentage. Bulk resize multiple WebP files.',
    type: 'website',
    url: `${baseUrl}/resize-webp`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resize WebP Images Online Free',
    description: 'Bulk resize WebP images while maintaining quality.',
  },
  alternates: {
    canonical: `${baseUrl}/resize-webp`,
    languages: {
      en: `${baseUrl}/resize-webp`,
      es: `${baseUrl}/es/resize-webp`,
      de: `${baseUrl}/de/resize-webp`,
      it: `${baseUrl}/it/resize-webp`,
      'x-default': `${baseUrl}/resize-webp`,
    },
  },
};

export default function ResizeWebpLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/resize-webp`;

  const faqEntities = enDict.faq.items.map((item, index) => ({
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataString }} />
      {children}
    </>
  );
}
