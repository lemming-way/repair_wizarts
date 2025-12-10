export const serviceKeys = {
  all: ['services'] as const,
  contractor: (username: string) => [...serviceKeys.all, 'contractor', username] as const,
};

export type ServicesQueryKey = typeof serviceKeys.all;
export type ContractorServicesQueryKey = ReturnType<typeof serviceKeys.contractor>;
