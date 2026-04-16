import type { Metadata } from 'next';
import enResizerDict from '@/dictionaries/en/image-resizer.json';

const baseUrl = 'https://pixbatch.com';

type FaqItem = { question: string; answer: string };

function extractFaqItems(faq: unknown): FaqItem[] {
  if (!faq || typeof faq !== 'object') return [];
  const faqRecord = faq as Record<string, unknown>;

  if (Array.isArray(faqRecord.items)) {
    return faqRecord.items.filter((item): item is FaqItem => {
      if (!item || typeof item !== 'object') return false;
      const record = item as Record<string, unknown>;
      return typeof record.question === 'string' && typeof record.answer === 'string';
    });
  }

  const items: FaqItem[] = [];
  for (const [key, value] of Object.entries(faqRecord)) {
    if (!/^q\d+$/.test(key) || typeof value !== 'string') continue;
    const index = key.slice(1);
    const answer = faqRecord[`a${index}`];
    if (typeof answer === 'string') {
      items.push({ question: value, answer });
    }
  }
  return items;
}

export const metadata: Metadata = {
  title: 'Resize Images Online Free - Bulk Image Resizer Tool',
  description: 'Free online image resizer. Resize multiple images by pixels, percentage, or custom dimensions. Maintain aspect ratio and quality. Bulk resize JPG, PNG, WebP.',
  keywords: ['resize images', 'image resizer', 'bulk image resize', 'resize photos online', 'change image dimensions', 'photo resizer', 'scale images'],
  openGraph: {
    title: 'Resize Images Online Free - Bulk Image Resizer',
    description: 'Resize multiple images by pixels or percentage. Maintain aspect ratio and quality.',
    type: 'website',
    url: `${baseUrl}/image-resizer`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resize Images Online Free',
    description: 'Bulk resize images by pixels or percentage while maintaining quality.',
  },
  alternates: {
    canonical: `${baseUrl}/image-resizer`,
    languages: {
      'en': `${baseUrl}/image-resizer`,
      'es': `${baseUrl}/es/image-resizer`,
      'de': `${baseUrl}/de/image-resizer`,
      'it': `${baseUrl}/it/image-resizer`,
      'x-default': `${baseUrl}/image-resizer`,
    },
  },
};

export default function ImageResizerLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/image-resizer`;

  const faqItems = extractFaqItems(enResizerDict.faq);

  const faqEntities = faqItems.map((item, index) => ({
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
        name: 'PixBatch Image Resizer',
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
