export const userKeys = {
  all: ['user'] as const,
  authorized: () => [...userKeys.all, 'authorized'] as const,
};

export type UserQueryKey = ReturnType<typeof userKeys.authorized>;
