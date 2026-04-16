import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from '@/lib/i18n/config';

const localizedRoutes = new Set(['/', '/optimize-image', '/compress-image', '/image-resizer', '/image-converter', '/png-converter', '/jpg-converter', '/webp-converter', '/crop-image', '/crop-jpg', '/crop-png', '/crop-webp', '/compress-png', '/compress-jpg', '/compress-webp', '/resize-png', '/resize-jpg', '/resize-webp', '/rotate-flip-image', '/exif-viewer', '/remove-exif', '/about', '/contact', '/privacy-policy', '/terms', '/disclaimer']);

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function isBotRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  return /(bot|crawler|spider|crawling)/i.test(userAgent);
}

function getLocale(request: NextRequest): string {
  // Check if there's a locale cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && i18n.locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map((lang) => {
      const [code, priority] = lang.trim().split(';q=');
      return { code: code.split('-')[0], priority: priority ? parseFloat(priority) : 1 };
    });
    languages.sort((a, b) => b.priority - a.priority);

    for (const lang of languages) {
      if (i18n.locales.includes(lang.code as any)) {
        return lang.code;
      }
    }
  }

  return i18n.defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = normalizePath(request.nextUrl.pathname);

  // Skip middleware for api routes, static files, and internal Next.js paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // static files
  ) {
    return;
  }

  // Check if the pathname has a supported locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If the path already has a locale, don't redirect
  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Keep bots on canonical default routes to avoid crawl variance.
  if (isBotRequest(request)) {
    return NextResponse.next();
  }

  // Only redirect routes that actually have translated variants.
  if (!localizedRoutes.has(pathname)) {
    return NextResponse.next();
  }

  const locale = getLocale(request);

  // Default locale remains unprefixed for backward compatibility.
  if (locale === i18n.defaultLocale) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|favicon|.*\\..*).*)'],
};

