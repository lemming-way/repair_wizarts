import { getToken } from '../../services/token.service';

type AuthParams = Record<string, string>;

export function getAuthParams(): AuthParams {
  const token = getToken();
  if (!token || typeof token !== 'object') {
    return {};
  }

  const accessToken =
    (token as Record<string, unknown>).access_token ??
    (token as Record<string, unknown>).token;
  const hash =
    (token as Record<string, unknown>).u_hash ??
    (token as Record<string, unknown>).hash;

  const params: AuthParams = {};

  if (typeof accessToken === 'string' && accessToken) {
    params.token = accessToken;
  }

  if (typeof hash === 'string' && hash) {
    params.u_hash = hash;
  }

  return params;
}

export async function maybeRefreshToken(_resp: Response): Promise<boolean> {
  // No-op in Task 1; to be implemented in Task 2 when backend flow is defined
  return false;
}
