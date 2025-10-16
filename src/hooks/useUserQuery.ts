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

const EMPTY_OBJECT: UserRecord = {};

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

  const data = queryResult.data as QueryFnData | undefined;
  const userId = data?.auth_user?.u_id;
  const userMap = data?.data?.user;
  const resolvedUser =
    userId && userMap && typeof userMap === 'object'
      ? (userMap as Record<string, unknown>)[userId]
      : undefined;
  const user =
    resolvedUser !== undefined && typeof resolvedUser === 'object'
      ? (resolvedUser as UserRecord)
      : EMPTY_OBJECT;

  return {
    ...queryResult,
    user,
  };
}
