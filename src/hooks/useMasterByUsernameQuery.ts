import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { userKeys } from '../queries';
import { getMasterByUsername } from '../services/user.service';
import { getToken } from '../services/token.service';

type QueryFnData = Awaited<ReturnType<typeof getMasterByUsername>>;
type QueryError = unknown;

type Options = Omit<
  UseQueryOptions<QueryFnData, QueryError, QueryFnData, ReturnType<typeof userKeys.profile>>,
  'queryKey' | 'queryFn'
>;

export function useMasterByUsernameQuery(
  username: string | undefined,
  options?: Options,
): UseQueryResult<QueryFnData, QueryError> {
  const token = getToken();
  const { enabled: optionsEnabled, ...restOptions } = options ?? {};
  const enabled = Boolean(token) && Boolean(username) && (optionsEnabled ?? true);

  return useQuery({
    queryKey: userKeys.profile(String(username ?? 'unknown')),
    queryFn: () => getMasterByUsername(username as string),
    enabled,
    ...restOptions,
  });
}
