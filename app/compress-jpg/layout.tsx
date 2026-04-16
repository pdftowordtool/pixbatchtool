import type { Metadata } from 'next';
import enDict from '@/dictionaries/en/compress-jpg.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Compress JPG Images Online Free - Reduce JPEG File Size',
  description: 'Free online JPG compressor. Reduce JPEG file size by up to 80% while maintaining quality. Bulk compress multiple JPG images instantly.',
  keywords: ['compress jpg', 'jpeg compressor', 'reduce jpg size', 'compress jpeg online', 'bulk jpg compression', 'free jpg compressor'],
  openGraph: {
    title: 'Compress JPG Images Online Free',
    description: 'Reduce JPEG file size by up to 80% while maintaining quality. Bulk compress multiple JPG images.',
    type: 'website',
    url: `${baseUrl}/compress-jpg`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compress JPG Images Online Free',
    description: 'Reduce JPEG file size by up to 80% while maintaining quality.',
  },
  alternates: {
    canonical: `${baseUrl}/compress-jpg`,
    languages: {
      en: `${baseUrl}/compress-jpg`,
      es: `${baseUrl}/es/compress-jpg`,
      de: `${baseUrl}/de/compress-jpg`,
      it: `${baseUrl}/it/compress-jpg`,
      'x-default': `${baseUrl}/compress-jpg`,
    },
  },
};

export default function CompressJpgLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/compress-jpg`;

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
        name: 'PixBatch JPG Compressor',
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
