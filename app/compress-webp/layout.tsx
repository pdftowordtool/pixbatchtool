import type { Metadata } from 'next';
import enDict from '@/dictionaries/en/compress-webp.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Compress WebP Images Online Free - Reduce webp File Size',
  description: 'Free online WebP compressor. Reduce webp file size by up to 80% while maintaining quality. Bulk compress multiple WebP images instantly.',
  keywords: ['Compress WebP', 'webp compressor', 'reduce WebP size', 'compress webp online', 'bulk WebP compression', 'free WebP compressor'],
  openGraph: {
    title: 'Compress WebP Images Online Free',
    description: 'Reduce webp file size by up to 80% while maintaining quality. Bulk compress multiple WebP images.',
    type: 'website',
    url: `${baseUrl}/compress-webp`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compress WebP Images Online Free',
    description: 'Reduce webp file size by up to 80% while maintaining quality.',
  },
  alternates: {
    canonical: `${baseUrl}/compress-webp`,
    languages: {
      en: `${baseUrl}/compress-webp`,
      es: `${baseUrl}/es/compress-webp`,
      de: `${baseUrl}/de/compress-webp`,
      it: `${baseUrl}/it/compress-webp`,
      'x-default': `${baseUrl}/compress-webp`,
    },
  },
};

export default function compressWebpLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/compress-webp`;

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
        name: 'PixBatch WebP Compressor',
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

