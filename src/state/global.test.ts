jest.mock('../constants', () => ({
  __esModule: true,
  default: {
    APP: {
      theme: 'light',
      language: 'en'
    },
    API: {
      queryStaleTime: 5000,
      queryRetry: 5
    }
  }
}));

import { renderHook, act, waitFor } from '@testing-library/react';
import { getGlobal, setGlobal, resetGlobal, isGlobalExists, useGlobalState, queryClient } from './global';

describe('Global State Manager', () => {
  it('should load default "queryStaleTime" and "retry" from config', () => {
    const options = queryClient.getDefaultOptions();
    expect(options.queries?.staleTime).toBe(5000);
    expect(options.queries?.retry).toBe(5);
  });

  it('should load default values at start', () => {
    expect(getGlobal('theme')).toBe('light');
    expect(getGlobal('language')).toBe('en');
  });

  describe('with cleanup', () => {
    beforeEach(() => {
      queryClient.clear();
    });

    it('should restore default global state after queryClient.clear()', () => {
      setGlobal('theme', 'dark');
      setGlobal('language', 'fr');
      queryClient.clear();
      expect(getGlobal('theme')).toBe('light');
      expect(getGlobal('language')).toBe('en');
    });

    it('should set and get values', () => {
      setGlobal('theme', 'dark');
      setGlobal('customKey', 'value');
      expect(getGlobal('theme')).toBe('dark');
      expect(getGlobal('customKey')).toBe('value');
    });

    it('should save functions as data', () => {
      setGlobal('hello', ( name: string ): string => `Hello, ${name}!`);
      const hello = getGlobal('hello');
      expect(hello!('World')).toBe('Hello, World!');
    });

    it('should handle null for undefined values', () => {
      expect(getGlobal('nonExistent')).toBe(null);
    });

    it('isGlobalExists should return key existance', () => {
      expect(isGlobalExists('theme')).toBe(true);
      expect(isGlobalExists('customKey')).toBe(false);
    });

    it('should reset to default value', () => {
      setGlobal('theme', 'dark');
      resetGlobal('theme');
      expect(getGlobal('theme')).toBe('light');
    });

    it('should remove non-default values on reset', () => {
      setGlobal('customKey', 'value');
      resetGlobal('customKey');
      expect(getGlobal('customKey')).toBe(null);
      expect(isGlobalExists('customKey')).toBe(false);
    });

    it('should work with useGlobalState hook', async () => {
      const { result } = renderHook(() => useGlobalState('theme'));

      await waitFor(() => expect(result.current).toBe('light'));

      await act(async () => {
        setGlobal('theme', 'dark');
      });

      await waitFor(() => expect(result.current).toBe('dark'));
    });

    it('should trigger render on value change', async () => {
      let renderCount = 0;

      const { result } = renderHook(() => {
        renderCount++;
        return useGlobalState('counter');
      });

      await waitFor(() => expect(renderCount).toBe(1));

      await act(async () => {
        setGlobal('counter', 1);
        await new Promise(( resolve ) => setTimeout( resolve, 10 ));
      });

      expect(renderCount).toBe(2);

      await act(async () => {
        setGlobal('counter', 2);
        await new Promise(( resolve ) => setTimeout( resolve, 10 ));
      });

      expect(renderCount).toBe(3);
    });

    it('should not trigger render when setting the same value', async () => {
      let renderCount = 0;

      const { result } = renderHook(() => {
        renderCount++;
        return useGlobalState('counter');
      });

      await waitFor(() => expect(renderCount).toBe(1));

      await act(async () => {
        setGlobal('counter', 1);
        await new Promise(( resolve ) => setTimeout( resolve, 10 ));
      });

      expect(renderCount).toBe(2);

      await act(async () => {
        setGlobal('counter', 1);
        await new Promise(( resolve ) => setTimeout( resolve, 10 ));
      });

      expect(renderCount).toBe(2);
    });

    it('should not trigger render when setting other values', async () => {
      let renderCount = 0;

      const { result } = renderHook(() => {
        renderCount++;
        return useGlobalState('counter');
      });

      await waitFor(() => expect(renderCount).toBe(1));

      await act(async () => {
        setGlobal('customKey', 'value');
        setGlobal('customKey2', 'another value');
        await new Promise(( resolve ) => setTimeout( resolve, 10 ));
      });

      expect(renderCount).toBe(1);
    });
  });
});
