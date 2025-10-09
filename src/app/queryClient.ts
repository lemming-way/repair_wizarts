import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import CONFIG from '../constants';

const isDevelopment = process.env.NODE_ENV === 'development';

const defaultStaleTime = CONFIG.API?.queryStaleTime ?? 30 * 60 * 1000;
const defaultRetry = CONFIG.API?.queryRetry ?? 3;

const handleError = (error: unknown) => {
  if (isDevelopment) {
    // eslint-disable-next-line no-console
    console.error('[React Query] request failed', error);
  }
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleError,
  }),
  mutationCache: new MutationCache({
    onError: handleError,
  }),
  defaultOptions: {
    queries: {
      staleTime: defaultStaleTime,
      retry: defaultRetry,
      refetchOnWindowFocus: false,
      throwOnError: false,
    },
    mutations: {
      retry: false,
    },
  },
});
