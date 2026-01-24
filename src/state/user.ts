/**
 * Модуль для работы с глобальным состоянием пользователей и аутентификацией
 *
 * @summary
 * **Типы данных:**
 * UserRole, UserProfile, RegisterPayload, UserUpdatePayload,
 *
 * **Функции, влияющие на глобальное состояние:**
 * useUser, useUsersByIds, login, logout, useLogin,
 * registerClient, useRegisterClient, registerContractor, useRegisterContractor,
 * updateUser, useUpdateUser, useUpdateUserAvatar, useUpdateUserDetails
 *
 * **Функции, не влияющие на глобальное состояние:**
 * updateUserPassword, useUpdateUserPassword, recoverPassword, usePasswordRecovery
 */
import {
  QueryClient, UseQueryResult, UseMutationResult,   // типы
  useQuery, useQueries, useMutation, useQueryClient   // хуки
} from '@tanstack/react-query';

import CONFIG from '../constants';
import { getToken, setToken, clearToken } from './auth';
import { fileToBase64 } from '../shared/lib/utilities';
import {
  LoginType, UserData as APIUserData, UserUpdateData, RegisterUserData, RegisterResult,  // типы
  login as apiLogin, logout as apiLogout, // loginByVerificationCode,  // функции
  registerAsClient as apiRegisterAsClient, registerAsContractor as apiRegisterAsContractor,
  getAuthUser, getUsers as apiGetUsers, updateUser as apiUpdateUser, updateUserDetails as apiUpdateUserDetails,
  updatePassword as apiUpdatePassword, recoverPassword as apiRecoverPassword
} from './api/user';

/**
 * Пустой объект, используемый по умолчанию для предотвращения ошибок доступа к свойствам.
 */
const EMPTY_OBJECT = Object.freeze({});

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
export type UserProfile = {
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
  /** Проверен ли номер телефона. */
  isPhoneVerified: boolean;
  /** Проверен ли e-mail. */
  isEmailVerified: boolean;
  /** Описание пользователя. */
  description: string;
  /** Местоположение (город) пользователя. */
  locality: number;
  /** Произвольные дополнительные детали пользователя. */
  details: Record<string, unknown>;
}

// todo: Уточнить тип details

/**
 * Заполняет структуру UserProfile данными, полученными из API.
 * @param data Сырые данные пользователя из API.
 * @returns Разобранные данные пользователя.
*/
function fillUserProfile(data: APIUserData): UserProfile {
  const numId = Number(data.u_id);
  const ret: UserProfile = {
    id: Number.isFinite(numId) ? numId : 0,
    name: data.u_name && data.u_middle ? `${data.u_name} ${data.u_middle}` : String(data.u_name || data.u_middle || ''),
    lastname: String(data.u_family || ''),
    email: String(data.u_email || ''),
    phone: String(data.u_phone || ''),
    role: data.u_role === '2' ? UserRole.Contractor : UserRole.Client,
    avatar: String(data.u_photo || ''),
    language: String(data.u_lang || CONFIG.APP.language || ''), // todo: Здесь ошибка, символьный код языка для data.u_lang нужно взять из site data
    currency: String(data.u_currency || ''),
    isPhoneVerified: Number( data.u_phone_checked ) === 1,
    isEmailVerified: Number( data.u_email_checked) === 1,
    description: String(data.u_description || ''),
    locality: Number(data.u_city) || 0,
    details:  // todo: Добавить распаковку u_details
      'object' === typeof data.u_details && data.u_details !== null && !Array.isArray(data.u_details) ?
      data.u_details as Record<string, unknown> :
      {}
  };
  return ret;
}

/**
 * Загружает полные данные пользователя из API.
 * @param client Объект QueryClient.
 * @returns Промис, который разрешается с объектом UserProfile или пустым объектом,
 *          если пользователь не авторизован или данные не найдены.
 * @throws {Error} Если произошла ошибка при запросе к API.
 */
