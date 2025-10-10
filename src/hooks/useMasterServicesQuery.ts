import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { serviceKeys } from '../queries';
import { getMasterServices } from '../services/service.service';
import { getToken } from '../services/token.service';

type QueryFnData = Awaited<ReturnType<typeof getMasterServices>>;
type QueryError = unknown;

type Options = Omit<
  UseQueryOptions<QueryFnData, QueryError, QueryFnData, ReturnType<typeof serviceKeys.master>>,
  'queryKey' | 'queryFn'
>;

export function useMasterServicesQuery(
  username: string | undefined,
  options?: Options,
): UseQueryResult<QueryFnData, QueryError> {
  const token = getToken();
  const { enabled: optionsEnabled, ...restOptions } = options ?? {};
  const enabled = Boolean(token) && Boolean(username) && (optionsEnabled ?? true);

  return useQuery({
    queryKey: serviceKeys.master(String(username ?? 'unknown')),
    queryFn: () => getMasterServices(username as string),
    enabled,
    ...restOptions,
  });
}
