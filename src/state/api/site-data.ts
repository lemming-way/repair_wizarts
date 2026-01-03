import CONFIG from '../../constants';
import { get, getRaw, FetchError } from './request';

const CATEGORIES_URL = CONFIG.API?.categoriesUrl || '';

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
  const result = await getRaw('?cv') as SiteDataVersion;
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

export type ServicesResponse = Array<{
  id?: string | unknown;
  name?:  string | unknown;
  subsections?: Array<{
    id?:  string | unknown;
    name?:  string | unknown;
    services?: Array<{
      id?: string | unknown;
      name?:  string | unknown;
    }> | unknown;
  }>;
}> | unknown;

/**
 * Получает классификатор услуг.
 * @returns Промис, который разрешается с объектом ServicesResponse или undefined, если данные не найдены.
 */
export async function getServices(): Promise<ServicesResponse> {
  const isDebug = process.env.NODE_ENV !== 'production';
  const correlationId = isDebug ? Math.random().toString(36).slice(2) : undefined;

  try {
    const response = await fetch(CATEGORIES_URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${'123'}`,
      },
    });

    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        if (isDebug) {
          const rawText = await response.text();
          const errorMessage = `Invalid response content type: ${contentType}. Expected application/json. Raw response: ${rawText}`;
          console.error('[services api] content type error', correlationId, errorMessage);
        }
        throw new FetchError('Invalid response content type.', response);
      }

      const responseData: unknown = await response.json();

      if (isDebug) {
        console.debug('[services api] response', correlationId, responseData);
      }

      return responseData;
    } else {
      const errorMessage = `${response.status}: ${response.statusText || 'HTTP Error'}`;

      if (isDebug) {
        console.error('[services api] http error', correlationId, errorMessage);
      }

      throw new FetchError(errorMessage, response);
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    if (isDebug && !(e instanceof FetchError)) {
      console.error('[api] request failed', correlationId, error);
    }
    throw error;
  }
};
