/**
 * Модуль содержит функцию createBatchLoader. Эта функция создаёт хук для загрузки множества
 * объектов по списку id, сохраняя каждый загруженный объект под отдельным ключом кэша React Query.
 */

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
  fetchFn: (ids: ID[], authUserId: number) => Promise<(T | null)[]>;
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
 * Возвращает хук для получения списка объектов типа T по ID
 * @param fetchFn асинхронная функция для запроса объектов с сервера
 * @param createQueryKey функция-трансформер, генерирующая queryKey по ID пользователя и объекта
 * @param extractKeys обратная функция-трансформер, извлекающая ID пользователя и объекта из queryKey
 * @param staleTime время жизни кэша для передачи в useQuery
 * @returns Объект, содержащий объединенное состояние запросов React Query
 *          и массив `data` с данными успешно полученных сообщений.
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
   * @param messageId ID объекта
   * @param queryClient Инстанс QueryClient для управления кэшем.
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
        const data = authUserId ? (await fetchFn(itemIds, authUserId)) : null;

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

  const combineFetchResults = (results: UseQueryResult<T | null, unknown>[]) => {
    // Агрегируем состояния загрузки и ошибок
    const ret = {
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null as unknown,
      isSuccess: true,
      [dataKey]: [] as T[]
    } as CombinedResult & {[P in K]: T[]};

    for (const query of results) {
      ret.isLoading ||= query.isLoading;
      ret.isFetching ||= query.isFetching;
      if (query.isError && !ret.error) {
        ret.isError = true;
        ret.error = query.error;
      }
      ret.isSuccess &&= query.isSuccess;
      if (query.data) ret[dataKey].push(query.data as T);
    }

    return ret;
  }

  const useItemsByIds = (ids: ID[]) => {
    const { user } = useUser() as { user: UserProfile };
    const queries = ids.map(itemId => ({
      queryKey: createQueryKey(user.id, itemId),
      queryFn: getItemById,
      staleTime,
      enabled: !!itemId && !!user.id && user.id === authorizedUserId()  // Доступно только авторизованному пользователю
    }));

    return useQueries({
      queries,
      combine: combineFetchResults
    });
  };

  return [ getItemById, useItemsByIds ];
}
