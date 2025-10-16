import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import {
  offerKeys,
  normalizeOptionalOfferRequestId,
  UNKNOWN_OFFER_REQUEST_ID,
} from '../queries';
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

const EMPTY_ARRAY = [] as unknown as QueryFnData;

export function useOffersQuery(
  requestId: string | number | null | undefined,
  options?: Options,
): Result {
  const token = getToken();
  const { enabled: optionsEnabled, ...restOptions } = options ?? {};
  const enabled = Boolean(token) && Boolean(requestId) && (optionsEnabled ?? true);
  const normalizedId =
    normalizeOptionalOfferRequestId(requestId) ?? UNKNOWN_OFFER_REQUEST_ID;

  const queryResult = useQuery({
    queryKey: offerKeys.list(normalizedId),
    queryFn: () => getOffers(normalizedId),
    enabled,
    ...restOptions,
  });

  const offers = Array.isArray(queryResult.data)
    ? queryResult.data
    : EMPTY_ARRAY;

  return {
    ...queryResult,
    offers,
  } as Result;
}
