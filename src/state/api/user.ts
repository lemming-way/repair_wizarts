import { post, postNoAuth, authWithAuthUser, AuthUser } from './request';
import { AuthToken } from '../auth';

// Types:
// LoginType, UserDetails, UserUpdateData, RegisterUserData, RegisterResult

// Functions:
// login, logout, getUserDetails, updateUser, updateUserDetails
// loginByVerificationCode, registerAsClient, registerAsMaster

// Не влияют на state:
// updatePassword, recoverPassword, sendVerification

/**
 * Тип логина: по телефону или по e-mail.
 */
export type LoginType = 'phone' | 'e-mail';

/**
 * Нормализует строку логина в зависимости от ее типа.
 * @param login Строка логина для нормализации.
 * @param type Тип логина ('phone' или 'e-mail').
 * @returns Нормализованная строка логина.
 */
function normalizeLogin(login: string, type: LoginType): string {
  const trimmed = login.trim();

  if (type === 'e-mail') {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');

  if (digits) {
    if (trimmed.startsWith('+')) return `+${digits}`;
    else return digits;
  }

  return '';
}

/**
 * Выполняет вход пользователя в систему.
 * @param login Логин пользователя (телефон или e-mail).
 * @param password Пароль пользователя.
 * @param type Тип логина ('phone' или 'e-mail', по умолчанию 'phone').
 * @returns Промис, который разрешается с результатом аутентификации и данными авторизованного пользователя.
 */
export async function login(
  login: string,
  password: string,
  type: LoginType = 'phone'
): Promise<AuthToken & { auth_user?: AuthUser }> {
  if (type !== 'e-mail' && type !== 'phone') type = 'phone';

  const normalizedLogin = normalizeLogin(login, type);

  const { auth_hash } = await postNoAuth<{ auth_hash: string }>('auth', {
    login: normalizedLogin,
    password,
    type,
  });

  return authWithAuthUser<AuthToken>('token', { auth_hash });
}

/**
 * Выполняет выход пользователя из системы.
 * @returns Промис, который разрешается после успешного выхода.
 */
export function logout(): Promise<void> {
  return post<void>('auth/logout');
}

/**
 * Расширенная информация о пользователе.
 */
export interface UserDetails extends AuthUser {
  /** Проверен ли номер телефона (0 - нет, 1 - да). */
  u_phone_checked: 0 | 1;
  /** Проверен ли e-mail (0 - нет, 1 - да). */
  u_email_checked: '0' | '1';
  /** Город пользователя. */
  u_city: string | null;
  /** Описание пользователя. */
  u_description: string;
  /** Дополнительные детали пользователя. */
  u_details: unknown;
  /** Комментарии к заказам из списка data.booking_comments. */
  b_comments: string[] | null;
  /** Дополнительные услуги из data.services. */
  b_services: string[] | null;
  /** Типы дальности поездки из data.booking_location_classes. */
  b_location_classes: Array<{ b_location_class: string; basic: '0' | '1' }> | null;
  /** Дополнительные свойства. */
  props?: Record<string, Array<unknown>>;
}

/**
 * Получает подробную информацию об авторизованном пользователе.
 * @returns Промис, который разрешается с объектом UserDetails или undefined, если данные не найдены.
 */
export async function getUserDetails(): Promise<UserDetails | undefined> {
  const result = await post<{ user?: Record<string, UserDetails>; auth_user?: AuthUser }>('user/authorized');
  return result.user?.[result.auth_user?.u_id ?? ''];
}

/**
 * Данные для обновления профиля пользователя.
 */
export interface UserUpdateData {
  /** Имя пользователя. */
  u_name?: string;
  /** Отчество пользователя. */
  u_middle?: string;
  /** Фамилия пользователя. */
  u_family?: string;
  /** Номер телефона пользователя. */
  u_phone?: string;
  /** E-mail пользователя. */
  u_email?: string;
  /** Язык пользователя. */
  u_lang?: string;
  /** Фотография пользователя (изображение, закодированное в base64). */
  u_photo?: string;
  /** Валюта пользователя. */
  u_currency?: string;
  /** Описание пользователя. */
  u_description?: string;
}

/**
 * Обновляет основные данные профиля пользователя.
 * @param userData Объект с данными для обновления.
 * @returns Промис, который разрешается после успешного обновления.
 */
export function updateUser(userData: UserUpdateData): Promise<void> {
  return post<void>('user', { data: userData });
}

/**
 * Обновляет дополнительные детали профиля пользователя.
 * @param userDetails Объект с дополнительными деталями пользователя.
 * @returns Промис, который разрешается после успешного обновления.
 */
export function updateUserDetails(userDetails: Record<string, unknown>): Promise<void> {
  const formattedDetails = Object.entries(userDetails).map(([key, value]) => {
    if (value === undefined) value = null;
    return ['=', [key], value];
  });

  return post<void>('user', { data: { u_details: formattedDetails } });
}

/**
 * Обновляет пароль пользователя.
 * @param old_password Текущий пароль пользователя.
 * @param new_password Новый пароль пользователя.
 * @returns Промис, который разрешается после успешного обновления пароля.
 */
export function updatePassword(old_password: string, new_password: string): Promise<void> {
  return post<void>('newpass', { password: old_password, new_password });
}

/**
 * Инициирует процесс восстановления пароля.
 * @param login Логин пользователя (телефон или e-mail).
 * @param type Тип логина ('phone' или 'e-mail', по умолчанию 'phone').
 * @returns Промис, который разрешается после успешной отправки запроса на восстановление.
 */
export function recoverPassword(login: string, type: LoginType = 'phone'): Promise<void> {
  if (type !== 'e-mail' && type !== 'phone') type = 'phone';

  const normalizedLogin = normalizeLogin(login, type);
  const data = type === 'phone' ? { u_phone: normalizedLogin } : { u_email: normalizedLogin };
  return postNoAuth<void>('remind', data);
}

/**
 * Отправляет код верификации для указанного логина.
 * @param login Логин пользователя (телефон или e-mail).
 * @param type Тип логина ('phone' или 'e-mail', по умолчанию 'phone').
 * @returns Промис, который разрешается после успешной отправки кода.
 */
export function sendVerification(login: string, type: LoginType = 'phone'): Promise<void> {
  if (type !== 'e-mail' && type !== 'phone') type = 'phone';

  const normalizedLogin = normalizeLogin(login, type);
  return postNoAuth<void>('auth', { login: normalizedLogin, type: `${type}_code` });
}

/**
 * Выполняет вход пользователя в систему с использованием кода верификации.
 * @param login Логин пользователя (телефон или e-mail).
 * @param verificationCode Код верификации.
 * @param type Тип логина ('phone' или 'e-mail', по умолчанию 'phone').
 * @returns Промис, который разрешается с результатом аутентификации и данными авторизованного пользователя.
 */
export async function loginByVerificationCode(
  login: string,
  verificationCode: string,
  type: LoginType = 'phone'
): Promise<AuthToken & { auth_user?: AuthUser }> {
  if (!verificationCode) {
    return Promise.reject(new Error('Verification code must not be empty.'));
  }
  if (type !== 'e-mail' && type !== 'phone') type = 'phone';

  const normalizedLogin = normalizeLogin(login, type);
  const { auth_hash } = await postNoAuth<{ auth_hash: string }>('auth', {
    login: normalizedLogin,
    password: verificationCode,
    type: `${type}_code`,
  });

  return authWithAuthUser<AuthToken>('token', { auth_hash });
}

/**
 * Данные для регистрации нового пользователя.
 */
export interface RegisterUserData {
  /** Имя пользователя. */
  u_name: string;
  /** Номер телефона пользователя. */
  u_phone?: string;
  /** E-mail пользователя. */
  u_email?: string;
  /** Пароль пользователя. */
  password: string;
  /** Дополнительные детали пользователя. */
  u_details?: Record<string, unknown>;
}

/**
 * Результат успешной регистрации пользователя.
 */
export interface RegisterResult {
  /** Идентификатор пользователя. */
  u_id: string;
  /** Токен аутентификации. */
  token: string;
  /** Хэш пользователя. */
  u_hash: string;
}

/**
 * Регистрирует нового пользователя как клиента.
 * Требует либо `u_phone`, либо `u_email`, а также `password`.
 * @param userData Объект с данными для регистрации.
 * @returns Промис, который разрешается с результатом регистрации.
 */
export function registerAsClient(userData: RegisterUserData): Promise<RegisterResult> {
  if (!userData.u_phone && !userData.u_email) {
    return Promise.reject(
      new Error("The user's email address OR phone number should be specified.")
    );
  }
  if (!userData.password) {
    return Promise.reject(new Error('The password should be specified.'));
  }
  const data: Record<string, unknown> = {
    u_name: userData.u_name,
    data: { password: userData.password },
    u_role: 1,
    st: true,
  };
  if (userData.u_phone) data.u_phone = userData.u_phone;
  if (userData.u_email) data.u_email = userData.u_email;

  return postNoAuth<RegisterResult>('register', data);
}

/**
 * Регистрирует нового пользователя как мастера.
 * Требует либо `u_phone`, либо `u_email`, а также `password`.
 * @param userData Объект с данными для регистрации.
 * @returns Промис, который разрешается с результатом регистрации.
 */
export function registerAsMaster(userData: RegisterUserData): Promise<RegisterResult> {
  if (!userData.u_phone && !userData.u_email) {
    return Promise.reject(
      new Error("The user's email address OR phone number should be specified.")
    );
  }
  if (!userData.password) {
    return Promise.reject(new Error('The password should be specified.'));
  }
  const details: Record<string, unknown> = { password: userData.password };
  if ('object' === typeof userData.u_details && userData.u_details !== null) {
    details.u_details = userData.u_details;
  }
  const data: Record<string, unknown> = {
    u_name: userData.u_name,
    data: details,
    u_role: 2,
    st: true,
  };
  if (userData.u_phone) data.u_phone = userData.u_phone;
  if (userData.u_email) data.u_email = userData.u_email;

  return postNoAuth<RegisterResult>('register', data);
}
