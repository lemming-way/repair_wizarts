export const serviceKeys = {
  all: ['services'] as const,
  master: (username: string) => [...serviceKeys.all, 'master', username] as const,
};

export type ServicesQueryKey = typeof serviceKeys.all;
export type MasterServicesQueryKey = ReturnType<typeof serviceKeys.master>;
