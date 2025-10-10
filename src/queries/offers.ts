export const offerKeys = {
  all: ['offers'] as const,
  list: (requestId: string | number) => [...offerKeys.all, 'list', requestId] as const,
};

export type OffersQueryKey = ReturnType<typeof offerKeys.list>;
