import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { serviceKeys } from '../queries';
import { getContractorServices } from '../services/service.service';
import { getToken } from '../services/token.service';

type QueryFnData = Awaited<ReturnType<typeof getContractorServices>>;
type QueryError = unknown;

type Options = Omit<
  UseQueryOptions<QueryFnData, QueryError, QueryFnData, ReturnType<typeof serviceKeys.contractor>>,
  'queryKey' | 'queryFn'
>;

export function useContractorServicesQuery(
  username: string | undefined,
  options?: Options,
): UseQueryResult<QueryFnData, QueryError> {
  const token = getToken();
  const { enabled: optionsEnabled, ...restOptions } = options ?? {};
  const enabled = Boolean(token) && Boolean(username) && (optionsEnabled ?? true);

  return useQuery({
    queryKey: serviceKeys.contractor(String(username ?? 'unknown')),
    queryFn: () => getContractorServices(username as string),
    enabled,
    ...restOptions,
  });
}
