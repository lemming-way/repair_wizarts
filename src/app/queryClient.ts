import { QueryClient } from '@tanstack/react-query';
import CONFIG from '../constants';

const defaultStaleTime = CONFIG.API?.queryStaleTime ?? 30 * 60 * 1000;
const defaultRetry = CONFIG.API?.queryRetry ?? 3;

export const queryClient = new QueryClient({
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
