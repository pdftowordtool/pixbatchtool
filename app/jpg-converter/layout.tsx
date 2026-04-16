import type { Metadata } from 'next';
import enDict from '@/dictionaries/en/jpg-converter.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Convert to JPG Online Free - Image to JPEG Converter',
  description: 'Free online JPG converter. Convert PNG, WebP, AVIF, GIF to JPG format. Bulk convert multiple images to JPEG instantly with quality control.',
  keywords: ['jpg converter', 'convert to jpg', 'png to jpg', 'webp to jpg', 'image to jpeg', 'bulk jpg converter', 'free jpg converter'],
  openGraph: {
    title: 'Convert to JPG Online Free',
    description: 'Convert PNG, WebP, AVIF to JPG format. Bulk convert multiple images to JPEG.',
    type: 'website',
    url: `${baseUrl}/jpg-converter`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Convert to JPG Online Free',
    description: 'Bulk convert images to JPEG format with quality control.',
  },
  alternates: {
    canonical: `${baseUrl}/jpg-converter`,
    languages: {
      en: `${baseUrl}/jpg-converter`,
      es: `${baseUrl}/es/jpg-converter`,
      de: `${baseUrl}/de/jpg-converter`,
      it: `${baseUrl}/it/jpg-converter`,
      'x-default': `${baseUrl}/jpg-converter`,
    },
  },
};

export default function JpgConverterLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/jpg-converter`;

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
        name: 'PixBatch JPG Converter',
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
