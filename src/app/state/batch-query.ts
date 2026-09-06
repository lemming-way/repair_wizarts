/**
 * Модуль содержит функцию createBatchLoader. Эта функция создаёт хук для загрузки множества
 * объектов по списку id, сохраняя каждый загруженный объект под отдельным ключом кэша React Query.
 */

import { useRef, useCallback } from 'react';
import { useQueries, UseQueryResult } from '@tanstack/react-query';

import { authorizedUserId } from './auth';
import { useUser, UserProfile } from './user';

type BatchItem<T, ID> = {
  userId: number;
  itemId: ID;
  resolve: (result: T | null) => void;
  reject: (error: unknown) => void;
}

type BatchConfig<T, ID, K> = {
  fetchFn: (ids: ID[]) => Promise<(T | null)[]>;
  createQueryKey: (userId: number, itemId: ID) => (string | number)[];
  extractKeys: (queryKey: (string | number)[]) => [ number, ID ];
  staleTime?: number;
  dataKey: K;
};

type CombinedResult = {
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  isSuccess: boolean;
};

type CreateBatchLoaderResult<T, ID, K extends string> = [
  (params: { queryKey: (string | number)[] }) => Promise<T | null>,
  (ids: ID[]) => CombinedResult & {[P in K]: T[]}
];

/**
 * Возвращает функцию для загрузки одного объекта по ключу кэша (для использования в fetchQuery,
 * ensureQueryData и т. п.) и хук для получения списка объектов типа T по ID
 * @param fetchFn асинхронная функция для запроса объектов с сервера
 * @param createQueryKey функция-трансформер, генерирующая queryKey по ID пользователя и объекта
 * @param extractKeys обратная функция-трансформер, извлекающая ID пользователя и объекта из queryKey
 * @param staleTime время жизни кэша для передачи в useQuery
 * @param dataKey имя свойства для хранения массива данных
 * @returns Массив, содержащий две функции.
 */
