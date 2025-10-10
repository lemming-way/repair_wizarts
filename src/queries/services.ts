export const serviceKeys = {
  all: ['services'] as const,
};

export type ServicesQueryKey = typeof serviceKeys.all;
