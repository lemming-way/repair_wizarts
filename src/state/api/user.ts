/**
 * Модуль api для работы с пользователями и аутентификацией
 *
 * @summary
 * **Типы:**
 * LoginType, UserData, UserUpdateData, RegisterUserData, RegisterResult
 *
 * **Авторизация:**
 * login, logout, loginByVerificationCode
 *
 * **Получение данных:**
 * getAuthUser, getUsers
 *
 * **Изменение данных:**
 * updateUser, registerAsClient, registerAsContractor, updatePassword
 *
 * **Вспомогательные функции:**
 * recoverPassword, sendVerification
 */

import { post, postNoAuth, authWithAuthUser } from './request';
import { AuthToken } from '../auth';

/**
 * Тип логина: по телефону или по e-mail.
 */
export type LoginType = 'phone' | 'e-mail';

/**
 * Информация о блокировке пользователя.
 */
export type UserBanInfo = {
    /** Число активных банов на авторизацию */
    auth?: string | null;
    /** Число активных банов на создание или получения поездки */
    order?: string | null;
    /** Число активных банов на создание темы в блоге */
    blog_topic?: string | null;
    /** Число активных банов на создание сообщения в чужой теме */
    blog_post?: string | null;
};

/**
 * Расширенная информация о пользователе.
 */
export type UserData = {
  /** ID пользователя */
  u_id?: string;
  /** Имя пользователя */
  u_name?: string;
  /** Фамилия пользователя */
  u_family?: string;
  /** Отчество или второе имя */
  u_middle?: string;
  /** Электронная почта */
  u_email?: string;
  /** Номер телефона */
  u_phone?: string | null;
  /** ID роли пользователя в системе */
  u_role?: string;
  /** ID статуса проверки пользователя администратором */
  u_check_state?: string | null;
  /** Блокировки пользователя */
  u_ban?: UserBanInfo;
  /** Исполнитель готов выполнять заказы */
  u_active?: 0 | 1;
  /** Ссылка на фото */
  u_photo?: string;
  /** Дата рождения в формате ГГГГ-ММ-ДД */
  u_birthday?: string | null;
  /** ID языка пользователя в данных сайта (числовой, не символьный код ISO) */
  u_lang?: string | null;
  /** Трёхбуквенный код выбранной валюты пользователя */
  u_currency?: string | null;
  /** Проверен ли номер телефона (0 - нет, 1 - да). */
  u_phone_checked?: 0 | 1;
  /** Проверен ли e-mail (0 - нет, 1 - да). */
  u_email_checked?: '0' | '1';
  /** Город пользователя. */
  u_city?: string | null;
  /** Описание пользователя. */
  u_description?: string;
  /** Дополнительные детали пользователя. */
  u_details?: Record<string, unknown> | null;
  /** Комментарии к заказам из списка data.booking_comments. */
  b_comments?: string[] | null;
  /** Дополнительные услуги из data.services. */
  b_services?: string[] | null;
  /** Типы дальности поездки из data.booking_location_classes. */
  b_location_classes?: Array<{ b_location_class: string; basic: '0' | '1' }> | null;
  /** Дополнительные свойства. */
  props?: Record<string, Array<unknown>>;
}

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
): Promise<AuthToken & { auth_user?: UserData }> {
  if (type !== 'e-mail' && type !== 'phone') type = 'phone';

  const normalizedLogin = normalizeLogin(login, type);

  const { auth_hash } = await postNoAuth<{ auth_hash: string }>('auth', {
    login: normalizedLogin,
    password,
    type,
  });

  const authResult = await authWithAuthUser<AuthToken>('token', { auth_hash });
  if (authResult.auth_user && 'object' !== typeof authResult.auth_user) delete authResult.auth_user;
  return authResult as AuthToken & { auth_user?: UserData };
}

/**
 * Выполняет выход пользователя из системы.
 * @returns Промис, который разрешается после успешного выхода.
 */
export function logout(): Promise<void> {
  return post<void>('auth/logout');
}

