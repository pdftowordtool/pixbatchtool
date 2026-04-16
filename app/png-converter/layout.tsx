import type { Metadata } from 'next';
import enDict from '@/dictionaries/en/png-converter.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Convert to PNG Online Free - Image to PNG Converter',
  description: 'Free online PNG converter. Convert JPG, WebP, AVIF, GIF to PNG format with transparency support. Bulk convert multiple images instantly.',
  keywords: ['png converter', 'convert to png', 'jpg to png', 'webp to png', 'image to png', 'bulk png converter', 'free png converter'],
  openGraph: {
    title: 'Convert to PNG Online Free',
    description: 'Convert JPG, WebP, AVIF to PNG format with transparency support. Bulk convert multiple images.',
    type: 'website',
    url: `${baseUrl}/png-converter`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convert to PNG Online Free',
    description: 'Bulk convert images to PNG format with transparency support.',
  },
  alternates: {
    canonical: `${baseUrl}/png-converter`,
    languages: {
      en: `${baseUrl}/png-converter`,
      es: `${baseUrl}/es/png-converter`,
      de: `${baseUrl}/de/png-converter`,
      it: `${baseUrl}/it/png-converter`,
      'x-default': `${baseUrl}/png-converter`,
    },
  },
};

export default function PngConverterLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/png-converter`;

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
        name: 'PixBatch PNG Converter',
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
