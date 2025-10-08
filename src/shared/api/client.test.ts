import { api } from './client';
import { attemptTokenRefresh } from './token';
import * as authModule from './auth';
import type { Err, Ok, Result } from './types';

// Mock the auth and token modules
jest.mock('./token', () => ({
  attemptTokenRefresh: jest.fn(),
}));

jest.mock('./auth', () => ({
  getAuthHeaders: jest.fn(),
}));

describe('api client', () => {
  const originalFetch = global.fetch as any;
  const mockAttemptTokenRefresh = attemptTokenRefresh as jest.MockedFunction<typeof attemptTokenRefresh>;
  const mockGetAuthHeaders = authModule.getAuthHeaders as jest.MockedFunction<typeof authModule.getAuthHeaders>;

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
    const res = await api.get<{ hello: string }>('test', { retry: { attempts: 0 } });
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
    const res = await api.get<any>('test', { retry: { attempts: 0 } });
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
    const res = await api.get<any>('test', { signal: controller.signal, retry: { attempts: 0 } });
    assertErr(res);
  });

  describe('token refresh', () => {
    it('does not retry on 401 without Authorization header', async () => {
      mockGetAuthHeaders.mockReturnValue({});
      const fetchMock = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: { get: () => 'application/json' },
        json: async () => ({ message: 'unauthorized' }),
      });
      (global.fetch as any) = fetchMock;

      const res = await api.get<any>('test', { retry: { attempts: 0 } });

      assertErr(res);
      expect(res.error.status).toBe(401);
      expect(mockAttemptTokenRefresh).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('retries on 401 with Authorization header when token refresh succeeds', async () => {
      // First call returns 401, second call succeeds
      const fetchMock = jest.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          headers: { get: () => 'application/json' },
          json: async () => ({ message: 'unauthorized' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          json: async () => ({ data: 'success' }),
        });
      (global.fetch as any) = fetchMock;

      // Mock auth headers with Authorization
      mockGetAuthHeaders
        .mockReturnValueOnce({ Authorization: 'Bearer old-token' })
        .mockReturnValueOnce({ Authorization: 'Bearer new-token' });

      // Mock successful token refresh
      mockAttemptTokenRefresh.mockResolvedValue(true);

      const res = await api.get<any>('test', { retry: { attempts: 0 } });

      assertOk(res);
      expect(res.data).toEqual({ data: 'success' });
      expect(mockAttemptTokenRefresh).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('does not retry when token refresh fails', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: { get: () => 'application/json' },
        json: async () => ({ message: 'unauthorized' }),
      });
      (global.fetch as any) = fetchMock;

      mockGetAuthHeaders.mockReturnValue({ Authorization: 'Bearer old-token' });
      mockAttemptTokenRefresh.mockResolvedValue(false);

      const res = await api.get<any>('test', { retry: { attempts: 0 } });

      assertErr(res);
      expect(res.error.status).toBe(401);
      expect(mockAttemptTokenRefresh).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(1); // No retry
    });

    it('does not retry on non-401 errors even with Authorization header', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        headers: { get: () => 'application/json' },
        json: async () => ({ message: 'forbidden' }),
      });
      (global.fetch as any) = fetchMock;

      mockGetAuthHeaders.mockReturnValue({ Authorization: 'Bearer token' });

      const res = await api.get<any>('test', { retry: { attempts: 0 } });

      assertErr(res);
      expect(res.error.status).toBe(403);
      expect(mockAttemptTokenRefresh).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('handles token refresh exceptions gracefully', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: { get: () => 'application/json' },
        json: async () => ({ message: 'unauthorized' }),
      });
      (global.fetch as any) = fetchMock;

      mockGetAuthHeaders.mockReturnValue({ Authorization: 'Bearer token' });
      mockAttemptTokenRefresh.mockRejectedValue(new Error('Network error'));

      const res = await api.get<any>('test', { retry: { attempts: 0 } });

      assertErr(res);
      // When token refresh throws an exception, it should return the original 401 error
      expect(res.error.status).toBe(401);
      expect(mockAttemptTokenRefresh).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(1); // No retry
    });

    it('only retries token refresh once (prevents infinite loops)', async () => {
      const fetchMock = jest.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          headers: { get: () => 'application/json' },
          json: async () => ({ message: 'unauthorized' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          headers: { get: () => 'application/json' },
          json: async () => ({ message: 'still unauthorized' }),
        });
      (global.fetch as any) = fetchMock;

      mockGetAuthHeaders.mockReturnValue({ Authorization: 'Bearer token' });
      mockAttemptTokenRefresh.mockResolvedValue(true);

      const res = await api.get<any>('test', { retry: { attempts: 0 } });

      assertErr(res);
      expect(res.error.status).toBe(401);
      expect(mockAttemptTokenRefresh).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledTimes(2); // Original + one retry
    });
  });
});
