import { useQuery } from '@tanstack/react-query';
import { queryClient } from '../app/queryClient';
import { globalStateKeys } from '../queries';
import CONFIG from '../constants';

// Тип глобального состояния
export interface GlobalState {
  [key: string]: any;
}

// Ключ для кэширования в react-query
// Начальное состояние
const defaultState: GlobalState = { ...CONFIG.APP };

queryClient.setQueryDefaults(globalStateKeys.all, {
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
  return queryClient.getQueryData(globalStateKeys.item(key)) ?? null;
}

// Установить значение
export function setGlobal<T = any>(key: string, value: T): void {
  if (value !== undefined && !Object.is( value, queryClient.getQueryData(globalStateKeys.item(key)) )) {
    if ('function' === typeof value) {
      // Чтобы записать в кэш функцию, нужно обернуть её в другую функцию из-за интерфейса setQueryData
      queryClient.setQueryData(globalStateKeys.item(key), () => value );
    }
    else {
      queryClient.setQueryData(globalStateKeys.item(key), value );
    }
  }
}

// Сбросить значение к начальному
export function resetGlobal(key: string): void {
  if (key in defaultState) {
    setGlobal( key, defaultState[key] );
  } else {
    queryClient.removeQueries({ queryKey: globalStateKeys.item(key), exact: true });
  }
}

// Проверить наличие ключа
export function isGlobalExists(key: string): boolean {
  return queryClient.getQueryData(globalStateKeys.item(key)) !== undefined;
}

// React Hook для использования глобального состояния
export function useGlobalState<T = any>(key: string): T | null {
  const { data } = useQuery( { queryKey: globalStateKeys.item(key) }, queryClient ) as { data: T | null };
  return data;
}