/**
 * Получает подробную информацию об авторизованном пользователе.
 * @returns Промис, который разрешается с объектом UserData или пустой объект, если данные не найдены.
 */
export async function getAuthUser(): Promise<UserData> {
  const result = await post<{ user?: Record<string, UserData>; auth_user?: { u_id?: unknown } }>('user/authorized');
  const uid = 'string' === typeof result.auth_user?.u_id || 'number' === typeof result.auth_user?.u_id ? result.auth_user.u_id : undefined;
  if (uid && result.user?.[uid]) return result.user[uid];
  else return {};
}

/**
 * Получает подробную информацию о пользователях по их ID.
 * @param userIds Массив ID пользователей
 * @returns Промис, который разрешается со списком UserData или пустой объект, если данные не найдены.
 */
export async function getUsers(userIds: number[]): Promise<Record<string, UserData>> {
  if (!userIds.length) return {};
  const result = await post<{ user?: Record<string, UserData> }>(`user/${userIds}`);
  if ('object' === typeof result.user && !result.user === null) return result.user;
  else return {};
}

/**
 * Данные для обновления профиля пользователя.
 */
export type UserUpdateData = {
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
  /** Город пользователя. */
  u_city?: number | null;  // Работает только для неподтверждённого водителя
  /** Описание пользователя. */
  u_description?: string;  // Работает только для неподтверждённого водителя
  /** Дополнительные детали пользователя. */
  u_details?: Record<string, unknown>;
}

/**
 * Обновляет профиль пользователя.
 * @param userData Объект с данными для обновления.
 * @param userTemporaryRole Временная роль пользователя при выполнении запроса
 * @returns Промис, который разрешается после успешного обновления.
 */
export function updateUser(userData: UserUpdateData, userTemporaryRole?: 1 | 2): Promise<void> {
  const { u_details, ...rest } = userData;
  const formattedData: Record<string, unknown> = rest;

  if (u_details) {
    const formattedDetails = Object.entries(u_details).map(([key, value]) => {
      if (value === undefined) value = null;
      return ['=', [key], value];
    });

    formattedData.u_details = formattedDetails;
  }

  return post<void>('user', { data: formattedData });
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
): Promise<AuthToken & { auth_user?: UserData }> {
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

  const authResult = await authWithAuthUser<AuthToken>('token', { auth_hash });
  if (authResult.auth_user && 'object' !== typeof authResult.auth_user) delete authResult.auth_user;
  return authResult as AuthToken & { auth_user?: UserData };
}

/**
 * Данные для регистрации нового пользователя.
 */
export type RegisterUserData = {
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
export type RegisterResult = {
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
  const payload: Record<string, unknown> = {
    u_name: userData.u_name,
    data: { password: userData.password },
    u_role: 1,
    st: true,
  };
  if (userData.u_phone) payload.u_phone = userData.u_phone;
  if (userData.u_email) payload.u_email = userData.u_email;

  return postNoAuth<RegisterResult>('register', payload);
}

/**
 * Регистрирует нового пользователя как мастера.
 * Требует либо `u_phone`, либо `u_email`, а также `password`.
 * @param userData Объект с данными для регистрации.
 * @returns Промис, который разрешается с результатом регистрации.
 */
export function registerAsContractor(userData: RegisterUserData): Promise<RegisterResult> {
  if (!userData.u_phone && !userData.u_email) {
    return Promise.reject(
      new Error("The user's email address OR phone number should be specified.")
    );
  }
  if (!userData.password) {
    return Promise.reject(new Error('The password should be specified.'));
  }
  const data: Record<string, unknown> = { password: userData.password };
  if ('object' === typeof userData.u_details && userData.u_details !== null) {
    data.u_details = userData.u_details;
  }
  const payload: Record<string, unknown> = {
    u_name: userData.u_name,
    data,
    u_role: 2,
    st: true,
  };
  if (userData.u_phone) payload.u_phone = userData.u_phone;
  if (userData.u_email) payload.u_email = userData.u_email;

  return postNoAuth<RegisterResult>('register', payload);
}
