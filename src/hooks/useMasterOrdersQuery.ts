import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { requestKeys } from '../queries';
import { getMasterOrders } from '../services/order.service';
import { getToken } from '../services/token.service';

type QueryFnData = Awaited<ReturnType<typeof getMasterOrders>>;
type QueryError = unknown;

type Options = Omit<
  UseQueryOptions<QueryFnData, QueryError, QueryFnData, ReturnType<typeof requestKeys.masterOrders>>,
  'queryKey' | 'queryFn'
>;

type Result = UseQueryResult<QueryFnData, QueryError> & {
  masterOrders: any[];
};

const EMPTY_ARRAY = [] as unknown as QueryFnData;

export function useMasterOrdersQuery(options?: Options): Result {
  const token = getToken();
  const { enabled: optionsEnabled, ...restOptions } = options ?? {};
  const enabled = Boolean(token) && (optionsEnabled ?? true);

  const queryResult = useQuery({
    queryKey: requestKeys.masterOrders(),
    queryFn: getMasterOrders,
    enabled,
    ...restOptions,
  });

  const masterOrders = Array.isArray(queryResult.data)
    ? queryResult.data
    : EMPTY_ARRAY;

  return {
    ...queryResult,
    masterOrders,
  } as Result;
}
