import type { Metadata } from 'next';
import enDict from '@/dictionaries/en/compress-png.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Compress PNG Images Online Free - Reduce PNG File Size',
  description: 'Free online PNG compressor. Reduce PNG file size by up to 70% while preserving transparency. Bulk compress multiple PNG images instantly.',
  keywords: ['compress png', 'png compressor', 'reduce png size', 'compress png online', 'bulk png compression', 'png optimizer'],
  openGraph: {
    title: 'Compress PNG Images Online Free',
    description: 'Reduce PNG file size by up to 70% while preserving transparency. Bulk compress multiple PNG images.',
    type: 'website',
    url: `${baseUrl}/compress-png`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compress PNG Images Online Free',
    description: 'Reduce PNG file size while preserving transparency.',
  },
  alternates: {
    canonical: `${baseUrl}/compress-png`,
    languages: {
      en: `${baseUrl}/compress-png`,
      es: `${baseUrl}/es/compress-png`,
      de: `${baseUrl}/de/compress-png`,
      it: `${baseUrl}/it/compress-png`,
      'x-default': `${baseUrl}/compress-png`,
    },
  },
};

export default function CompressPngLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/compress-png`;

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
        name: 'PixBatch PNG Compressor',
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
