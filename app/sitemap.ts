import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pixbatch.com';
  const lastModified = new Date('2026-04-15T00:00:00.000Z');

  // All tool routes
  const routes = [
    '',
    '/compress-image',
    '/compress-jpg',
    '/compress-png',
    '/compress-webp',
    '/image-resizer',
    '/resize-jpg',
    '/resize-png',
    '/resize-webp',
    '/crop-image',
    '/crop-jpg',
    '/crop-png',
    '/crop-webp',
    '/image-converter',
    '/jpg-converter',
    '/png-converter',
    '/webp-converter',
    '/optimize-image',
    '/rotate-flip-image',
    '/exif-viewer',
    '/remove-exif',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/disclaimer',
  ];

  // Routes that have i18n versions
  const i18nRoutes = ['', '/optimize-image', '/compress-image', '/image-resizer', '/image-converter', '/png-converter', '/jpg-converter', '/webp-converter', '/crop-image', '/crop-jpg', '/crop-png', '/crop-webp', '/compress-png', '/compress-jpg', '/compress-webp', '/resize-png', '/resize-jpg', '/resize-webp', '/rotate-flip-image', '/exif-viewer', '/remove-exif', '/about', '/contact', '/privacy-policy', '/terms', '/disclaimer'];
  const locales = ['es', 'de', 'it'];

  const entries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    const isI18n = i18nRoutes.includes(route);
    const priority = route === ''
      ? 1
      : route.includes('converter') || route.includes('compress') || route.includes('resize') || route.includes('optimize')
        ? 0.9
        : 0.7;

    // English / default entry
    entries.push({
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: route === '' ? 'daily' : 'weekly',
      priority,
    });

    // Add locale-specific entries for i18n routes
    if (isI18n) {
      for (const locale of locales) {
        entries.push({
          url: `${baseUrl}/${locale}${route}`,
          lastModified,
          changeFrequency: 'weekly',
          priority,
        });
      }
    }
  }

  return entries;
}

