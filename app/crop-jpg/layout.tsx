import type { Metadata } from 'next';

const baseUrl = 'https://pixbatch.com';

export const metadata: Metadata = {
  title: 'Crop JPG Images Online Free - JPEG Cropper Tool',
  description: 'Free online JPG cropper. Easily crop JPEG images with custom aspect ratios right in your browser. Fast, private, and perfect for social media or thumbnails.',
  keywords: ['crop jpg', 'jpeg cropper', 'crop jpeg online', 'jpg photo cropper', 'free jpg cropper'],
  openGraph: {
    title: 'Crop JPG Images Online Free',
    description: 'Easily crop JPEG images with custom aspect ratios cleanly and privately.',
    type: 'website',
    url: `${baseUrl}/crop-jpg`,
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crop JPG Images Online Free',
    description: 'Crop JPG images with custom aspect ratios natively in your browser.',
  },
  alternates: {
    canonical: `${baseUrl}/crop-jpg`,
    languages: {
      en: `${baseUrl}/crop-jpg`,
      es: `${baseUrl}/es/crop-jpg`,
      de: `${baseUrl}/de/crop-jpg`,
      it: `${baseUrl}/it/crop-jpg`,
      'x-default': `${baseUrl}/crop-jpg`,
    },
  },
};

export default function CropJpgLayout({ children }: { children: React.ReactNode }) {
  return children;
}
