import type { Metadata } from 'next';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'About PixBatch - Free Online Bulk Image Editor',
  description: 'Learn about PixBatch, a free online bulk image editor. Our mission is to provide fast, private, and easy-to-use image processing tools for everyone.',
  openGraph: {
    title: 'About PixBatch',
    description: 'Learn about PixBatch, a free online bulk image editor.',
    type: 'website',
    url: `${baseUrl}/about`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  alternates: {
    canonical: `${baseUrl}/about`,
    languages: {
      en: `${baseUrl}/about`,
      es: `${baseUrl}/es/about`,
      de: `${baseUrl}/de/about`,
      it: `${baseUrl}/it/about`,
      'x-default': `${baseUrl}/about`,
    },
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
