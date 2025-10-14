import { clearTokenOnUnauthorized, getAuthParams } from './auth';
import type { ApiError, RequestOptions, Result } from './types';
import SERVER_PATH from '../../constants/SERVER_PATH.js';

function buildUrl(base: string, path: string, query?: RequestOptions['query']): string {
  const effectiveBase = base && /^https?:\/\//.test(base) ? base : 'http://localhost/';
  const isAbsolute = /^https?:\/\//.test(path);
  const url = isAbsolute ? new URL(path) : new URL(path, effectiveBase);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined) return;
      url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

function toApiError(e: unknown, status = 0, correlationId?: string): ApiError {
  if (typeof e === 'object' && e && 'status' in (e as any)) return e as ApiError;
  const message = e instanceof Error ? e.message : 'Request failed';
  return { status, message, correlationId };
}

type AuthParams = Record<string, string>;

function appendFormValue(params: URLSearchParams, key: string, value: unknown, tracker: { used: boolean }) {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => appendFormValue(params, key, item, tracker));
    return;
  }

  const normalized = typeof value === 'string' ? value : String(value);
  params.append(key, normalized);
  tracker.used = true;
}

function cloneFormData(input: FormData): FormData {
  const copy = new FormData();
  input.forEach((value, key) => {
    copy.append(key, value as any);
  });
  return copy;
}

function preparePostBody(body: unknown, authParams: AuthParams): {
  body?: BodyInit;
  isFormData: boolean;
} {
  const authEntries = Object.entries(authParams);

  if (body instanceof FormData) {
    const params = cloneFormData(body);
    authEntries.forEach(([key, value]) => params.append(key, value));
    return { body: params, isFormData: true };
  }

  if (body instanceof URLSearchParams) {
    const params = new URLSearchParams(body);
    const tracker = { used: false };
    params.forEach(() => {
      tracker.used = true;
    });
    authEntries.forEach(([key, value]) => {
      params.append(key, value);
      tracker.used = true;
    });
    return tracker.used ? { body: params, isFormData: false } : { body: undefined, isFormData: false };
  }

  const params = new URLSearchParams();
  const tracker = { used: false };

  if (body && typeof body === 'object' && !Array.isArray(body)) {
    Object.entries(body as Record<string, unknown>).forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        appendFormValue(params, key, JSON.stringify(value), tracker);
        return;
      }
      appendFormValue(params, key, value, tracker);
    });
  } else if (typeof body === 'string') {
    if (body.trim()) {
      appendFormValue(params, 'payload', body, tracker);
    }
  } else if (body !== undefined && body !== null) {
    appendFormValue(params, 'payload', body, tracker);
  }

  authEntries.forEach(([key, value]) => appendFormValue(params, key, value, tracker));

  if (!tracker.used) {
    return { body: undefined, isFormData: false };
  }

  return { body: params, isFormData: false };
}

export function createAbortableController(timeoutMs?: number, external?: AbortSignal) {
  const controller = new AbortController();
  const timeout = typeof timeoutMs === 'number' ? timeoutMs : 12000; // default 12s
  const t = setTimeout(() => controller.abort(), timeout);
  if (external) {
    if (external.aborted) {
      controller.abort();
    } else {
      external.addEventListener('abort', () => controller.abort());
    }
  }
  return { signal: controller.signal, dispose: () => clearTimeout(t) };
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<Result<T>> {
  const base = process.env.REACT_APP_API_URL || SERVER_PATH || '';
  const correlationId = Math.random().toString(36).slice(2);
  const method = opts.method || 'GET';
  const { signal, dispose } = createAbortableController(opts.timeoutMs, opts.signal);

  const rawAuthParams = getAuthParams();
  const authParams = rawAuthParams && typeof rawAuthParams === 'object' ? (rawAuthParams as AuthParams) : {};

  const url = buildUrl(base, path, opts.query);

  let body: BodyInit | undefined;
  let isFormData = false;

  if (method === 'POST') {
    const prepared = preparePostBody(opts.body, authParams);
    body = prepared.body;
    isFormData = prepared.isFormData;
  }

  const headers: Record<string, string> = {
    ...(opts.headers ?? {}),
  };

  if (method === 'POST' && !isFormData && body instanceof URLSearchParams && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
  }

  try {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[api]', correlationId, method, url);
    }
    const resp = await fetch(url, { method, headers, body, signal });
    const ct = resp.headers.get('content-type') || '';
    const isJson = ct.includes('application/json');
    const data = isJson ? await resp.json().catch(() => undefined) : await resp.text();
    if (resp.ok) {
      dispose();
      return { ok: true, data: data as T, correlationId };
    }

    if (resp.status === 401) {
      clearTokenOnUnauthorized();
    }

    const err: ApiError = {
      status: resp.status,
      message: (data && (data.detail || data.message)) || resp.statusText || 'HTTP error',
      correlationId,
      details: data,
    };
    if (process.env.NODE_ENV !== 'production') {
      console.error('[api]', correlationId, err);
    }
    dispose();
    return { ok: false, error: err, correlationId };
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[api]', correlationId, e);
    }
    dispose();
    return { ok: false, error: toApiError(e, 0, correlationId), correlationId };
  }
}

export const api = {
  get: <T>(path: string, opts: Omit<RequestOptions, 'method' | 'body'> = {}) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    request<T>(path, { ...opts, method: 'POST', body }),
};
