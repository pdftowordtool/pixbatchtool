import type { Metadata } from 'next';
import enConverterDict from '@/dictionaries/en/image-converter.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Convert Images Online Free - JPG PNG WebP AVIF Converter',
  description: 'Free online image converter. Convert between JPG, PNG, WebP, AVIF formats. Bulk convert multiple images instantly. No upload limits, 100% private.',
  keywords: ['image converter', 'convert images', 'jpg to png', 'png to jpg', 'webp converter', 'avif converter', 'bulk image converter', 'free image converter'],
  openGraph: {
    title: 'Convert Images Online Free - Image Format Converter',
    description: 'Convert between JPG, PNG, WebP, AVIF formats. Bulk convert multiple images instantly.',
    type: 'website',
    url: `${baseUrl}/image-converter`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convert Images Online Free',
    description: 'Bulk convert images between JPG, PNG, WebP, AVIF formats.',
  },
  alternates: {
    canonical: `${baseUrl}/image-converter`,
    languages: {
      en: `${baseUrl}/image-converter`,
      es: `${baseUrl}/es/image-converter`,
      de: `${baseUrl}/de/image-converter`,
      it: `${baseUrl}/it/image-converter`,
      'x-default': `${baseUrl}/image-converter`,
    },
  },
};

export default function ImageConverterLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/image-converter`;
  const faqEntities = enConverterDict.faq.items.map((item, index) => ({
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
        name: 'PixBatch Image Converter',
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
