import { useMemo } from 'react';
import { QueryClient, UseQueryResult, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import CONFIG from '../constants';
import { getToken, setToken, clearToken } from './auth';
import { fileToBase64 } from '../shared/lib/utilities';
import {
  LoginType, UserUpdateData, RegisterUserData, RegisterResult,  // типы
  login as apiLogin, logout as apiLogout, // loginByVerificationCode,  // функции
  registerAsClient as apiRegisterAsClient, registerAsContractor as apiRegisterAsContractor,
  getUserData, updateUser as apiUpdateUser, updateUserDetails as apiUpdateUserDetails,
  updatePassword as apiUpdatePassword, recoverPassword as apiRecoverPassword
} from './api/user';

/**
 * Ключи для кэширования данных пользователя в React Query.
 */
const USER_QUERY_KEY = {
  /** Базовые данные пользователя */
  baseData: 'basic',
  /** Полные данные пользователя */
  extraData: 'extra',
};

/**
 * Пустой объект, используемый по умолчанию для предотвращения ошибок доступа к свойствам.
 */
const EMPTY_OBJECT = {};

/**
 * Роли пользователей в системе.
 */
export enum UserRole {
  /** Клиент */
  Client = 1,
  /** Мастер */
  Contractor = 2
};

/**
 * Базовые данные пользователя.
 */
export interface UserBaseData {
  /** Идентификатор пользователя. */
  id: number;
  /** Имя пользователя. */
  name: string;
  /** Фамилия пользователя. */
  lastname: string;
  /** E-mail пользователя. */
  email: string;
  /** Телефон пользователя. */
  phone: string;
  /** Роль пользователя. */
  role: UserRole;
  /** Аватар пользователя (URL). */
  avatar: string;
  /** Язык пользователя. */
  language: string;
  /** Валюта пользователя. */
  currency: string;
}

/**
 * Дополнительные данные пользователя.
 */
interface UserExtraData {
  /** Проверен ли номер телефона. */
  isPhoneVerified: boolean;
  /** Проверен ли e-mail. */
  isEmailVerified: boolean;
  /** Описание пользователя. */
  description: string;
  /** Местоположение (город) пользователя. */
  locality: string;
  /** Произвольные дополнительные детали пользователя. */
  details: Record<string, unknown>;
}

/**
 * Полный объект данных пользователя, объединяющий базовые и дополнительные данные.
 */
export type UserExtendedData = UserBaseData & UserExtraData;

/**
 * Полный объект данных пользователя, включающий базовые и дополнительные данные.
 */
interface UserProfile {
  /** Базовые данные пользователя. */
  baseData: UserBaseData;
  /** Дополнительные данные пользователя. */
  extraData: UserExtraData;
}

let currentFetch: Promise<UserProfile | {}> | null = null;
/**
 * Загружает полные данные пользователя из API.
 * @param client Объект с клиентским контекстом (например, QueryClient).
 * @returns Промис, который разрешается с объектом UserProfile или пустым объектом,
 *          если пользователь не авторизован или данные не найдены.
 * @throws {Error} Если произошла ошибка при запросе к API.
 */
function fetchUser({ client }): Promise<UserProfile | {}> {
  const token = getToken();
  if (!token) return Promise.resolve({});

  if (!currentFetch) currentFetch = new Promise(async (resolve, reject) => {
    try {
      const result = await getUserData();
      if (!result) {
        resolve({});
        return;
      }
      const baseData: UserBaseData = {
        id: Number( result.u_id ),
        name: result.u_name && result.u_middle ? `${result.u_name} ${result.u_middle}` : String(result.u_name || result.u_middle || ''),
        lastname: String(result.u_family || ''),
        email: String(result.u_email || ''),
        phone: String(result.u_phone || ''),
        role: result.u_role === '2' ? UserRole.Contractor : UserRole.Client,
        avatar: String(result.u_photo || ''),
        language: String(result.u_lang || CONFIG.APP.language || ''),
        currency: String(result.u_currency || '')
      };
      const extraData: UserExtraData = {
        isPhoneVerified: Number( result.u_phone_checked ) === 1,
        isEmailVerified: Number( result.u_email_checked) === 1,
        description: String(result.u_description || ''),
        locality: String(result.u_city || ''),
        details: result.u_details && result.u_details instanceof Object ? result.u_details : {}
      };
      resolve({ baseData, extraData });
    }
    catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)));
    }
    finally {
      currentFetch = null;
    }
  });
  return currentFetch;
}

