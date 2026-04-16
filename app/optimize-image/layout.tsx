import type { Metadata } from 'next';
import enOptimizeDict from '@/dictionaries/en/optimize-image.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Optimize Images Online Free - Compress & Reduce File Size',
  description: 'Free online image optimizer. Compress JPG, PNG, WebP, and AVIF images without quality loss. Reduce file size by up to 80% for faster website loading.',
  keywords: ['image optimizer', 'compress images', 'reduce image size', 'image compression', 'optimize jpg', 'optimize png', 'webp converter', 'bulk image optimizer'],
  openGraph: {
    title: 'Optimize Images Online Free - Compress & Reduce File Size',
    description: 'Free online image optimizer. Compress JPG, PNG, WebP, and AVIF images without quality loss. Reduce file size by up to 80%.',
    type: 'website',
    url: `${baseUrl}/optimize-image`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Optimize Images Online Free',
    description: 'Free online image optimizer. Compress images without quality loss.',
  },
  alternates: {
    canonical: `${baseUrl}/optimize-image`,
    languages: {
      'en': `${baseUrl}/optimize-image`,
      'es': `${baseUrl}/es/optimize-image`,
      'de': `${baseUrl}/de/optimize-image`,
      'it': `${baseUrl}/it/optimize-image`,
      'x-default': `${baseUrl}/optimize-image`,
    },
  },
};

export default function OptimizeImageLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/optimize-image`;

  const faqEntities = enOptimizeDict.faq.items.map((item, index) => ({
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
        name: 'PixBatch Image Optimizer',
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
