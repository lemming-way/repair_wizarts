export const userKeys = {
  all: ['user'] as const,
  authorized: () => [...userKeys.all, 'authorized'] as const,
  profile: (username: string) => [...userKeys.all, 'profile', username] as const,
};

export type UserQueryKey = ReturnType<typeof userKeys.authorized>;
export type UserProfileQueryKey = ReturnType<typeof userKeys.profile>;