/**
 * Загружает только базовые данные пользователя и синхронизирует расширенные данные в кэше.
 * Использует `fetchUser` для получения полных данных, но возвращает только `baseData`.
 * @param client Клиент React Query.
 * @returns Промис, который разрешается с объектом UserBaseData или пустым объектом.
 */
async function fetchUserBase({ client }): Promise<UserBaseData | {}> {
  const result = await fetchUser({ client });
  // @ ts-ignore
  client.setQueryData([ 'user', USER_QUERY_KEY.extraData ], 'extraData' in result && result.extraData ? result.extraData : {});
  return 'baseData' in result && result.baseData ? result.baseData : {};
}

/**
 * Загружает расширенные данные пользователя и синхронизирует базовые данные в кэше.
 * Использует `fetchUser` для получения полных данных, но возвращает только `extraData`.
 * @param client Клиент React Query.
 * @returns Промис, который разрешается с объектом UserExtraData или пустым объектом.
 */
async function fetchUserExtra({ client }): Promise<UserExtraData | {}> {
  const result = await fetchUser({ client });
  // @ts-ignore
  client.setQueryData([ 'user', USER_QUERY_KEY.baseData ], 'baseData' in result && result.baseData ? result.baseData : {});
  return 'extraData' in result && result.extraData ? result.extraData : {};
}

/**
 * Хук для получения базовых данных текущего пользователя.
 * @returns Объект с состоянием запроса React Query и объектом `user`, содержащим базовые данные.
 */
export function useUser():
  UseQueryResult<Awaited<UserBaseData | {}>, unknown> &
  { user: UserBaseData | {} }
{
  const queryResult = useQuery({
    queryKey: [ 'user', USER_QUERY_KEY.baseData ],
    queryFn: fetchUserBase,
    staleTime: CONFIG.API.userDataStaleTime || Infinity
  });

  return {
    ...queryResult,
    user: queryResult.data || EMPTY_OBJECT
  };
}

/**
 * Хук для получения полных данных текущего пользователя (базовые и дополнительные).
 * @returns Объект с состоянием запроса React Query и объектотм `userEx` (полные данные пользователя).
 */
export function useUserExtended():
  UseQueryResult<Awaited<UserExtraData | {}>, unknown> &
  { userEx: UserExtendedData | {} }
{
  const queryResult = useQuery({
    queryKey: [ 'user', USER_QUERY_KEY.extraData ],
    queryFn: fetchUserExtra,
    staleTime: CONFIG.API.userDataStaleTime || Infinity
  });
  const queryClient = useQueryClient();
  const userBase =
    (queryResult.data && queryClient.getQueryData<UserBaseData>([ 'user', USER_QUERY_KEY.baseData ])) ||
    EMPTY_OBJECT;

  const userEx = useMemo<UserExtendedData | {}>(() => ({
      ...userBase,
      ...(queryResult.data || {})
    }),
    [userBase, queryResult.data]
  );

  return {
    ...queryResult,
    userEx
  };
}

/**
 * Выполняет вход пользователя в систему и сохраняет токен.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param loginValue Логин пользователя (телефон или e-mail).
 * @param password Пароль пользователя.
 * @param keepAuthorized Флаг, указывающий, нужно ли сохранять токен в localStorage.
 * @returns Промис, который разрешается при успешной аутентификации.
 */
export async function login(
  queryClient: QueryClient,
  loginValue: string,
  password: string,
  keepAuthorized: boolean
): Promise<void> {
  try {
    const loginType: LoginType = loginValue.includes('@') ? 'e-mail' : 'phone';
    const authResult = await apiLogin(loginValue, password, loginType);

    if (
      !authResult.token || !authResult.u_hash ||
      'string' !== typeof authResult.token || 'string' !== typeof authResult.u_hash
    ) {
      throw new Error('Login failed: token or user hash is missing.');
    }

    setToken({ token: authResult.token, u_hash: authResult.u_hash }, keepAuthorized);

    queryClient.invalidateQueries({ queryKey: ['user'] });

    // Заполняем базовые данные пользователя в кэше, если auth_user присутствует
    if (authResult.auth_user) {
      const baseData: UserBaseData = {
        id: Number(authResult.auth_user.u_id),
        name: authResult.auth_user.u_name && authResult.auth_user.u_middle ?
          `${authResult.auth_user.u_name} ${authResult.auth_user.u_middle}` :
          String(authResult.auth_user.u_name || authResult.auth_user.u_middle || ''),
        lastname: String(authResult.auth_user.u_family || ''),
        email: String(authResult.auth_user.u_email || ''),
        phone: String(authResult.auth_user.u_phone || ''),
        role: authResult.auth_user.u_role === '2' ? UserRole.Contractor : UserRole.Client,
        avatar: String(authResult.auth_user.u_photo || ''),
        language: String(authResult.auth_user.u_lang || CONFIG.APP.language || ''),
        currency: String(authResult.auth_user.u_currency || '')
      };
      queryClient.setQueryData(['user', USER_QUERY_KEY.baseData], baseData);
    }
  } catch (error) {
    clearToken();
    queryClient.invalidateQueries({ queryKey: ['user'] }); // Очищаем кэш и при ошибке
    throw error;
  }
}

