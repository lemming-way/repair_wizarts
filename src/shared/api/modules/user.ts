import { api } from '../client';
import type { Result } from '../types';

type BooleanLike = 0 | 1 | '0' | '1';

type UserBanInfo = {
  auth: number;
  order: number;
};

type AuthUser = {
  u_id: string;
  u_name: string;
  u_family: string;
  u_middle: string | null;
  u_email: string;
  u_phone: string;
  u_role: string | number;
  u_check_state: string | number;
  u_ban: UserBanInfo;
  u_active: BooleanLike;
  u_photo: string | null;
  u_birthday: string | null;
  u_lang: string | number;
  u_currency: string;
};

type UserDetails = AuthUser & {
  u_phone_checked: BooleanLike;
  u_email_checked: BooleanLike;
  u_city: string | number | null;
  u_description: string | null;
  u_details: unknown;
  b_comments: unknown;
  b_services: unknown;
  b_location_classes?: unknown;
  props?: Record<string, string[]>;
};

export type UserProfile = {
  auth_user: AuthUser;
  data: {
    user: Record<string, UserDetails>;
  };
};

export type UpdateProfilePayload = {
  name: string;
  lastname: string;
  phone: string;
  email: string;
  u_description?: string;
  details?: Record<string, any>;
};

export type UpdatePasswordPayload = {
  password: string;
  new_password: string;
};

export async function getProfile(): Promise<Result<UserProfile>> {
  return api.post<UserProfile>('user/authorized');
}

export async function updateProfile(data: UpdateProfilePayload): Promise<Result<UserProfile>> {
  const formattedDetails = Object.entries(data.details || {}).map(
    ([key, value]) =>
      value !== null || value !== undefined
        ? ['=', [key], value]
        : ['=', [key], []],
  );

  return api.post<UserProfile>('user', {
    data: JSON.stringify({
      u_name: data.name,
      u_family: data.lastname,
      u_phone: data.phone,
      u_email: data.email,
      u_description: data.u_description,
      ...(data.details ? { u_details: formattedDetails } : {}),
    }),
  });
}

export async function deleteAccount(): Promise<Result<void>> {
  const payload: Record<string, unknown> = {
    data: JSON.stringify({
      u_is_deleted: 1,
    }),
  };

  return api.post<void>('user', payload);
}

export async function updatePassword(data: UpdatePasswordPayload): Promise<Result<void>> {
  return api.post<void>('newpass', {
    password: data.password,
    new_password: data.new_password,
  });
}

export async function updateProfilePhoto(photo: string): Promise<Result<void>> {
  return api.post<void>('user', {
    data: JSON.stringify({
      u_photo: photo,
    }),
  });
}
