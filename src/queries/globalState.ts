export const globalStateKeys = {
  all: ['global-state'] as const,
  item: (key: string) => [...globalStateKeys.all, key] as const,
};

export type GlobalStateQueryKey = ReturnType<typeof globalStateKeys.item>;
