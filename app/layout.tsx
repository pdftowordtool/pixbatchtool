import './globals.css';
import type { Metadata } from 'next';
import { Fira_Code } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pixbatch.com'),
  icons: {
    icon: [{ url: '/Pixbatch%20favicon.png', type: 'image/png' }],
  },
  title: {
    default: 'PixBatch - Free Online Bulk Image Editor | Compress, Resize, Convert Images',
    template: '%s | PixBatch',
  },
  description: 'Free online bulk image editor. Compress, resize, crop, convert, and optimize hundreds of images at once. Support for JPG, PNG, WebP, AVIF. No upload limits, 100% private - all processing happens in your browser.',
  keywords: [
    'bulk image editor',
    'batch image processor',
    'compress images online',
    'resize images bulk',
    'image converter',
    'webp converter',
    'png to jpg',
    'image optimizer',
    'free image tools',
    'online photo editor',
    'bulk photo resizer',
    'image compression tool',
  ],
  authors: [{ name: 'PixBatch' }],
  creator: 'PixBatch',
  publisher: 'PixBatch',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['es_ES', 'de_DE', 'it_IT'],
    url: 'https://pixbatch.com',
    siteName: 'PixBatch',
    title: 'PixBatch - Free Online Bulk Image Editor',
    description: 'Compress, resize, crop, convert, and optimize hundreds of images at once. 100% free, no upload limits, completely private.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PixBatch - Bulk Image Editor',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PixBatch - Free Online Bulk Image Editor',
    description: 'Compress, resize, crop, convert, and optimize hundreds of images at once. 100% free and private.',
    images: ['/og-image.png'],
    creator: '@pixabatch',
  },
  alternates: {
    canonical: 'https://pixbatch.com',
    languages: {
      en: 'https://pixbatch.com',
      es: 'https://pixbatch.com/es',
      de: 'https://pixbatch.com/de',
      it: 'https://pixbatch.com/it',
      'x-default': 'https://pixbatch.com',
    },
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={firaCode.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
