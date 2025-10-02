import { QueryClient, useQuery } from '@tanstack/react-query';
import CONFIG from '../constants';

// Глобальный Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CONFIG.API?.queryStaleTime ?? 30 * 60 * 1000,
      retry: CONFIG.API?.queryRetry ?? 3
    },
  },
});

// Тип глобального состояния
export interface GlobalState {
  [key: string]: any;
}

// Ключ для кэширования в react-query
const GLOBAL_STATE_QUERY_KEY = 'global-state';

// Начальное состояние
const defaultState: GlobalState = { ...CONFIG.APP };

queryClient.setQueryDefaults( [ GLOBAL_STATE_QUERY_KEY ], {
  queryFn: () => { throw new Error('This should never be called!'); },
  networkMode: 'always',
  notifyOnChangeProps: ['data'],
  staleTime: 'static',
  gcTime: Infinity,
  initialData: null
} );

const initGlobals = () => {
  for (const key in defaultState) {
    setGlobal( key, defaultState[ key ] );
  }
};

const originalClearFn = queryClient.clear;
queryClient.clear = function(): void {
  originalClearFn.call( this );
  initGlobals();
};

initGlobals();

// Функции для работы с состоянием
// Получить значение по ключу
export function getGlobal<T = any>(key: string): T | null {
  return queryClient.getQueryData([ GLOBAL_STATE_QUERY_KEY, key ]) ?? null;
}

// Установить значение
export function setGlobal<T = any>(key: string, value: T): void {
  if (value !== undefined && !Object.is( value, queryClient.getQueryData([ GLOBAL_STATE_QUERY_KEY, key ]) )) {
    if ('function' === typeof value) {
      // Чтобы записать в кэш функцию, нужно обернуть её в другую функцию из-за интерфейса setQueryData
      queryClient.setQueryData( [ GLOBAL_STATE_QUERY_KEY, key ], () => value );
    }
    else {
      queryClient.setQueryData( [ GLOBAL_STATE_QUERY_KEY, key ], value );
    }
  }
}

// Сбросить значение к начальному
export function resetGlobal(key: string): void {
  if (key in defaultState) {
    setGlobal( key, defaultState[key] );
  } else {
    queryClient.removeQueries({ queryKey: [ GLOBAL_STATE_QUERY_KEY, key ], exact: true });
  }
}

// Проверить наличие ключа
export function isGlobalExists(key: string): boolean {
  return queryClient.getQueryData([ GLOBAL_STATE_QUERY_KEY, key ]) !== undefined;
}

// React Hook для использования глобального состояния
export function useGlobalState<T = any>(key: string): T | null {
  const { data } = useQuery( { queryKey: [ GLOBAL_STATE_QUERY_KEY, key ] }, queryClient ) as { data: T | null };
  return data;
}