export function createBatchLoader<T extends { id: number | string }, K extends string>({
  fetchFn,
  createQueryKey,
  extractKeys,
  staleTime,
  dataKey
}: BatchConfig<T, T['id'], K>) : CreateBatchLoaderResult<T, T['id'], K> {
  type ID = T['id'];

  let items = [] as BatchItem<T, ID>[];
  let timeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Получить объект по ID
   * Использует батчинг для объединения нескольких запросов в один API вызов.
   * @param queryKey Ключ запроса, содержащий ID пользователя и ID сообщения (например, ['user', 8, 'object', 123]).
   * @returns Промис, который разрешается с объектом типа T или null
   * @throws {Error} Если произошла ошибка при запросе к API или объект не найден.
   */
  const getItemById = ({ queryKey }: { queryKey: (string | number)[] }): Promise<T | null> => {
    const [ userId, itemId ] = extractKeys(queryKey);
    if (!userId || !itemId) return Promise.resolve(null);

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const resolvers = items;
      items = [];
      timeout = null;

      const itemIds = [...new Set(resolvers.map(item => item.itemId))];

      if (itemIds.length === 0) {
        return;
      }

      try {
        const authUserId = authorizedUserId();
        const data = authUserId ? (await fetchFn(itemIds)) : null;

        const itemsMap = new Map<ID, T>(data?.filter(Boolean).map(item => [item!.id, item!]) ?? []);
        resolvers.forEach(resolver => {
          const item = itemsMap.get(resolver.itemId);
          if (item && authUserId === resolver.userId) {
            resolver.resolve(item);
          }
          else {
            resolver.resolve(null);
          }
        });
      } catch (error) {
        resolvers.forEach(resolver => resolver.reject(error));
      }
    }, 10);

    return new Promise((resolve, reject) => {
      items.push({ userId, itemId, resolve, reject });
    });
  }

  /**
   * Хук для получения списка объектов по ID
   * @param ids Массив ID объектов
   * @returns Объект, содержащий объединенное состояние запросов React Query
   *          и массив с именем, переданным в dataKey, с данными успешно полученных объектов.
   */
  const useItemsByIds = (ids: ID[]) => {
    const { user } = useUser() as { user: UserProfile };
    const { current: instance } = useRef({
      trackedProps: null as Set<string> | null,
      lastIds: [] as ID[],
      lastResults: null as UseQueryResult<T | null, Error>[] | null,
      currentResults: null as UseQueryResult<T | null, Error>[] | null,
      currentValue: {
        isLoading: false,
        isFetching: false,
        isError: false,
        error: null,
        isSuccess: true,
        [dataKey]: []
      } as CombinedResult & {[P in K]: T[]}
    });
    instance.trackedProps ||= new Set<string>();
    instance.currentResults ||= [] as UseQueryResult<T | null, Error>[];

    // React Query не вызывает combine при каждом изменении списка запросов. Вместо этого combine вызывается позже
    // через useEffect. Чтобы получать свежие данные при первом вызове хука, мы будем менять ссылку на combineFn
    // при каждом изменении списка ids.
    if (instance.lastIds?.length !== ids.length || instance.lastIds.some((id, index) => id !== ids[index])) {
      instance.lastIds = [...ids];
    }

    // React Query отслеживает свойства результата, к которым происходит обращение в коде рендера.
    // Из-за этого он будет вызывать рендер компонентов каждый раз, когда меняется какое-либо
    // из свойств isLoading, isFetching и т. д., даже если эти свойства реально не используются в рендере.
    // Чтобы избежать этого, мы тоже будем отслеживать свойства, к которым происходит обращение, и
    // проверять в combineFn только нужные свойства. Если в этих нужных свойствах не произошло изменений,
    // рендер не будет вызван.
    const combineFn = useCallback((results: UseQueryResult<T | null, Error>[]) => {
      instance.currentResults = results;

      const trackedProps = instance.trackedProps!;
      const combined: Record<string, unknown> = {};

      if (trackedProps.has('isLoading')) combined.isLoading = false;
      if (trackedProps.has('isFetching')) combined.isFetching = false;
      if (trackedProps.has('isError')) combined.isError = false;
      if (trackedProps.has('error')) combined.error = null;
      if (trackedProps.has('isSuccess')) combined.isSuccess = true;
      if (trackedProps.has('data')) combined.data = [];

      if (trackedProps.size > 0) {
        for (const query of results) {
          if (trackedProps.has('isLoading')) combined.isLoading ||= query.isLoading;
          if (trackedProps.has('isFetching')) combined.isFetching ||= query.isFetching;
          if (trackedProps.has('isError')) combined.isError ||= query.isError;
          if (trackedProps.has('error') && !combined.error && query.error) combined.error = query.error;
          if (trackedProps.has('isSuccess')) combined.isSuccess &&= query.isSuccess;
          if (trackedProps.has('data') && query.data) (combined.data as unknown[]).push(query.data);
        }
      }

      return combined;
      // Добавили instance.lastIds, чтобы принудительно обновлять ссылку на combineFn при получении нового списка ID
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instance, instance.lastIds]);

    const queries = ids.map(itemId => ({
      queryKey: createQueryKey(user.id, itemId),
      queryFn: getItemById,
      staleTime,
      enabled: !!itemId && !!user.id && user.id === authorizedUserId()  // Доступно только авторизованному пользователю
    }));

    useQueries({
      queries,
      combine: combineFn
    });

    // combineFn обрабатывает только свойства, к которым уже было обращение в коде рендера, но сам результат
    // нашего хука useItemsByIds должен всегда отдавать действительные значения свойств.
    // Мы используем геттеры, чтобы не запрашивать данные у React Query раньше, чем это необходимо.
    if (instance.lastResults === instance.currentResults) return instance.currentValue;
    if (
      !instance.lastResults ||
      instance.lastResults.length !== instance.currentResults.length ||
      instance.lastResults.some((result, i) => result !== instance.currentResults![i])
    ) {
      const results = instance.currentResults;
      const trackedProps = instance.trackedProps;
      const cached = {};
      const trackProp = <P>(prop: string, getter: () => P) => {
        if (prop in cached) return cached[prop] as P;
        trackedProps.add(prop);
        cached[prop] = getter();
        return cached[prop] as P;
      };
      instance.currentValue = {
        get isLoading() { return trackProp('isLoading', () => results.some(result => result.isLoading)); },
        get isFetching() { return trackProp('isFetching', () => results.some(result => result.isFetching)); },
        get isError() { return trackProp('isError', () => results.some(result => result.isError)); },
        get error() { return trackProp('error', () => { for (const result of results ) { const e = result.error; if (e) return e; } return null; }); },
        get isSuccess() { return trackProp('isSuccess', () => results.every(result => result.isSuccess)); },
        get [dataKey]() { return trackProp('data', () => results.filter(result => !!result.data).map(result => result.data) as T[]); }
      } as CombinedResult & {[P in K]: T[]};
    }
    instance.lastResults = instance.currentResults;
    return instance.currentValue;
  };

  return [ getItemById, useItemsByIds ];
}
