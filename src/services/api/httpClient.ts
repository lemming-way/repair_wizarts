import SERVER_PATH from '../../constants/SERVER_PATH';
import { getToken, removeToken } from '../token.service';

type RequestBodyValue = string | number | boolean | null | undefined;

export interface AppFetchOptions {
  method?: string;
  body?: Record<string, RequestBodyValue>;
}

export const BASE_URL = SERVER_PATH;

const toFormData = (body: Record<string, RequestBodyValue> = {}) => {
  const params = new URLSearchParams();

  Object.entries(body).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    params.append(key, String(value));
  });

  return params.toString();
};

const buildBody = (
  baseBody: Record<string, RequestBodyValue> | undefined,
  isAdmin: boolean | undefined,
) => {
  const token = getToken();

  return {
    ...(token
      ? {
          token: isAdmin
            ? 'bbdd06a50ddcc1a4adc91fa0f6f86444'
            : token?.token,
          u_hash: isAdmin
            ? 'VLUy4+8k6JF8ZW3qvHrDZ5UDlv7DIXhU4gEQ82iRE/zCcV5iub0p1KhbBJheMe9JB95JHAXUCWclAwfoypaVkLRXyQP29NDM0NV1l//hGXKk6O43BS3TPCMgZEC4ymtr'
            : token?.hash,
        }
      : {}),
    ...baseBody,
  };
};

const parseResponse = async (response: Response) => {
  try {
    const data = await response.json();
    return { data };
  } catch (error) {
    return { data: null };
  }
};

export const appFetch = async <TResponse = any>(
  location: string,
  init: AppFetchOptions = {},
  admin?: boolean,
): Promise<TResponse> => {
  try {
    const token = getToken();
    const response = await fetch(BASE_URL + location, {
      method: init.method || 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      ...(init.method === 'GET'
        ? {}
        : {
            body: toFormData(buildBody(init.body, admin)),
          }),
    });

    const { data } = await parseResponse(response);

    if (response.ok) {
      return data as TResponse;
    }

    if (response.status === 401) {
      if (token) {
        removeToken();
      }

      return Promise.reject({
        message: 'Невозможно авторизоваться',
        status: 401,
      });
    }

    return Promise.reject({
      message: (data as { detail?: string } | null)?.detail,
      status: response.status,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return Promise.reject({
      message: 'Невозможно выполнить запрос',
      status: 500,
    });
  }
};

export default appFetch;
