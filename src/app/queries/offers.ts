export type OfferRequestId = string & { readonly __brand: unique symbol };

export const normalizeOfferRequestId = (
  requestId: string | number,
): OfferRequestId => String(requestId) as OfferRequestId;

export const normalizeOptionalOfferRequestId = (
  requestId: string | number | null | undefined,
): OfferRequestId | undefined => {
  if (requestId === null || requestId === undefined) {
    return undefined;
  }

  return normalizeOfferRequestId(requestId);
};

export const UNKNOWN_OFFER_REQUEST_ID = normalizeOfferRequestId('unknown');

export const offerKeys = {
  all: ['offers'] as const,
  list: (requestId: OfferRequestId) => [...offerKeys.all, 'list', requestId] as const,
};

export type OffersQueryKey = ReturnType<typeof offerKeys.list>;
