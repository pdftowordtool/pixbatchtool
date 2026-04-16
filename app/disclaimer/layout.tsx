import type { Metadata } from 'next';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Disclaimer - PixBatch',
  description: 'PixBatch disclaimer. Important information about using our free online image editing tools.',
  openGraph: {
    title: 'Disclaimer - PixBatch',
    description: 'Important disclaimer information for PixBatch users.',
    type: 'website',
    url: `${baseUrl}/disclaimer`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  alternates: {
    canonical: `${baseUrl}/disclaimer`,
    languages: {
      en: `${baseUrl}/disclaimer`,
      es: `${baseUrl}/es/disclaimer`,
      de: `${baseUrl}/de/disclaimer`,
      it: `${baseUrl}/it/disclaimer`,
      'x-default': `${baseUrl}/disclaimer`,
    },
  },
};

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
