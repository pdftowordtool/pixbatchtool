import type { Metadata } from 'next';
import enDict from '@/dictionaries/en/webp-converter.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Convert to WebP Online Free - Image to WebP Converter',
  description: 'Free online WebP converter. Convert JPG, PNG, AVIF to WebP format for smaller file sizes. Bulk convert multiple images instantly for faster web loading.',
  keywords: ['webp converter', 'convert to webp', 'jpg to webp', 'png to webp', 'image to webp', 'bulk webp converter', 'free webp converter'],
  openGraph: {
    title: 'Convert to WebP Online Free',
    description: 'Convert JPG, PNG to WebP format for smaller file sizes. Bulk convert multiple images.',
    type: 'website',
    url: `${baseUrl}/webp-converter`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convert to WebP Online Free',
    description: 'Bulk convert images to WebP for faster web loading.',
  },
  alternates: {
    canonical: `${baseUrl}/webp-converter`,
    languages: {
      en: `${baseUrl}/webp-converter`,
      es: `${baseUrl}/es/webp-converter`,
      de: `${baseUrl}/de/webp-converter`,
      it: `${baseUrl}/it/webp-converter`,
      'x-default': `${baseUrl}/webp-converter`,
    },
  },
};

export default function WebpConverterLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/webp-converter`;

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
        name: 'PixBatch WebP Converter',
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
