import { api } from '../client';
import type { Result } from '../types';

export type LoginPayload = { username: string; password: string; type?: 'phone' | 'email' };
export type AuthHashResponse = { auth_hash: string };
export type TokenResponse = { data: { token: string; u_hash: string } };

export async function login(username: string, password: string, type: 'phone' | 'email' = 'phone'): Promise<Result<TokenResponse>> {
  const normalizeLogin = (username: string, type: 'phone' | 'email') => {
    if (type === 'email') {
      return username.trim();
    }

    const trimmed = username.trim();
    const digits = trimmed.replace(/\D/g, '');

    if (!digits) {
      return '';
    }

    if (trimmed.startsWith('+')) {
      return `+${digits}`;
    }

    return digits;
  };

  const normalizedLogin = normalizeLogin(username, type);

  // First get auth hash
  const authResult = await api.post<AuthHashResponse>('/auth/', {
    login: normalizedLogin,
    password,
    type,
  });

  if (!authResult.ok) {
    return authResult;
  }

  // Then get token with auth hash
  return api.post<TokenResponse>('/token/', { auth_hash: authResult.data.auth_hash });
}

export async function logout(): Promise<Result<void>> {
  return api.post<void>('/auth/logout');
}
