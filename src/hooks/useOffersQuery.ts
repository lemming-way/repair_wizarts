import { useMemo } from 'react';
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { offerKeys } from '../queries';
import { getOffers } from '../services/offer.service';
import { getToken } from '../services/token.service';

type QueryFnData = Awaited<ReturnType<typeof getOffers>>;
type QueryError = unknown;

type Options = Omit<
  UseQueryOptions<QueryFnData, QueryError, QueryFnData, ReturnType<typeof offerKeys.list>>,
  'queryKey' | 'queryFn'
>;

type Result = UseQueryResult<QueryFnData, QueryError> & {
  offers: any[];
};

export function useOffersQuery(
  requestId: string | number | undefined,
  options?: Options,
): Result {
  const token = getToken();
  const { enabled: optionsEnabled, ...restOptions } = options ?? {};
  const enabled = Boolean(token) && Boolean(requestId) && (optionsEnabled ?? true);
  const normalizedId = (requestId ?? 'unknown') as string | number;

  const queryResult = useQuery({
    queryKey: offerKeys.list(normalizedId),
    queryFn: () => getOffers(requestId as string | number),
    enabled,
    ...restOptions,
  });

  const offers = useMemo(() => {
    const data = queryResult.data;

    return Array.isArray(data) ? data : [];
  }, [queryResult.data]);

  return {
    ...queryResult,
    offers,
  } as Result;
}
