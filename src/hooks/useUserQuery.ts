import { useMemo } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import { getUser } from '../services/user.service';
import { getToken } from '../services/token.service';
import { userKeys } from '../queries';

type QueryFnData = Awaited<ReturnType<typeof getUser>>;
type QueryError = unknown;

type Options = Omit<UseQueryOptions<QueryFnData, QueryError>, 'queryKey' | 'queryFn'>;

type Result = UseQueryResult<QueryFnData, QueryError> & {
  user?: Record<string, any> | undefined;
};

export function useUserQuery(options?: Options): Result {
  const token = getToken();
  const { enabled: optionsEnabled, ...restOptions } = options ?? {};
  const enabled = Boolean(token) && (optionsEnabled ?? true);

  const queryResult = useQuery({
    queryKey: userKeys.authorized(),
    queryFn: getUser,
    enabled,
    ...restOptions,
  });

  const user = useMemo(() => {
    const rawUser = (queryResult.data as QueryFnData | undefined)?.data?.user;

    if (!rawUser) {
      return undefined;
    }

    const [resolvedUser] = Object.values(rawUser);

    return resolvedUser as Record<string, any> | undefined;
  }, [queryResult.data]);

  return {
    ...queryResult,
    user,
  };
}
