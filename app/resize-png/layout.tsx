import type { Metadata } from 'next';
import enDict from '@/dictionaries/en/resize-png.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Resize PNG Images Online Free - PNG Resizer Tool',
  description: 'Free online PNG resizer. Resize PNG images with transparency preserved. Bulk resize multiple PNG files by pixels or percentage.',
  keywords: ['resize png', 'png resizer', 'resize png online', 'bulk png resize', 'change png dimensions', 'resize transparent png'],
  openGraph: {
    title: 'Resize PNG Images Online Free',
    description: 'Resize PNG images with transparency preserved. Bulk resize multiple PNG files.',
    type: 'website',
    url: `${baseUrl}/resize-png`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resize PNG Images Online Free',
    description: 'Bulk resize PNG images while preserving transparency.',
  },
  alternates: {
    canonical: `${baseUrl}/resize-png`,
    languages: {
      en: `${baseUrl}/resize-png`,
      es: `${baseUrl}/es/resize-png`,
      de: `${baseUrl}/de/resize-png`,
      it: `${baseUrl}/it/resize-png`,
      'x-default': `${baseUrl}/resize-png`,
    },
  },
};

export default function ResizePngLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/resize-png`;

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
        name: 'PixBatch PNG Resizer',
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
