import type { Metadata } from 'next';
import enDict from '@/dictionaries/en/resize-jpg.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Resize JPG Images Online Free - JPEG Resizer Tool',
  description: 'Free online JPG resizer. Resize JPEG images by pixels, percentage, or custom dimensions. Bulk resize multiple JPG files while maintaining quality.',
  keywords: ['resize jpg', 'jpeg resizer', 'resize jpeg online', 'bulk jpg resize', 'change jpg dimensions', 'jpg photo resizer'],
  openGraph: {
    title: 'Resize JPG Images Online Free',
    description: 'Resize JPEG images by pixels or percentage. Bulk resize multiple JPG files.',
    type: 'website',
    url: `${baseUrl}/resize-jpg`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resize JPG Images Online Free',
    description: 'Bulk resize JPG images while maintaining quality.',
  },
  alternates: {
    canonical: `${baseUrl}/resize-jpg`,
    languages: {
      en: `${baseUrl}/resize-jpg`,
      es: `${baseUrl}/es/resize-jpg`,
      de: `${baseUrl}/de/resize-jpg`,
      it: `${baseUrl}/it/resize-jpg`,
      'x-default': `${baseUrl}/resize-jpg`,
    },
  },
};

export default function ResizeJpgLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/resize-jpg`;

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
        name: 'PixBatch JPG Resizer',
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
