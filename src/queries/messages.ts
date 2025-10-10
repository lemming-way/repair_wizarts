export const messageKeys = {
  all: ['messages'] as const,
  unread: () => [...messageKeys.all, 'unread'] as const,
};

export type MessagesQueryKey = ReturnType<typeof messageKeys.unread>;
