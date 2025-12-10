import CONFIG from '../../constants';
import { AuthToken, getToken } from '../auth';

const serverURL = process.env.REACT_APP_API_URL || CONFIG.API.url || '';
const API_BASE_URL = serverURL.endsWith('/') ? serverURL : `${serverURL}/`;

/**
 * Информация о блокировке пользователя.
 */
export type UserBanInfo = {
    auth: string | null;
    order: string | null;
    blog_topic: string | null;
    blog_post: string | null;
};

/**
 * Информация об авторизованном пользователе.
 */
export type AuthUser = {
  u_id: string;
  u_name: string;
  u_family: string;
  u_middle: string;
  u_email: string;
  u_phone: string | null;
  u_role: string;
  u_check_state: string | null;
  u_ban: UserBanInfo;
  u_active: 0 | 1;
  u_photo: string;
  u_birthday: string | null;
  u_lang: string | null;
  u_currency: string | null;
};

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
    auth_user?: AuthUser;
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
  includeAuth?: AuthToken | null
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
  noAuth?: boolean; // Отключает авторизацию для POST запросов
  withAuthUser?: boolean; // Включить в ответ данные авторизованного пользователя, если есть
};

/**
 * Отправляет HTTP запрос.
 * @template T Тип ожидаемых данных в ответе.
 * @param {RequestOptions} [opts={}] Опции запроса.
 * @returns {Promise<T & { auth_user?: AuthUser }>} Промис с данными ответа и опциональной информацией о пользователе.
 * @throws {Error} В случае ошибки запроса, сети или парсинга ответа.
 */
export async function request<T>(opts: RequestOptions): Promise<T & { auth_user?: AuthUser }> {
  const isDebug = process.env.NODE_ENV !== 'production';
  const correlationId = isDebug ? Math.random().toString(36).slice(2) : undefined;
  const method = opts.method || 'GET';

  const url = `${API_BASE_URL}${opts.path}`;

  let formDataBody: FormData | undefined;

  if (method === 'POST') {
    const token = getToken();
    const includeAuth = opts.noAuth !== true && !!token?.token && !!token?.u_hash ? token : null;
    formDataBody = prepareFormDataBody(opts.data, includeAuth);
  } else if (method !== 'GET') {
    throw new Error(`Unsupported HTTP method: ${method}. Only GET and POST are supported.`);
  }

  try {
    if (isDebug) {
      console.debug('[api]', correlationId, method, url);
    }

    const resp = await fetch(url, { method, body: formDataBody });

    const contentType = resp.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const rawText = await resp.text();
      const errorMessage = `Invalid response content type: ${contentType}. Expected application/json. Raw response: ${rawText}`;
      if (isDebug) {
        console.error('[api] content type error', correlationId, errorMessage);
      }
      throw new FetchError('Invalid response content type.', resp);
    }

    if (resp.ok) {
      const responseData: SuccessResponse | ErrorResponse = await resp.json();

      if (isDebug) {
        console.debug('[api] response', correlationId, responseData);
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
      if (opts.withAuthUser === true && successResponse.auth_user) {
        Object.assign(result, { auth_user: successResponse.auth_user });
      }
      return result as T & { auth_user?: AuthUser };
    } else {
      const errorMessage = `${resp.status}: ${resp.statusText || 'HTTP Error'}`;

      if (isDebug) {
        console.error('[api] http error', correlationId, errorMessage);
      }

      throw new FetchError(errorMessage, resp);
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    if (isDebug) {
      console.error('[api] request failed', correlationId, error);
    }
    throw error;
  }
}

/**
 * Упрощенный API клиент.
 */

/**
 * Отправляет GET запрос (без авторизации).
 * @template T Тип ожидаемых данных.
 * @param path Путь к API.
 * @returns {Promise<T>} Промис с данными ответа.
 */
export function get<T>(path: string) {
  return request<T>({ method: 'GET', path, noAuth: true }) as Promise<T>;
}

/**
 * Отправляет POST запрос с авторизацией (если токен доступен).
 * @template T Тип ожидаемых данных.
 * @param path Путь к API.
 * @param data Данные запроса.
 * @returns {Promise<T>} Промис с данными ответа.
 */
export function post<T>(path: string, data?: RequestOptions['data']) {
  return request<T>({ method: 'POST', path, data }) as Promise<T>
}

/**
 * Отправляет POST запрос без авторизации с получением данных авторизованного пользователя.
 * (Имеет смысл только для запросов авторизации)
 * @template T Тип ожидаемых данных.
 * @param path Путь к API.
 * @param data Данные запроса.
 * @returns {Promise<T & { auth_user?: AuthUser }>} Промис с данными ответа.
 */
export function authWithAuthUser<T>(path: string, data?: RequestOptions['data']) {
  return request<T>({ method: 'POST', path, data, noAuth: true, withAuthUser: true });
}
/**
 * Отправляет POST запрос с получением данных авторизованного пользователя.
 * @template T Тип ожидаемых данных.
 * @param path Путь к API.
 * @param data Данные запроса.
 * @returns {Promise<T & { auth_user?: AuthUser }>} Промис с данными ответа.
 */
export function postWithAuthUser<T>(path: string, data?: RequestOptions['data']) {
  return request<T>({ method: 'POST', path, data, withAuthUser: true });
}

/**
 * Отправляет POST запрос без авторизации.
 * @template T Тип ожидаемых данных.
 * @param {string} path Путь к API.
 * @param {RequestOptions['data']} [data] Данные запроса.
 * @returns {Promise<T>} Промис с данными ответа.
 */
export function postNoAuth<T>(path: string, data?: RequestOptions['data']) {
  return request<T>({ method: 'POST', path, data, noAuth: true }) as Promise<T>;
}
