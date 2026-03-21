/**
 * Модуль для работы с api
 *
 * @summary
 * **Типы:**
 * ErrorResponse, RequestOptions
 *
 * **Классы:**
 * FetchError
 *
 * **Функции:**
 * get, getRawJSON, post, fetchAsBlob, authWithAuthUser, postWithAuthUser, postNoAuth, getLongList
 */
import CONFIG from 'config';
import { AuthToken, getToken } from '../auth';

const serverURL = process.env.REACT_APP_API_URL || CONFIG.API?.url || '';
export const API_BASE_URL = serverURL.endsWith('/') ? serverURL : `${serverURL}/`;

/**
 * Класс для возврата ошибки вместе с исходным результатом запроса.
 * Стандартный Error.cause не использую для совместимости со старыми браузерами.
 */
export class FetchError extends Error {
  cause: Response | ErrorResponse | null;

  constructor(message, fetchResult: Response | ErrorResponse | null = null) {
    super(message);
    this.name = 'FetchError';
    this.cause = fetchResult;
  }
}

/**
 * Формат ответа сервера при ошибке.
 */
export type ErrorResponse = {
    code: string;
    status: "error";
    message: string;
    data?: unknown;
};

/**
 * Формат ответа сервера при успехе.
 */
type SuccessResponse = {
    code: "200";
    status: "success";
    auth_user?: unknown;
    auth_hash?: string;  // при запросе авторизации
    data?: unknown;
};

/**
 * Добавляет значение в FormData. Обрабатывает массивы и объекты (сериализуя их в JSON).
 */
function appendFormValue(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) {
    return;
  }
  if (value instanceof File || value instanceof Blob) {
    formData.append(key, value);
  } else if (value instanceof Date) {
    formData.append(key, value.toISOString());
  } else if (typeof value === 'object') {
    formData.append(key, JSON.stringify(value));
  } else {
    formData.append(key, String(value));
  }
}

/**
 * Подготавливает тело POST запроса в формате FormData.
 * Добавляет параметры авторизации при необходимости.
 */
function prepareFormDataBody(
  data: RequestOptions['data'],
  withAuthUser: boolean,
  includeAuth: AuthToken | null
): FormData {
  const formData = new FormData();

  // Обрабатываем только объекты и FormData
  if (data instanceof FormData) {
    data.forEach((value, key) => formData.append(key, value));
  } else if (data && typeof data === 'object' && !Array.isArray(data)) {
    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      appendFormValue(formData, key, value);
    });
  }
  // Если data не FormData и не Object, оно игнорируется

  if (withAuthUser) {
      formData.append('au', 'f');
  }

  if (includeAuth) {
      formData.append('token', includeAuth.token);
      formData.append('u_hash', includeAuth.u_hash);
  }

  return formData;
}

/**
 * Опции для запроса.
 */
export type RequestOptions = {
  method?: 'GET' | 'POST';
  path: string; // Endpoint
  data?: Record<string, unknown> | FormData | null | undefined; // Данные запроса
  noParse?: boolean; // Получить сырые JSON данные
  asBlob?: boolean; // Получить данные как Blob
  noAuth?: boolean; // Отключает авторизацию для POST запросов
  withAuthUser?: boolean; // Включить в ответ данные авторизованного пользователя, если есть
};

type APIBaseType = object | void;

type APIResponse<T> =
  T extends void
  ? { auth_user?: unknown }
  : T & { auth_user?: unknown };

type APIPromise<T> = Promise<APIResponse<T>>;

/**
 * Отправляет HTTP запрос и проверяет статус ответа.
 * @param opts Опции запроса.
 * @returns Промис с данными ответа и опциональной информацией о пользователе.
 * @throws В случае ошибки запроса, сети или парсинга ответа.
 */
async function request<T extends APIBaseType = Record<string, unknown>>(opts: RequestOptions): APIPromise<T> {
  const isDebug = process.env.NODE_ENV !== 'production';
  const correlationId = isDebug ? Math.random().toString(36).slice(2) : undefined;

  const method = opts.method || 'GET';
  let url = `${API_BASE_URL}${opts.path}`;

  let formDataBody: FormData | undefined;

  if (method === 'POST') {
    const token = getToken();
    const includeAuth = opts.noAuth !== true && !!token?.token && !!token?.u_hash ? token : null;
    formDataBody = prepareFormDataBody(opts.data, opts.withAuthUser === true, includeAuth);
  } else if (method === 'GET') {
    if (opts.withAuthUser === true) {
      if (url.includes('?')) url += '&au=f';
      else url += '?au=f';
    }
  } else {
    throw new Error(`Unsupported HTTP method: ${method}. Only GET and POST are supported.`);
  }

  try {
    if (isDebug) {
      console.debug('[api]', correlationId, method, url);
    }

    const resp = await fetch(url, { method, body: formDataBody });

    if (resp.ok) {
      const contentType = resp.headers.get('Content-Type') || '';
      if (!contentType.includes('application/json')) {
        if (opts.asBlob) {
          const ret = {
            blob: await resp.blob(),
            type: contentType,
            filename: ''
          };
          const disposition = resp.headers.get('Content-Disposition');
          if (disposition) {
            const filenameStarMatch = disposition.match(/filename\*=(?:UTF-8|utf-8)''(.+?)(?:;|$)/i);
            if (filenameStarMatch) {
              try {
                ret.filename = decodeURIComponent(filenameStarMatch[1]);
              } catch { /* Игнорируем ошибку */ }
            }
            if (!ret.filename) {
              const filenameMatch = disposition.match(/filename=(?:"([^"]+)"|([^;]+))/i);
              if (filenameMatch) {
                ret.filename = filenameMatch[1] || filenameMatch[2];
              }
            }
          }

          return ret as unknown as APIResponse<T>;
        }

        if (isDebug) {
          const rawText = await resp.text();
          const errorMessage = `Invalid response content type: ${contentType}. Expected application/json. Raw response: ${rawText}`;
          console.error('[api] content type error', correlationId, errorMessage);
        }
        throw new FetchError('Invalid response content type.', resp);
      }
    } else {
      const errorMessage = `${resp.status}: ${resp.statusText || 'HTTP Error'}`;

      if (isDebug) {
        console.error('[api] http error', correlationId, errorMessage);
      }

      throw new FetchError(errorMessage, resp);
    }

    const responseData: unknown = await resp.json();

    if (isDebug) {
      console.debug('[api] response', correlationId, responseData);
    }

    if (opts.noParse) {
      return responseData as APIResponse<T>;
    }

    const successResponse = responseData as SuccessResponse;
    if (successResponse.status !== 'success' || successResponse.code !== '200') {
      const errorResponse = responseData as ErrorResponse;
      if (isDebug) {
        console.error('[api] server logical error', correlationId, errorResponse);
      }
      throw new FetchError(errorResponse.message, errorResponse);
    }
    const result =
      successResponse.auth_hash ?
        { auth_hash: successResponse.auth_hash } :
      'object' === typeof successResponse.data && successResponse.data !== null ?
        successResponse.data :
        { data: successResponse.data };
    if (opts.withAuthUser === true && 'object' === typeof successResponse.auth_user) {
      Object.assign(result, { auth_user: successResponse.auth_user });
    }
    return result as APIResponse<T>;
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    if (isDebug) {
      console.error('[api] request failed', correlationId, error);
    }
    throw error;
  }
}

