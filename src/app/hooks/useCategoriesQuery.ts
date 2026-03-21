import { useEffect, useMemo } from 'react';
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { categoryKeys } from '../queries';
import {
  CategoriesResponse,
  getCategories,
} from '../services/categories.service';

const STORAGE_KEY = 'sections';

type QueryFnData = CategoriesResponse;
type QueryError = unknown;

type Options = Omit<
  UseQueryOptions<QueryFnData, QueryError, QueryFnData, typeof categoryKeys.all>,
  'queryKey' | 'queryFn'
>;

type Result = UseQueryResult<QueryFnData, QueryError> & {
  categories: QueryFnData;
};

const readCategoriesFromStorage = (): QueryFnData | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return undefined;
    }

    const parsed = JSON.parse(stored);

    if (Array.isArray(parsed)) {
      return parsed as QueryFnData;
    }

    return undefined;
  } catch (error) {
    return undefined;
  }
};

const persistCategoriesToStorage = (categories: QueryFnData) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch (error) {
    // noop
  }
};

export function useCategoriesQuery(options?: Options): Result {
  const storedCategories = useMemo(readCategoriesFromStorage, []);
  const queryResult = useQuery({
    queryKey: categoryKeys.all,
    queryFn: getCategories,
    ...(storedCategories ? { initialData: storedCategories } : {}),
    ...options,
  });

  useEffect(() => {
    if (queryResult.data) {
      persistCategoriesToStorage(queryResult.data);
    }
  }, [queryResult.data]);

  const categories = queryResult.data ?? storedCategories ?? [];

  return {
    ...queryResult,
    categories,
  };
}
