import type { Metadata } from 'next';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Contact Us - PixBatch Support',
  description: 'Get in touch with PixBatch team. We are here to help with any questions about our free online image editing tools.',
  openGraph: {
    title: 'Contact Us - PixBatch',
    description: 'Get in touch with PixBatch team for support and questions.',
    type: 'website',
    url: `${baseUrl}/contact`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  alternates: {
    canonical: `${baseUrl}/contact`,
    languages: {
      en: `${baseUrl}/contact`,
      es: `${baseUrl}/es/contact`,
      de: `${baseUrl}/de/contact`,
      it: `${baseUrl}/it/contact`,
      'x-default': `${baseUrl}/contact`,
    },
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
