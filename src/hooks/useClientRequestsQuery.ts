import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { requestKeys } from '../queries';
import { getClientRequests } from '../services/request.service';
import { getToken } from '../services/token.service';

type QueryFnData = Awaited<ReturnType<typeof getClientRequests>>;
type QueryError = unknown;

type Options = Omit<
  UseQueryOptions<QueryFnData, QueryError, QueryFnData, ReturnType<typeof requestKeys.client>>,
  'queryKey' | 'queryFn'
>;

type Result = UseQueryResult<QueryFnData, QueryError> & {
  clientRequests: any;
};

export function useClientRequestsQuery(options?: Options): Result {
  const token = getToken();
  const { enabled: optionsEnabled, ...restOptions } = options ?? {};
  const enabled = Boolean(token) && (optionsEnabled ?? true);

  const queryResult = useQuery({
    queryKey: requestKeys.client(),
    queryFn: getClientRequests,
    enabled,
    ...restOptions,
  });

  const clientRequests = queryResult.data || undefined;

  return {
    ...queryResult,
    clientRequests,
  } as Result;
}
