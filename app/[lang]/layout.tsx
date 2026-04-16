import type { Metadata } from 'next';
import { i18n } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';
import enMeta from '@/dictionaries/en/metadata.json';
import esMeta from '@/dictionaries/es/metadata.json';
import deMeta from '@/dictionaries/de/metadata.json';
import itMeta from '@/dictionaries/it/metadata.json';

const metaDicts: Record<string, typeof enMeta> = {
  en: enMeta,
  es: esMeta,
  de: deMeta,
  it: itMeta,
};

const localeMap: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  de: 'de_DE',
  it: 'it_IT',
};

const baseUrl = 'https://pixbatch.com';

export async function generateStaticParams() {
  return i18n.locales
    .filter((locale) => locale !== 'en') // English uses the default route
    .map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string };
}): Promise<Metadata> {
  const lang = (i18n.locales.includes(params.lang as Locale) ? params.lang : 'en') as Locale;
  const meta = metaDicts[lang].home;

  const languages: Record<string, string> = {
    en: `${baseUrl}`,
    es: `${baseUrl}/es`,
    de: `${baseUrl}/de`,
    it: `${baseUrl}/it`,
    'x-default': `${baseUrl}`,
  };

  const canonicalUrl = lang === 'en' ? `${baseUrl}` : `${baseUrl}/${lang}`;

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      type: 'website',
      url: canonicalUrl,
      locale: localeMap[lang],
      alternateLocale: i18n.locales.filter((l) => l !== lang).map((l) => localeMap[l]),
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.twitterTitle,
      description: meta.twitterDescription,
    },
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
  };
}

export default function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return (
    <>
      {/* Inject script to update html lang attribute on client side */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${params.lang}";`,
        }}
      />
      {children}
    </>
  );
}