/**
 * Вспомогательная функция для загрузки длинных списков без пагинации.
 * Размер ответа ограничен 30 элементами, поэтому делаем запросы в цикле для получения всех результатов.
 * @param path Путь к эндпоитну
 * @param data Параметры запроса
 * @param fieldName Ключ в возвращаемом значении, по которому расположены данные
 * @returns Промис, разрешающийся с массивом данных
 */
export async function getLongList<T>(path: string, data: RequestOptions['data'], fieldName: string): Promise<T[]> {
  let payload;
  if (data instanceof FormData) {
    payload = new FormData();
    data.forEach((value, key) => payload.append(key, value));
    payload.set('lo', 0);
    payload.set('lc', 30);
  }
  else {
    payload = {
      ...data,
      lo: 0,
      lc: 30
    }
  }

  let ret = [] as T[];
  while (true) {
    const result = await post<Record<string, unknown>>(path, payload);
    if (result?.[fieldName] && 'object' === typeof result[fieldName]) {
      const values = Object.values(result[fieldName]);
      ret = ret.concat(values);
      if (payload instanceof FormData) payload.set('lo', String(Number(payload.get('lo')) + 30));
      else payload.lo += 30;
    }
    else break;
  }
  return ret;
}

// ============== Упрощенный API ==============

/**
 * Отправляет GET запрос (без авторизации).
 * @param path Путь к API.
 * @returns Промис с данными ответа.
 */
export function get<T extends APIBaseType = Record<string, unknown>>(path: string) {
  return request<T>({ method: 'GET', path, noAuth: true }) as Promise<T>;
}

/**
 * Отправляет GET запрос (без авторизации).
 * Возвращает сырые JSON данные ответа, без предварительного разбора.
 * @param path Путь к API.
 * @returns Промис с данными ответа.
 */
export function getRawJSON(path: string) {
  return request({ method: 'GET', path, noParse: true, noAuth: true });
}

/**
 * Отправляет POST запрос с авторизацией (если токен доступен).
 * @param path Путь к API.
 * @param data Данные запроса.
 * @returns Промис с данными ответа.
 */
export function post<T extends APIBaseType = Record<string, unknown>>(path: string, data?: RequestOptions['data']) {
  return request<T>({ method: 'POST', path, data }) as Promise<T>;
}

type BlobResult = {
  blob: Blob;
  type: string;
  filename: string;
};

/**
 * Отправляет POST запрос с авторизацией (если токен доступен).
 * Возвращает двоичные данные ответа, без предварительного разбора.
 * @param path Путь к API.
 * @param data Данные запроса.
 * @returns Промис с данными ответа.
 */
export function fetchAsBlob(path: string, data?: RequestOptions['data']) {
  return request<BlobResult>({ method: 'POST', path, asBlob: true, data }) as Promise<BlobResult>;
}

/**
 * Отправляет POST запрос без авторизации с получением данных авторизованного пользователя.
 * (Имеет смысл только для запросов авторизации)
 * @param path Путь к API.
 * @param data Данные запроса.
 * @returns Промис с данными ответа.
 */
export function authWithAuthUser<T extends APIBaseType = Record<string, unknown>>(path: string, data?: RequestOptions['data']) {
  return request<T>({ method: 'POST', path, data, noAuth: true, withAuthUser: true });
}
/**
 * Отправляет POST запрос с получением данных авторизованного пользователя.
 * @param path Путь к API.
 * @param data Данные запроса.
 * @returns Промис с данными ответа.
 */
export function postWithAuthUser<T extends APIBaseType = Record<string, unknown>>(path: string, data?: RequestOptions['data']) {
  return request<T>({ method: 'POST', path, data, withAuthUser: true });
}

/**
 * Отправляет POST запрос без авторизации.
 * @param path Путь к API.
 * @param data Данные запроса.
 * @returns Промис с данными ответа.
 */
export function postNoAuth<T extends APIBaseType = Record<string, unknown>>(path: string, data?: RequestOptions['data']) {
  return request<T>({ method: 'POST', path, data, noAuth: true }) as Promise<T>;
}
