import type { Metadata } from 'next';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Terms of Service - PixBatch',
  description: 'PixBatch terms of service. Read our terms and conditions for using our free online image editing tools.',
  openGraph: {
    title: 'Terms of Service - PixBatch',
    description: 'Read PixBatch terms of service and conditions.',
    type: 'website',
    url: `${baseUrl}/terms`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  alternates: {
    canonical: `${baseUrl}/terms`,
    languages: {
      en: `${baseUrl}/terms`,
      es: `${baseUrl}/es/terms`,
      de: `${baseUrl}/de/terms`,
      it: `${baseUrl}/it/terms`,
      'x-default': `${baseUrl}/terms`,
    },
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