/**
 * Выполняет выход пользователя из системы и очищает токен.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @returns Промис, который разрешается после успешного выхода.
 */
export async function logout(queryClient: QueryClient): Promise<void> {
  try {
    await apiLogout(); // Вызов API функции выхода
  } catch (error) {
    console.error('Logout API call failed, but clearing token anyway:', error);
  } finally {
    clearToken();
    queryClient.invalidateQueries({ queryKey: ['user'] }); // Очищаем кэш пользователя
  }
}

/**
 * Хук для выполнения входа пользователя.
 * Использует функцию `login` в качестве mutationFn.
 * В случае успеха:
 * - Запоминает токен с помощью setToken (уже внутри `login`).
 * - Очищает все данные пользователя в кэше react-query (ключ ['user']).
 * - Сразу же заполняет базовые данные пользователя значениями, переданными при авторизации.
 * В случае неудачи:
 * - Очищает все данные пользователя и сбрасывает токен с помощью clearToken (уже внутри `login`).
 * - Очищает все данные пользователя в кэше react-query.
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loginValue, password, keepAuthorized }: { loginValue: string; password: string; keepAuthorized: boolean }) =>
      login(queryClient, loginValue, password, keepAuthorized),
  });
}

/**
 * Данные для регистрации нового пользователя.
 */
export interface RegisterPayload {
  name: string;
  lastname: string;
  phone: string;
  email: string;
  password: string;
  details?: Record<string, unknown>; // Дополнительные детали, только для мастера
  keepAuthorized: boolean;
}

/**
 * Регистрирует нового пользователя как клиента.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param payload Объект с данными для регистрации.
 * @returns Промис, который разрешается после успешной регистрации.
 */
/**
 * Вспомогательная функция для регистрации нового пользователя.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param payload Объект с данными для регистрации.
 * @param registerApiFn Функция API для регистрации (клиента или мастера).
 * @param role Роль пользователя (клиент или мастер).
 * @returns Промис, который разрешается после успешной регистрации.
 */
async function _registerUser(
  queryClient: QueryClient,
  payload: RegisterPayload,
  registerApiFn: (registerData: RegisterUserData) => Promise<RegisterResult>,
  role: UserRole
): Promise<void> {
  const { name, lastname, phone, email, password, details, keepAuthorized } = payload;
  const u_name = `${name.trim()} ${lastname.trim()}`.trim();
  const u_phone = phone.trim();
  const u_email = email.trim();

  if (!u_phone && !u_email) {
    throw new Error("Phone number or email address must be specified.");
  }

  const registerData: RegisterUserData = {
    u_name,
    u_phone,
    u_email,
    password,
  };
  if (role === UserRole.Contractor && details) {
    registerData.u_details = details;
  }

  const result = await registerApiFn(registerData);
  if (!result.token || !result.u_hash) {
    throw new Error('Registration failed: token or user hash is missing.');
  }
  setToken({ token: result.token, u_hash: result.u_hash }, keepAuthorized);
  queryClient.invalidateQueries({ queryKey: ['user'] });
}

/**
 * Регистрирует нового пользователя как клиента.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param payload Объект с данными для регистрации.
 * @returns Промис, который разрешается после успешной регистрации.
 */
export async function registerClient(queryClient: QueryClient, payload: RegisterPayload): Promise<void> {
  return _registerUser(queryClient, payload, apiRegisterAsClient, UserRole.Client);
}

/**
 * Хук для регистрации нового пользователя как клиента.
 */
export function useRegisterClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerClient(queryClient, payload),
  });
}

/**
 * Регистрирует нового пользователя как мастера.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param payload Объект с данными для регистрации.
 * @returns Промис, который разрешается после успешной регистрации.
 */
export async function registerContractor(queryClient: QueryClient, payload: RegisterPayload): Promise<void> {
  return _registerUser(queryClient, payload, apiRegisterAsContractor, UserRole.Contractor);
}

