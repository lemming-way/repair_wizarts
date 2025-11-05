// todo: Избавиться от галлюцинаций ИИ
import { api } from '../client';
import type { Result } from '../types';

export type EmailVerificationResponse = {
  result: string;
  message?: string;
};

export type PhoneVerificationResponse = {
  result: string;
  message?: string;
};

export type EmailCodeVerificationResponse = {
  result: string;
  user_id?: number;
  email_verified?: boolean;
};

export type PhoneCodeVerificationResponse = {
  result: string;
  user_id?: number;
  phone_verified?: boolean;
};

export async function sendEmailVerification(): Promise<Result<EmailVerificationResponse>> {
  return api.post<EmailVerificationResponse>('email/verification/start');
}

export async function verifyEmailCode(code: string): Promise<Result<EmailCodeVerificationResponse>> {
  return api.get<EmailCodeVerificationResponse>(`email/verification/complete?ev_hash=${code}`);
}

export async function sendPhoneCode(phone: string): Promise<Result<PhoneVerificationResponse>> {
  return api.post<PhoneVerificationResponse>('/auth/', {
    type: 'phone_code',
    login: phone,
  });
}

export async function verifyPhoneCode(phone: string, code: string): Promise<Result<PhoneCodeVerificationResponse>> {
  const trimmedCode = code?.trim();

  if (!trimmedCode) {
    return Promise.resolve({
      ok: false,
      error: {
        status: 400,
        message: 'Verification code is required',
      },
    });
  }

  return api.post<PhoneCodeVerificationResponse>('/auth/', {
    type: 'phone_code',
    login: phone,
    password: trimmedCode,
  });
}