async function fetchAuthUser({ client }): Promise<UserProfile | {}> {
  const token = getToken();
  if (!token) return {};

  try {
    const result = await getAuthUser();
    if (!result) return {};
    const userProfile = fillUserProfile(result);
    return userProfile.id > 0 ? userProfile : {};
  }
  catch (e) {
    throw e instanceof Error ? e : new Error(String(e));
  }
}

/**
 * Хук для получения данных текущего пользователя.
 * @returns Объект с состоянием запроса React Query и объектом `user`, содержащим данные.
 */
export function useUser():
  UseQueryResult<Awaited<UserProfile | {}>, unknown> &
  { user: UserProfile | {} }
{
  const queryResult = useQuery({
    queryKey: [ 'user', 'authorized' ],
    queryFn: fetchAuthUser,
    staleTime: CONFIG.API?.userDataStaleTime ?? Infinity
  });

  const user = queryResult.data || EMPTY_OBJECT;
  delete queryResult.data;
  return {
    ...queryResult,
    user
  };
}

// Механизм батчинга для fetchUserById
type UserResolver = {
  userId: number;
  resolve: (user: UserProfile | {}) => void;
  reject: (error: unknown) => void;
};

let usersToFetch: UserResolver[];
let usersFetchTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Загружает данные пользователя по ID из API.
 * Использует батчинг для объединения нескольких запросов в один API вызов.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param queryKey Ключ запроса, содержащий ID пользователя (например, ['user', 123]).
 * @returns Промис, который разрешается с объектом UserProfile или пустым объектом.
 * @throws {Error} Если произошла ошибка при запросе к API или пользователь не найден.
 */
function fetchUserById({ queryKey }: { queryKey: (string | number)[] }): Promise<UserProfile | {}> {
  const userId = Number(queryKey[1]);
  if (!userId) return Promise.resolve({});

  if (usersFetchTimeout) clearTimeout(usersFetchTimeout);
  usersFetchTimeout = setTimeout(async () => {
    const resolvers = usersToFetch;
    usersToFetch = [];
    usersFetchTimeout = null;

    const userIdsToFetch = [...new Set(usersToFetch.map(item => item.userId))];

    if (userIdsToFetch.length === 0) {
      return;
    }

    try {
      const apiUsers = await apiGetUsers(userIdsToFetch);
      resolvers.forEach(item => {
        const userData = apiUsers[item.userId];
        if (userData) {
          const userProfile = fillUserProfile(userData);
          item.resolve(userProfile.id > 0 ? userProfile : {});
        } else {
          item.resolve({});
        }
      });
    } catch (error) {
      resolvers.forEach(item => item.reject(error));
    }
  }, 10);

  return new Promise((resolve, reject) => {
    usersToFetch.push({ userId, resolve, reject });
  });
}

function combineFetchUserResults(results: UseQueryResult<Awaited<UserProfile | {}>, unknown>[]) {
  // Агрегируем состояния загрузки и ошибок
  const ret: {
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: unknown;
    isSuccess:  boolean;
    users: UserProfile[];
  } = {
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    isSuccess: true,
    users: []
  };

  results.forEach(query => {
    if (query.isLoading) ret.isLoading = true;
    if (query.isFetching) ret.isFetching = true;
    if (query.isError) {
      ret.isError = true;
      ret.error = query.error;
    }
    if (query.isLoading) ret.isLoading = true;
    // @ts-ignore
    if (query.data?.id) ret.users.push(query.data);
  });

  return ret;
}

/**
 * Хук для получения данных нескольких пользователей по их ID.
 * @param userIds Массив ID пользователей.
 * @returns Объект, содержащий объединенное состояние запросов React Query
 *          и массив `users` с данными успешно полученных пользователей.
 */
