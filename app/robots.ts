import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    host: 'https://pixbatch.com',
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: 'https://pixbatch.com/sitemap.xml',
  };
}
