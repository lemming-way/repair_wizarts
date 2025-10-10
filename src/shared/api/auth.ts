import SERVER_PATH from '../../constants/SERVER_PATH.js';
import { getToken, removeToken, setToken } from '../../services/token.service';
import { getKeepUserAuthorized } from '../../services/user.service';

type AuthParams = Record<string, string>;

export function getAuthParams(): AuthParams {
  const token = getToken();
  if (!token || typeof token !== 'object') {
    return {};
  }

  const accessToken =
    (token as Record<string, unknown>).access_token ??
    (token as Record<string, unknown>).token;
  const hash =
    (token as Record<string, unknown>).u_hash ??
    (token as Record<string, unknown>).hash;

  const params: AuthParams = {};

  if (typeof accessToken === 'string' && accessToken) {
    params.token = accessToken;
  }

  if (typeof hash === 'string' && hash) {
    params.u_hash = hash;
  }

  return params;
}

type StoredToken = Record<string, unknown>;

let refreshPromise: Promise<boolean> | null = null;

function resolveRefreshUrl(): string {
  const base = process.env.REACT_APP_API_URL || SERVER_PATH || '';
  const path = 'user/refresh';

  if (/^https?:\/\//.test(path)) {
    return path;
  }

  if (/^https?:\/\//.test(base)) {
    return new URL(path, base).toString();
  }

  return `${base}${path}`;
}

async function performRefresh(stored: StoredToken): Promise<boolean> {
  const refreshToken = stored.refresh_token ?? stored.refreshToken;

  if (typeof refreshToken !== 'string' || !refreshToken) {
    removeToken();
    return false;
  }

  try {
    const response = await fetch(resolveRefreshUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (!response.ok) {
      removeToken();
      return false;
    }

    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    const nextAccessToken = data.access_token ?? data.token;

    if (typeof nextAccessToken !== 'string' || !nextAccessToken) {
      removeToken();
      return false;
    }

    const nextHash =
      (typeof data.u_hash === 'string' && data.u_hash) ||
      (typeof data.hash === 'string' && data.hash) ||
      (typeof stored.u_hash === 'string' && stored.u_hash) ||
      (typeof stored.hash === 'string' && stored.hash);

    const merged: StoredToken = {
      ...stored,
      ...data,
      access_token: nextAccessToken,
      token: nextAccessToken,
      refresh_token: data.refresh_token ?? stored.refresh_token ?? stored.refreshToken,
    };

    if (nextHash) {
      merged.u_hash = nextHash;
      merged.hash = nextHash;
    }

    setToken(merged);
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    removeToken();
    return false;
  }
}

export async function maybeRefreshToken(resp: Response): Promise<boolean> {
  if (resp.status !== 401) {
    return false;
  }

  const stored = getToken();
  if (!stored || typeof stored !== 'object') {
    removeToken();
    return false;
  }

  if (typeof getKeepUserAuthorized === 'function' && !getKeepUserAuthorized()) {
    removeToken();
    return false;
  }

  if (!refreshPromise) {
    refreshPromise = performRefresh(stored as StoredToken).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}
