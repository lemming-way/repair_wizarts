import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { requestKeys } from '../queries';
import { getContractorOrders } from '../services/order.service';
import { getToken } from '../services/token.service';

type QueryFnData = Awaited<ReturnType<typeof getContractorOrders>>;
type QueryError = unknown;

type Options = Omit<
  UseQueryOptions<QueryFnData, QueryError, QueryFnData, ReturnType<typeof requestKeys.contractorOrders>>,
  'queryKey' | 'queryFn'
>;

type Result = UseQueryResult<QueryFnData, QueryError> & {
  contractorOrders: any[];
};

const EMPTY_ARRAY: any[] = [];

export function useContractorOrdersQuery(options?: Options): Result {
  const token = getToken();
  const { enabled: optionsEnabled, ...restOptions } = options ?? {};
  const enabled = Boolean(token) && (optionsEnabled ?? true);

  const queryResult = useQuery({
    queryKey: requestKeys.contractorOrders(),
    queryFn: getContractorOrders,
    enabled,
    ...restOptions,
  });

  const contractorOrders = Array.isArray(queryResult.data)
    ? queryResult.data
    : EMPTY_ARRAY;

  return {
    ...queryResult,
    contractorOrders,
  } as Result;
}
