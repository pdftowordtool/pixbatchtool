import type { Metadata } from 'next';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Privacy Policy - PixBatch',
  description: 'PixBatch privacy policy. Learn how we protect your data. All image processing happens in your browser - we never upload or store your images.',
  openGraph: {
    title: 'Privacy Policy - PixBatch',
    description: 'Learn how PixBatch protects your privacy. All processing happens locally in your browser.',
    type: 'website',
    url: `${baseUrl}/privacy-policy`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  alternates: {
    canonical: `${baseUrl}/privacy-policy`,
    languages: {
      en: `${baseUrl}/privacy-policy`,
      es: `${baseUrl}/es/privacy-policy`,
      de: `${baseUrl}/de/privacy-policy`,
      it: `${baseUrl}/it/privacy-policy`,
      'x-default': `${baseUrl}/privacy-policy`,
    },
  },
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
