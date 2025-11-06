import { useMemo } from 'react';
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

  const { unreadMessages, unreadCount } = useMemo(() => {  // todo: перенести это в queryFn
    const dialogs = queryResult.data;

    if (!Array.isArray(dialogs)) {
      return { unreadMessages: dialogs, unreadCount: 0 };
    }

    const count = dialogs.reduce((total, dialog: any) => {
      const messages = Array.isArray(dialog?.messages)
        ? dialog.messages.length
        : 0;

      return total + messages;
    }, 0);

    return { unreadMessages: dialogs, unreadCount: count };
  }, [queryResult.data]);

  return {
    ...queryResult,
    unreadMessages,
    unreadCount,
  };
}
