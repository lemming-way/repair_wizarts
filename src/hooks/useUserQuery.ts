import { useMemo } from 'react';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import { getUser } from '../services/user.service';
import { getToken } from '../services/token.service';
import { userKeys } from '../queries';

type QueryFnData = Awaited<ReturnType<typeof getUser>>;
type QueryError = unknown;

type Options = Omit<UseQueryOptions<QueryFnData, QueryError>, 'queryKey' | 'queryFn'>;

type UserRecord = Record<string, unknown>;

type Result = UseQueryResult<QueryFnData, QueryError> & {
  user: UserRecord;
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

  const user = useMemo<UserRecord>(() => {
    const rawUser = (queryResult.data as QueryFnData | undefined)?.data?.user;

    if (!rawUser) {
      return {};
    }

    const [resolvedUser] = Object.values(rawUser);

    if (!resolvedUser || typeof resolvedUser !== 'object') {
      return {};
    }

    return resolvedUser as UserRecord;
  }, [queryResult.data]);

  return {
    ...queryResult,
    user,
  };
}
