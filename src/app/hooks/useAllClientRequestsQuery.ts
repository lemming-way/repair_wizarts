import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { requestKeys } from '../queries';
import { getAllClientRequests } from '../services/request.service';
import { getToken } from '../services/token.service';

type QueryFnData = Awaited<ReturnType<typeof getAllClientRequests>>;
type QueryError = unknown;

type Options = Omit<
  UseQueryOptions<QueryFnData, QueryError, QueryFnData, ReturnType<typeof requestKeys.clientAll>>,
  'queryKey' | 'queryFn'
>;

type Result = UseQueryResult<QueryFnData, QueryError> & {
  clientRequests: any[];
};

const EMPTY_ARRAY: any[] = [];

export function useAllClientRequestsQuery(options?: Options): Result {
  const token = getToken();
  const { enabled: optionsEnabled, ...restOptions } = options ?? {};
  const enabled = Boolean(token) && (optionsEnabled ?? true);

  const queryResult = useQuery({
    queryKey: requestKeys.clientAll(),
    queryFn: getAllClientRequests,
    enabled,
    ...restOptions,
  });

  const clientRequests = Array.isArray(queryResult.data)
    ? queryResult.data
    : EMPTY_ARRAY;

  return {
    ...queryResult,
    clientRequests,
  } as Result;
}
