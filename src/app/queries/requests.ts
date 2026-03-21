export const requestKeys = {
  all: ['requests'] as const,
  client: () => [...requestKeys.all, 'client'] as const,
  clientAll: () => [...requestKeys.all, 'client', 'all'] as const,
  contractorOrders: () => [...requestKeys.all, 'contractor-orders'] as const,
  detail: (id: string | number) => [...requestKeys.all, 'detail', id] as const,
};

export type ClientRequestsQueryKey = ReturnType<typeof requestKeys.client>;
export type ClientAllRequestsQueryKey = ReturnType<typeof requestKeys.clientAll>;
export type ContractorOrdersQueryKey = ReturnType<typeof requestKeys.contractorOrders>;
export type RequestDetailQueryKey = ReturnType<typeof requestKeys.detail>;