/**
 * Хук для регистрации нового пользователя как мастера.
 */
export function useRegisterContractor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => registerContractor(queryClient, payload),
  });
}

/**
 * Опции для обновления профиля пользователя.
 * Поля здесь соответствуют логическим полям из UserBaseData и UserExtraData.
 * Все поля являются опциональными; будут обновлены только те, которые присутствуют.
 */
export interface UserUpdatePayload {
  name?: string;
  lastname?: string;
  phone?: string;
  email?: string;
  language?: string;
  currency?: string;
  description?: string;
}

/**
 * Обновляет основные данные профиля пользователя.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param payload Объект с данными для обновления, использующий логические имена полей.
 * @returns Промис, который разрешается после успешного обновления.
 */
export async function updateUser(queryClient: QueryClient, payload: UserUpdatePayload): Promise<void> {
  // todo: Может быть, добавить полную проверку для phone, email, language, currency
  const apiUserData: UserUpdateData = {};

  if (payload.name !== undefined) {
    const name = payload.name.trim();
    [ apiUserData.u_name, apiUserData.u_middle ] = name.split(/\s+(.*)/, 2);
    apiUserData.u_middle ||= '';
  }
  if (payload.lastname !== undefined) {
    const lastname = payload.lastname.trim();
    apiUserData.u_family = lastname;
  }
  if (payload.phone !== undefined) {
    const phone = payload.phone.trim();
    apiUserData.u_phone = phone;
  }
  if (payload.email !== undefined) {
    const email = payload.email.trim();
    apiUserData.u_email = email;
  }
  if (payload.language !== undefined) {
    const language = payload.language.trim();
    apiUserData.u_lang = language;
  }
  if (payload.currency !== undefined) {
    const currency = payload.currency.trim();
    apiUserData.u_currency = currency;
  }
  if (payload.description !== undefined) {
    const description = payload.description.trim();
    apiUserData.u_description = description;
  }

  await apiUpdateUser(apiUserData);
  queryClient.invalidateQueries({ queryKey: ['user'] });
}

/**
 * Хук для обновления основных данных профиля пользователя.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserUpdatePayload) => updateUser(queryClient, payload),
  });
}

/**
 * Обновляет фотографию профиля пользователя.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param photoFile Объект File для новой фотографии.
 * @returns Промис, который разрешается после успешного обновления.
 */
export async function updateUserAvatar(queryClient: QueryClient, photoFile: File): Promise<void> {
  const base64Photo = await fileToBase64(photoFile);
  await apiUpdateUser({ u_photo: base64Photo });
  queryClient.invalidateQueries({ queryKey: ['user'] });
}

/**
 * Хук для обновления фотографии профиля пользователя.
 */
export function useUpdateUserAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photoFile: File) => updateUserAvatar(queryClient, photoFile),
  });
}

/**
 * Обновляет дополнительные детали профиля пользователя.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param details Объект с дополнительными деталями пользователя.
 * @returns Промис, который разрешается после успешного обновления.
 */
export async function updateUserDetails(queryClient: QueryClient, details: Record<string, unknown>): Promise<void> {
  await apiUpdateUserDetails(details);
  queryClient.invalidateQueries({ queryKey: ['user'] });
}

/**
 * Хук для обновления дополнительных деталей профиля пользователя.
 */
export function useUpdateUserDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (details: Record<string, unknown>) => updateUserDetails(queryClient, details),
  });
}

/**
 * Обновляет пароль пользователя.
 * @param oldPassword Текущий пароль.
 * @param newPassword Новый пароль.
 * @returns Промис, который разрешается после успешного обновления.
 */
export async function updateUserPassword(oldPassword: string, newPassword: string): Promise<void> {
  await apiUpdatePassword(oldPassword, newPassword);
}

/**
 * Хук для обновления пароля пользователя.
 */
export function useUpdateUserPassword() {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      updateUserPassword(oldPassword, newPassword),
  });
}

/**
 * Инициирует процесс восстановления пароля.
 * @param loginValue Логин пользователя (телефон или e-mail).
 * @returns Промис, который разрешается после успешной отправки запроса.
 */
export async function recoverPassword(loginValue: string): Promise<void> {
  const loginType: LoginType = loginValue.includes('@') ? 'e-mail' : 'phone';
  await apiRecoverPassword(loginValue, loginType);
}

/**
 * Хук для инициирования процесса восстановления пароля.
 */
export function usePasswordRecovery() {
  return useMutation({
    mutationFn: (loginValue: string) => recoverPassword(loginValue),
  });
}
