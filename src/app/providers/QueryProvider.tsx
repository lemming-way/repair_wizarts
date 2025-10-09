import { QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { queryClient } from '../queryClient';
import { QueryDevtools } from './QueryDevtools';

const isDevelopment = process.env.NODE_ENV === 'development';

export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {isDevelopment ? <QueryDevtools /> : null}
    </QueryClientProvider>
  );
}
