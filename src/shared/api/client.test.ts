import { api } from './client';
import * as authModule from './auth';
import type { Err, Ok, Result } from './types';

jest.mock('./auth', () => ({
  getAuthParams: jest.fn(),
}));

describe('api client', () => {
  const originalFetch = global.fetch as any;
  const mockGetAuthParams = authModule.getAuthParams as jest.MockedFunction<typeof authModule.getAuthParams>;

  function assertOk<T>(result: Result<T>): asserts result is Ok<T> {
    expect(result.ok).toBe(true);
  }

  function assertErr<T>(result: Result<T>): asserts result is Err {
    expect(result.ok).toBe(false);
  }

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    (global.fetch as any) = originalFetch;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('returns ok on 200 JSON', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ hello: 'world' }),
    });
    const res = await api.get<{ hello: string }>('test');
    assertOk(res);
    expect(res.data.hello).toBe('world');
  });

  it('returns error on non-2xx', async () => {
    (global.fetch as any) = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      headers: { get: () => 'application/json' },
      json: async () => ({ message: 'boom' }),
    });
    const res = await api.get<any>('test');
    assertErr(res);
    expect(res.error.status).toBe(500);
  });

  it('aborts via external signal', async () => {
    (global.fetch as any) = jest.fn().mockImplementation((_url: string, init?: any) => {
      return new Promise((_resolve, reject) => {
        const signal: AbortSignal | undefined = init?.signal;
        if (signal?.aborted) {
          reject(new Error('AbortError'));
          return;
        }
        signal?.addEventListener('abort', () => reject(new Error('AbortError')));
      });
    });
    const controller = new AbortController();
    controller.abort();
    const res = await api.get<any>('test', { signal: controller.signal });
    assertErr(res);
  });

  it('sends auth params in POST body as form data', async () => {
    mockGetAuthParams.mockReturnValue({ token: 'abc', u_hash: 'def' });
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true }),
    });
    (global.fetch as any) = fetchMock;

    const res = await api.post<{ success: boolean }>('test', { foo: 'bar' });

    assertOk(res);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    const body = init.body as URLSearchParams;
    expect(body).toBeInstanceOf(URLSearchParams);
    expect(body.get('foo')).toBe('bar');
    expect(body.get('token')).toBe('abc');
    expect(body.get('u_hash')).toBe('def');
  });

  it('does not attach auth params to GET query automatically', async () => {
    mockGetAuthParams.mockReturnValue({ token: 'abc', u_hash: 'def' });
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true }),
    });
    (global.fetch as any) = fetchMock;

    const res = await api.get<{ success: boolean }>('test', { query: { q: 'value' } });

    assertOk(res);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain('?q=value');
    expect(url).not.toContain('token=');
    expect(init.body).toBeUndefined();
  });

  it('merges existing URLSearchParams bodies with auth params', async () => {
    mockGetAuthParams.mockReturnValue({ token: 'abc', u_hash: 'def' });
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: true }),
    });
    (global.fetch as any) = fetchMock;

    const params = new URLSearchParams();
    params.set('hello', 'world');

    const res = await api.post<{ success: boolean }>('test', params);

    assertOk(res);
    const [, init] = fetchMock.mock.calls[0];
    const body = init.body as URLSearchParams;
    expect(body.get('hello')).toBe('world');
    expect(body.get('token')).toBe('abc');
  });
});
