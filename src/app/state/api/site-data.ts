/**
 * Модуль api для работы со статическими данными сайта
 *
 * @summary
 * **Типы:**
 * CityData, LanguageData, SiteData, ServicesResponse
 *
 * **Получение данных:**
 * getSiteDataVersion, getSiteData, getServices
 */

import CONFIG from 'config';
import { get, getRawJSON, FetchError } from './request';
import { randomString } from 'app/shared/lib/utilities';

const CATEGORIES_URL = CONFIG.API?.categoriesUrl || '';

type SiteDataVersion = {
  'cache version'?: string;
}

export type CityData = {
  country?: string;
  zone?: string;
  ru?: string;
  en?: string;
  ar?: string;
  fr?: string;
  es?: string;
}

export type LanguageData = {
  native?: string;
  ru?: string;
  en?: string;
  ar?: string;
  fr?: string;
  es?: string;
  iso?: string;
}

export type SiteData = {
  version?: string;
  default_lang?: number;
  data?: {
    cities?: Record<string, CityData>;
    langs?: Record<string, LanguageData>;
  }
}

/**
 * Получает версию настроек сайта.
 * @returns Промис, который разрешается строкой с версией сайта.
 */
export async function getSiteDataVersion() {
  const result = await getRawJSON('?cv') as SiteDataVersion;
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
  id?: string;
  name?:  string;
  subsections?: Array<{
    id?:  string;
    name?:  string;
    services?: Array<{
      id?: string;
      name?:  string;
    }>;
  }>;
}>;

/**
 * Получает классификатор услуг.
 * @returns Промис, который разрешается с объектом ServicesResponse или undefined, если данные не найдены.
 */
export async function getServices(): Promise<ServicesResponse> {
  const isDebug = process.env.NODE_ENV !== 'production';
  const correlationId = isDebug ? randomString(8) : undefined;

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

      const responseData: ServicesResponse = await response.json();

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
