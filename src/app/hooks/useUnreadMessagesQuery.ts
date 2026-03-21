import { useMemo } from 'react';

// todo: В настоящий момент здесь просто заглушка. Нужно переписать или избавиться от этого хука

const queryResult = { data: [] };

export function useUnreadMessagesQuery() {
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
  }, []);

  return {
    ...queryResult,
    unreadMessages,
    unreadCount,
  };
}
