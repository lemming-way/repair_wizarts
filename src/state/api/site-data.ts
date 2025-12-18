import { get, getRaw } from './request';

interface SiteDataVersion {
  'cache version'?: string | unknown;
}

export interface CityData {
  country?: string | unknown;
  zone?: string | unknown;
  ru?: string | unknown;
  en?: string | unknown;
  ar?: string | unknown;
  fr?: string | unknown;
  es?: string | unknown;
}

export interface LanguageData {
  native?: string | unknown;
  ru?: string | unknown;
  en?: string | unknown;
  ar?: string | unknown;
  fr?: string | unknown;
  es?: string | unknown;
  iso?: string | unknown;
}

export interface SiteData {
  version?: string | unknown;
  default_lang?: number | unknown;
  data?: {
    cities?: Record<string, CityData> | unknown;
    langs?: Record<string, LanguageData> | unknown;
  }
}

/**
 * Получает версию настроек сайта.
 * @returns Промис, который разрешается строкой с версией сайта.
 */
export async function getSiteDataVersion() {
  const result = await getRaw('cv') as SiteDataVersion;
  return String( result?.['cache version'] || '' );
}

/**
 * Получает объект с настройками сайта.
 * @returns Промис, который разрешается с объектом SiteData или undefined, если данные не найдены.
 */
export async function getSiteData() {
  const result = await get<SiteData>('data');
  return result;
}
