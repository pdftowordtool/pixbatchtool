import type { Metadata } from 'next';
import enCompressDict from '@/dictionaries/en/compress-image.json';

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
  title: 'Compress Images Online Free - Reduce JPG, PNG, WebP Size',
  description: 'Free online image compressor. Reduce file size of JPG, PNG, WebP, GIF images by up to 80% without losing quality. Bulk compress multiple images at once.',
  keywords: ['compress images', 'image compressor', 'reduce image size', 'compress jpg', 'compress png', 'bulk image compression', 'free image compressor'],
  openGraph: {
    title: 'Compress Images Online Free - Reduce File Size',
    description: 'Free online image compressor. Reduce file size by up to 80% without losing quality. Bulk compress multiple images.',
    type: 'website',
    url: `${baseUrl}/compress-image`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compress Images Online Free',
    description: 'Reduce image file size by up to 80% without losing quality.',
  },
  alternates: {
    canonical: `${baseUrl}/compress-image`,
    languages: {
      'en': `${baseUrl}/compress-image`,
      'es': `${baseUrl}/es/compress-image`,
      'de': `${baseUrl}/de/compress-image`,
      'it': `${baseUrl}/it/compress-image`,
      'x-default': `${baseUrl}/compress-image`,
    },
  },
};

export default function CompressImageLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/compress-image`;

  const faqItems = extractFaqItems(enCompressDict.faq);

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
        name: 'PixBatch Image Compressor',
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
