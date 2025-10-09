import SERVER_PATH from '../../constants/SERVER_PATH';
import { getToken, removeToken, setToken } from '../token.service';
import { getKeepUserAuthorized } from '../user.service';

type RequestBodyValue = string | number | boolean | null | undefined;

export interface AppFetchOptions {
  method?: string;
  body?: Record<string, RequestBodyValue>;
}

export const BASE_URL = SERVER_PATH;

type RefreshQueueCallback = (result: boolean) => void;

let refreshing = false;
let refreshQueue: RefreshQueueCallback[] = [];

const processRefreshQueue = (result: boolean) => {
  refreshQueue.forEach((cb) => cb(result));
};

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

const refreshAccessToken = async (): Promise<boolean> => {
  if (refreshing) {
    return new Promise<boolean>((resolve) => {
      refreshQueue.push((result) => resolve(result));
    });
  }

  try {
    refreshing = true;

    const token = getToken();
    const response = await fetch(BASE_URL + 'user/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token?.refresh_token,
      }),
    });

    if (!response.ok) {
      removeToken();
      processRefreshQueue(false);
      return false;
    }

    const data = (await response.json()) as { access_token?: string };
    if (!data.access_token) {
      processRefreshQueue(false);
      return false;
    }

    setToken({ access_token: data.access_token, refresh_token: token?.refresh_token });
    processRefreshQueue(true);
    return true;
  } catch (error) {
    removeToken();
    processRefreshQueue(false);
    return false;
  } finally {
    refreshing = false;
    refreshQueue = [];
  }
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

    if (response.status === 401 && token && getKeepUserAuthorized()) {
      const refresh = await refreshAccessToken();

      if (refresh) {
        return appFetch<TResponse>(location, init);
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
