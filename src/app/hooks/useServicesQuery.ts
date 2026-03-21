import { useEffect, useMemo } from 'react';
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { serviceKeys } from '../queries';
import { getServices } from '../services/service.service';

type QueryFnData = Awaited<ReturnType<typeof getServices>>;
type QueryError = unknown;

const STORAGE_KEY = 'services';

type Options = Omit<
  UseQueryOptions<QueryFnData, QueryError, QueryFnData, typeof serviceKeys.all>,
  'queryKey' | 'queryFn'
>;

type Result = UseQueryResult<QueryFnData, QueryError> & {
  services: QueryFnData | undefined;
};

const readServicesFromStorage = (): QueryFnData | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return undefined;
    }

    return JSON.parse(stored) as QueryFnData;
  } catch (error) {
    return undefined;
  }
};

const persistServicesToStorage = (services: QueryFnData) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  } catch (error) {
    // noop
  }
};

export function useServicesQuery(options?: Options): Result {
  const storedServices = useMemo(readServicesFromStorage, []);

  const queryResult = useQuery({
    queryKey: serviceKeys.all,
    queryFn: getServices,
    ...(storedServices ? { initialData: storedServices } : {}),
    ...options,
  });

  useEffect(() => {
    if (queryResult.data) {
      persistServicesToStorage(queryResult.data);
    }
  }, [queryResult.data]);

  const services = queryResult.data ?? storedServices;

  return {
    ...queryResult,
    services,
  };
}
