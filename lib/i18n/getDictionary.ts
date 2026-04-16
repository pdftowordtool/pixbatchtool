import type { Locale } from './config';

const dictionaries = {
  en: () => import('@/dictionaries/en/optimize-image.json').then((module) => module.default),
  es: () => import('@/dictionaries/es/optimize-image.json').then((module) => module.default),
  de: () => import('@/dictionaries/de/optimize-image.json').then((module) => module.default),
  it: () => import('@/dictionaries/it/optimize-image.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};