export function useUsersByIds(userIds: number[]) {
  const queries = userIds.map(userId => ({
    queryKey: ['user', userId],
    queryFn: fetchUserById,
    staleTime: CONFIG.API?.userDataStaleTime ?? Infinity
  }));

  return useQueries({
    queries,
    combine: combineFetchUserResults
  });
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

    queryClient.invalidateQueries({ queryKey: ['user', 'authorized'] });

    // Заполняем данные пользователя в кэше, если auth_user присутствует
    if (authResult.auth_user) {
      const userProfile = fillUserProfile(authResult.auth_user);
      queryClient.setQueryData(['user', 'authorized'], userProfile);
    }
  } catch (error) {
    clearToken();
    queryClient.invalidateQueries({ queryKey: ['user', 'authorized'] }); // Очищаем кэш и при ошибке
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
    queryClient.invalidateQueries({ queryKey: ['user', 'authorized'] }); // Очищаем кэш пользователя
  }
}

/**
 * Хук для выполнения входа пользователя.
 * Использует функцию `login` в качестве mutationFn.
 * В случае успеха:
 * - Запоминает токен с помощью setToken (уже внутри `login`).
 * - Очищает все данные пользователя в кэше react-query (ключ ['user', 'authorized']).
 * - Сразу же заполняет базовые данные пользователя значениями, переданными при авторизации.
 * В случае неудачи:
 * - Очищает все данные пользователя и сбрасывает токен с помощью clearToken (уже внутри `login`).
 * - Очищает все данные пользователя в кэше react-query.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ loginValue, password, keepAuthorized }: { loginValue: string; password: string; keepAuthorized: boolean }) =>
      login(queryClient, loginValue, password, keepAuthorized),
  });

  const loginFn = mutation.mutateAsync;
  const ret = mutation as Omit<UseMutationResult, 'mutateAsync'> & { mutateAsync?: UseMutationResult['mutateAsync'] };
  delete ret.mutateAsync;
  return {
    ...ret,
    login: loginFn
  }
}

/**
 * Данные для регистрации нового пользователя.
 */
export type RegisterPayload = {
  name: string;
  lastname: string;
  phone: string;
  email: string;
  locality?: number;
  password: string;
  details?: Record<string, unknown>; // Дополнительные детали, только для мастера
  keepAuthorized: boolean;
}

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
  queryClient.invalidateQueries({ queryKey: ['user', 'authorized'] });
}

/**
 * Регистрирует нового пользователя как клиента.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param payload Объект с данными для регистрации.
 * @returns Промис, который разрешается после успешной регистрации.
 */
export function registerClient(queryClient: QueryClient, payload: RegisterPayload): Promise<void> {
  return _registerUser(queryClient, payload, apiRegisterAsClient, UserRole.Client);
}

/**
 * Хук для регистрации нового пользователя как клиента.
 */
export function useRegisterClient() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: RegisterPayload) => registerClient(queryClient, payload),
  });

  const register = mutation.mutateAsync;
  const ret = mutation as Omit<UseMutationResult, 'mutateAsync'> & { mutateAsync?: UseMutationResult['mutateAsync'] };
  delete ret.mutateAsync;
  return {
    ...ret,
    register
  }
}

/**
 * Регистрирует нового пользователя как мастера.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param payload Объект с данными для регистрации.
 * @returns Промис, который разрешается после успешной регистрации.
 */
export async function registerContractor(queryClient: QueryClient, payload: RegisterPayload): Promise<void> {
  await _registerUser(queryClient, payload, apiRegisterAsContractor, UserRole.Contractor);
  if (payload.locality) {
    await apiUpdateUser({ u_city: payload.locality });
  }
}

/**
 * Хук для регистрации нового пользователя как мастера.
 */
export function useRegisterContractor() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: RegisterPayload) => registerContractor(queryClient, payload),
  });

  const register = mutation.mutateAsync;
  const ret = mutation as Omit<UseMutationResult, 'mutateAsync'> & { mutateAsync?: UseMutationResult['mutateAsync'] };
  delete ret.mutateAsync;
  return {
    ...ret,
    register
  }
}

