import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import { getToken } from '../services/token.service';
import { getUserUnreadMessages } from '../services/user.service';
import { messageKeys } from '../queries';

type QueryFnData = Awaited<ReturnType<typeof getUserUnreadMessages>>;
type QueryError = unknown;

type Options = Omit<
  UseQueryOptions<QueryFnData, QueryError, QueryFnData, ReturnType<typeof messageKeys.unread>>,
  'queryKey' | 'queryFn'
>;

type Result = UseQueryResult<QueryFnData, QueryError> & {
  unreadMessages: QueryFnData | undefined;
  unreadCount: number;
};

export function useUnreadMessagesQuery(options?: Options): Result {
  const token = getToken();
  const { enabled: optionsEnabled, ...restOptions } = options ?? {};
  const enabled = Boolean(token) && (optionsEnabled ?? true);

  const queryResult = useQuery({
    queryKey: messageKeys.unread(),
    queryFn: getUserUnreadMessages,
    enabled,
    ...restOptions,
  });

  const dialogs = Array.isArray(queryResult.data) ? queryResult.data : [];
  const unreadCount = dialogs.reduce((total, dialog: any) => {
    const messages = Array.isArray(dialog?.messages) ? dialog.messages.length : 0;

    return total + messages;
  }, 0);

  return {
    ...queryResult,
    unreadMessages: dialogs,
    unreadCount,
  };
}
