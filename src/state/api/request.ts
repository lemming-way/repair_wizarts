import CONFIG from '../../constants';
import { getToken, removeToken } from '../../services/token.service';

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
 * Формат ответа сервера при ошибке.
 */
type ErrorResponse = {
    code: string;
    status: "error";
    message: string;
    data: any;
};

/**
 * Формат ответа сервера при успехе.
 */
type SuccessResponse = {
    code: "200";
    status: "success";
    auth_user?: AuthUser;
    data: any;
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
  includeAuth?: { token: string; u_hash: string }
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
  const correlationId = Math.random().toString(36).slice(2);
  const method = opts.method || 'GET';

  const url = `${API_BASE_URL}${opts.path}`;

  let formDataBody: FormData | undefined;

  if (method === 'POST') {
    const token = getToken();
    const includeAuth = opts.noAuth !== true && !!token?.token && !!token?.u_hash ? token : undefined;
    formDataBody = prepareFormDataBody(opts.data, includeAuth);
  } else if (method !== 'GET') {
    throw new Error(`Unsupported HTTP method: ${method}. Only GET and POST are supported.`);
  }

  try {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[api]', correlationId, method, url);
    }

    const resp = await fetch(url, { method, body: formDataBody });

    const contentType = resp.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const rawText = await resp.text();
      const errorMessage = `Invalid response content type: ${contentType}. Expected application/json. Raw response: ${rawText}`;
      console.error('[api] content type error', correlationId, errorMessage);
      throw new Error('Invalid response content type.');
    }

    if (resp.ok) {
      const responseData: SuccessResponse | ErrorResponse = await resp.json();

      if (process.env.NODE_ENV !== 'production') {
        console.debug('[api] response', correlationId, responseData);
      }

      const successResponse = responseData as SuccessResponse;
      if (successResponse.status !== 'success' || successResponse.code !== '200') {
        const errorResponse = responseData as ErrorResponse;
        console.error('[api] server logical error', correlationId, errorResponse);
        throw new Error(errorResponse.message);
      }
      const result = { ...successResponse.data };
      if (opts.withAuthUser === true && successResponse.auth_user) {
        Object.assign(result, { auth_user: successResponse.auth_user });
      }
      return result as T & { auth_user?: AuthUser };
    } else {
      const errorMessage = `${resp.status}: ${resp.statusText || 'HTTP Error'}`;

      if (process.env.NODE_ENV !== 'production') {
        console.error('[api] http error', correlationId, errorMessage);
      }

      if (resp.status === 401) {
        removeToken();
      }
      throw new Error(errorMessage);
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    if (process.env.NODE_ENV !== 'production') {
      console.error('[api] request failed', correlationId, error);
    }
    throw error;
  }
}

/**
 * Упрощенный API клиент.
 */
export const api = {
  /**
   * Отправляет GET запрос (без авторизации).
   * @template T Тип ожидаемых данных.
   * @param path Путь к API.
   * @returns {Promise<T>} Промис с данными ответа.
   */
  get: <T>(path: string) =>
    request<T>({ method: 'GET', path, noAuth: true }) as Promise<T>,

  /**
   * Отправляет POST запрос с авторизацией (если токен доступен).
   * @template T Тип ожидаемых данных.
   * @param path Путь к API.
   * @param data Данные запроса.
   * @returns {Promise<T>} Промис с данными ответа.
   */
  post: <T>(path: string, data?: RequestOptions['data']) =>
    request<T>({ method: 'POST', path, data }) as Promise<T>,

  /**
   * Отправляет POST запрос с получением данных авторизованного пользователя.
   * @template T Тип ожидаемых данных.
   * @param path Путь к API.
   * @param data Данные запроса.
   * @returns {Promise<T & { auth_user?: AuthUser }>} Промис с данными ответа.
   */
  postWithAuthUser: <T>(path: string, data?: RequestOptions['data']) =>
    request<T>({ method: 'POST', path, data, withAuthUser: true }),

  /**
   * Отправляет POST запрос без авторизации.
   * @template T Тип ожидаемых данных.
   * @param {string} path Путь к API.
   * @param {RequestOptions['data']} [data] Данные запроса.
   * @returns {Promise<T>} Промис с данными ответа.
   */
  postNoAuth: <T>(path: string, data?: RequestOptions['data']) =>
    request<T>({ method: 'POST', path, data, noAuth: true }) as Promise<T>,
};
