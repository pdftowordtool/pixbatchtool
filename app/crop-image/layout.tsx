import type { Metadata } from 'next';
import enCropDict from '@/dictionaries/en/crop-image.json';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Crop Images Online Free - Bulk Image Cropper Tool',
  description: 'Free online image cropper. Easily crop JPG, PNG, and WebP images with custom aspect ratios natively in your browser. Fast, private, and zero server uploads.',
  keywords: ['crop image', 'image cropper', 'crop photo online', 'photo cropper', 'free image cropper', 'crop picture'],
  openGraph: {
    title: 'Crop Images Online Free - Photo Cropper Tool',
    description: 'Easily crop JPG, PNG, and WebP images with custom aspect ratios cleanly and privately.',
    type: 'website',
    url: 'https://pixbatch.com/crop-image',
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crop Images Online Free',
    description: 'Crop images with custom aspect ratios privately inside your browser.',
  },
  alternates: {
    canonical: `${baseUrl}/crop-image`,
    languages: {
      en: `${baseUrl}/crop-image`,
      es: `${baseUrl}/es/crop-image`,
      de: `${baseUrl}/de/crop-image`,
      it: `${baseUrl}/it/crop-image`,
      'x-default': `${baseUrl}/crop-image`,
    },
  },
};

export default function CropImageLayout({ children }: { children: React.ReactNode }) {
  const canonicalUrl = `${baseUrl}/crop-image`;

  const faqEntities = enCropDict.faq.items.map((item, index) => ({
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
        name: 'PixBatch Image Cropper',
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