/**
 * Опции для обновления профиля пользователя.
 * Поля здесь соответствуют логическим полям из UserProfile.
 * Все поля являются опциональными; будут обновлены только те, которые присутствуют.
 */
export type UserUpdatePayload = {
  name?: string;
  lastname?: string;
  phone?: string;
  email?: string;
  language?: string;
  currency?: string;
  locality?: number;
  description?: string;
}

/**
 * Обновляет основные данные профиля пользователя.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param payload Объект с данными для обновления, использующий логические имена полей.
 * @returns Промис, который разрешается после успешного обновления.
 */
export async function updateUser(queryClient: QueryClient, payload: UserUpdatePayload): Promise<void> {
  // todo: Может быть, добавить полную проверку для phone, email, language, currency, locality
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
  if (payload.locality !== undefined) {
    apiUserData.u_city = payload.locality || null;  // Сработает только для мастера
  }
  if (payload.description !== undefined) {
    const description = payload.description.trim();
    apiUserData.u_description = description;
  }

  await apiUpdateUser(apiUserData);
  queryClient.invalidateQueries({ queryKey: ['user', 'authorized'] });
}

/**
 * Хук для обновления основных данных профиля пользователя.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: UserUpdatePayload) => updateUser(queryClient, payload),
  });

  const save = mutation.mutateAsync;
  const ret = mutation as Omit<UseMutationResult, 'mutateAsync'> & { mutateAsync?: UseMutationResult['mutateAsync'] };
  delete ret.mutateAsync;
  return {
    ...ret,
    save
  }
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
  queryClient.invalidateQueries({ queryKey: ['user', 'authorized'] });
}

/**
 * Хук для обновления фотографии профиля пользователя.
 */
export function useUpdateUserAvatar() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (photoFile: File) => updateUserAvatar(queryClient, photoFile),
  });

  const save = mutation.mutateAsync;
  const ret = mutation as Omit<UseMutationResult, 'mutateAsync'> & { mutateAsync?: UseMutationResult['mutateAsync'] };
  delete ret.mutateAsync;
  return {
    ...ret,
    save
  }
}

/**
 * Обновляет дополнительные детали профиля пользователя.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param details Объект с дополнительными деталями пользователя.
 * @returns Промис, который разрешается после успешного обновления.
 */
export async function updateUserDetails(queryClient: QueryClient, details: Record<string, unknown>): Promise<void> {
  await apiUpdateUserDetails(details);
  queryClient.invalidateQueries({ queryKey: ['user', 'authorized'] });
}

/**
 * Хук для обновления дополнительных деталей профиля пользователя.
 */
export function useUpdateUserDetails() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (details: Record<string, unknown>) => updateUserDetails(queryClient, details),
  });

  const save = mutation.mutateAsync;
  const ret = mutation as Omit<UseMutationResult, 'mutateAsync'> & { mutateAsync?: UseMutationResult['mutateAsync'] };
  delete ret.mutateAsync;
  return {
    ...ret,
    save
  }
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
  const mutation = useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      updateUserPassword(oldPassword, newPassword),
  });

  const update = mutation.mutateAsync;
  const ret = mutation as Omit<UseMutationResult, 'mutateAsync'> & { mutateAsync?: UseMutationResult['mutateAsync'] };
  delete ret.mutateAsync;
  return {
    ...ret,
    update
  }
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
  const mutation = useMutation({
    mutationFn: (loginValue: string) => recoverPassword(loginValue),
  });

  const recover = mutation.mutateAsync;
  const ret = mutation as Omit<UseMutationResult, 'mutateAsync'> & { mutateAsync?: UseMutationResult['mutateAsync'] };
  delete ret.mutateAsync;
  return {
    ...ret,
    recover
  }
}
