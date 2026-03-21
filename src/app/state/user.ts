/**
 * Модуль для работы с глобальным состоянием пользователей и аутентификацией
 *
 * @summary
 * **Типы данных:**
 * UserRole, UserProfile, RegisterPayload, UserUpdatePayload, BusinessModel
 *
 * **Функции, влияющие на глобальное состояние:**
 * useUser, useUsersByIds, login, logout, useLogin,
 * registerClient, useRegisterClient, registerContractor, useRegisterContractor,
 * updateUser, useUpdateUser, updateUserAvatar, useUpdateUserAvatar,
 *
 * **Функции, не влияющие на глобальное состояние:**
 * updateUserPassword, useUpdateUserPassword, recoverPassword, usePasswordRecovery
 */
import { QueryClient, UseQueryResult, useQuery, useQueries, useMutation } from '@tanstack/react-query';

import CONFIG from 'config';
import { setToken, clearToken, isUserAuthorized } from './auth';
import { fileToBase64 } from '../shared/lib/utilities';
import * as UserAPI from './api/user';

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
}

/**
 * Бизнес-модель пользователя.
 */
export enum BusinessModel {
  /** Независимый техник */
  IndependentTechnician = 'Independent technician',
  /** Сервисный центр */
  ServiceCenter = 'Service center'
}

/**
 * Базовые данные пользователя.
 */
interface UserBaseData {
  /** Идентификатор пользователя. */
  id: number;
  /** Роль пользователя. */
  role: UserRole;
  /** Имя пользователя. */
  name: string;
  /** Фамилия пользователя. */
  lastname: string;
  /** Полное имя пользователя (имя + фамилия). */
  fullname: string;
  /** E-mail пользователя. */
  email: string;
  /** Телефон пользователя. */
  phone: string;
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
  /** Черный список */
  blackList: number[];
  /** Онлайн ли пользователь */
  isOnline: boolean;
  /** Последняя активность */
  lastTimeBeenOnline: string;
}

interface ClientUserProfile extends UserBaseData {
}

interface ContractorUserProfile extends UserBaseData {
  /** Описание пользователя. */
  description: string;
  /** Местоположение (город) пользователя. */
  locality: number;
  /** Адрес */
  address: string;
  // todo: Сделать геокодирование при создании пользователя/изменении адреса
  /** Географические координаты для карты */
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  /** Опыт */
  experience: number;
  /** Услуги */
  services: number[];
  /** Бизнес-модель */
  businessModel: BusinessModel;
  /** Название организации */
  organizationName: string;
}

export type UserProfile = ClientUserProfile | ContractorUserProfile;

/**
 * Заполняет структуру UserProfile данными, полученными из API.
 * @param data Сырые данные пользователя из API.
 * @returns Разобранные данные пользователя.
*/
function fillUserProfile(data: UserAPI.UserData): UserProfile {
  const numId = Number(data.u_id);
  const u_details = data.u_details as Record<string, unknown> || undefined;
  const ret: UserProfile = {
    id: Number.isFinite(numId) ? numId : 0,
    name: data.u_name && data.u_middle ? `${data.u_name} ${data.u_middle}` : String(data.u_name || data.u_middle || ''),
    lastname: String(data.u_family || ''),
    fullname: [ data.u_name, data.u_middle, data.u_family ].filter(Boolean).join(' '),
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
    blackList: Array.isArray(u_details?.blackList) ? u_details.blackList : [],
    address: 'string' === typeof u_details?.address ? u_details.address : '',
    experience: 'number' === typeof u_details?.experience ? u_details.experience : 0,
    isOnline: 'boolean' === typeof u_details?.isOnline ? u_details.isOnline : false,
    lastTimeBeenOnline: 'string' === typeof u_details?.lastTimeBeenOnline ? u_details.lastTimeBeenOnline : '',
    services: Array.isArray(u_details?.services) ? u_details.services : [],
    businessModel: u_details?.businessModel === BusinessModel.ServiceCenter ? BusinessModel.ServiceCenter : BusinessModel.IndependentTechnician,
    organizationName: 'string' === typeof u_details?.organizationName ? u_details.organizationName : '',
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
  if (!isUserAuthorized()) return EMPTY_OBJECT;

  try {
    const result = await UserAPI.getAuthUser();
    if (!result) return {};
    const userProfile = fillUserProfile(result);
    return userProfile.id > 0 ? userProfile : EMPTY_OBJECT;
  }
  catch (e) {
    throw e instanceof Error ? e : new Error(String(e));
  }
}

/**
 * Хук для получения данных текущего пользователя.
 * @returns Объект с состоянием запроса React Query и объектом `user`, содержащим данные.
 */
export function useUser() {
  const queryResult = useQuery({
    queryKey: [ 'user', 'authorized' ],
    queryFn: fetchAuthUser,
    staleTime: CONFIG.API?.userDataStaleTime ?? Infinity
  });

  const { data, ...ret } = queryResult;
  const user = (data as UserProfile) || EMPTY_OBJECT;
  return {
    ...ret,
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

    const userIdsToFetch = [...new Set(resolvers.map(item => item.userId))];

    if (userIdsToFetch.length === 0) {
      return;
    }

    try {
      const apiUsers = await UserAPI.getUsers(userIdsToFetch);
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
  const ret = {
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null as unknown,
    isSuccess: true,
    users: [] as UserProfile[]
  };

  for (const query of results) {
    ret.isLoading ||= query.isLoading;
    ret.isFetching ||= query.isFetching;
    if (query.isError && !ret.error) {
      ret.isError = true;
      ret.error = query.error;
    }
    ret.isSuccess &&= query.isSuccess;
    const data = query.data as UserProfile;
    if (data?.id) ret.users.push(data);
  }

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
    staleTime: CONFIG.API?.userDataStaleTime ?? Infinity,
    enabled: !!userId
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
    const loginType: UserAPI.LoginType = loginValue.includes('@') ? 'e-mail' : 'phone';
    const authResult = await UserAPI.login(loginValue, password, loginType);

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
    await UserAPI.logout(); // Вызов API функции выхода
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
  const mutation = useMutation({
    mutationFn: (
      { loginValue, password, keepAuthorized }: { loginValue: string; password: string; keepAuthorized: boolean },
      { client }
    ) =>
      login(client, loginValue, password, keepAuthorized),
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    login: mutateAsync
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
  description?: string;
  password: string;
  address?: string;
  experience?: number;
  services?: number[];
  businessModel?: BusinessModel;
  organizationName?: string;
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
  registerApiFn: (registerData: UserAPI.RegisterUserData) => Promise<UserAPI.RegisterResult>,
  role: UserRole
): Promise<void> {
  const {
    name,
    lastname,
    phone,
    email,
    password,
    address,
    experience,
    services,
    businessModel,
    organizationName,
    keepAuthorized
  } = payload;
  const u_name = `${name.trim()} ${lastname.trim()}`.trim();
  const u_phone = phone.trim();
  const u_email = email.trim();

  if (!u_phone && !u_email) {
    throw new Error("Phone number or email address must be specified.");
  }

  const registerData: UserAPI.RegisterUserData = {
    u_name,
    u_phone,
    u_email,
    password,
  };
  if (role === UserRole.Contractor) {
    registerData.u_details = {
      address: address || '',
      experience: experience || 0,
      services: services || [],
      businessModel: businessModel || BusinessModel.IndependentTechnician,
      organizationName: organizationName || ''
    };
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
  return _registerUser(queryClient, payload, UserAPI.registerAsClient, UserRole.Client);
}

/**
 * Хук для регистрации нового пользователя как клиента.
 */
export function useRegisterClient() {
  const mutation = useMutation({
    mutationFn: (payload: RegisterPayload, { client }) => registerClient(client, payload),
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    register: mutateAsync
  }
}

/**
 * Регистрирует нового пользователя как мастера.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param payload Объект с данными для регистрации.
 * @returns Промис, который разрешается после успешной регистрации.
 */
export async function registerContractor(queryClient: QueryClient, payload: RegisterPayload): Promise<void> {
  await _registerUser(queryClient, payload, UserAPI.registerAsContractor, UserRole.Contractor);
  if (payload.locality || payload.description) {
    const updateData: UserAPI.UserUpdateData = {};
    if (payload.locality) updateData.u_city = payload.locality;
    if (payload.description) updateData.u_description = payload.description;
    await UserAPI.updateUser(updateData);
  }
  // todo: создать машину водителю
  // todo: пометить пользователя как прошедшего проверку (пока нет админки)
  // todo: предусмотреть возобновление регистрации, если она прервана между запросами
}

/**
 * Хук для регистрации нового пользователя как мастера.
 */
export function useRegisterContractor() {
  const mutation = useMutation({
    mutationFn: (payload: RegisterPayload, { client }) => registerContractor(client, payload),
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    register: mutateAsync
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
  //~ locality?: number;
  //~ description?: string;
  blackList?: number[];
  address?: string;
  experience?: number;
  isOnline?: boolean;
  lastTimeBeenOnline?: string;
  services?: number[];
  businessModel?: BusinessModel;
  organizationName?: string;
}

/**
 * Обновляет основные данные профиля пользователя.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param payload Объект с данными для обновления, использующий логические имена полей.
 * @returns Промис, который разрешается после успешного обновления.
 */
export async function updateUser(queryClient: QueryClient, payload: UserUpdatePayload): Promise<void> {
  // todo: Может быть, добавить полную проверку для phone, email, language, currency, locality
  const apiUserData: UserAPI.UserUpdateData = {};

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
  //~ if (payload.locality !== undefined) {
    //~ apiUserData.u_city = payload.locality || null;  // Сработает только для неподтверждённого мастера
  //~ }
  //~ if (payload.description !== undefined) {
    //~ const description = payload.description.trim();  // Сработает только для неподтверждённого мастера
    //~ apiUserData.u_description = description;
  //~ }
  if (payload.blackList !== undefined) {
    apiUserData.u_details = { ...apiUserData.u_details, blackList: payload.blackList };
  }
  if (payload.address !== undefined) {
    apiUserData.u_details = { ...apiUserData.u_details, address: payload.address };
  }
  if (payload.experience !== undefined) {
    apiUserData.u_details = { ...apiUserData.u_details, experience: payload.experience };
  }
  if (payload.isOnline !== undefined) {
    apiUserData.u_details = { ...apiUserData.u_details, isOnline: payload.isOnline };
  }
  if (payload.lastTimeBeenOnline !== undefined) {
    apiUserData.u_details = { ...apiUserData.u_details, lastTimeBeenOnline: payload.lastTimeBeenOnline };
  }
  if (payload.services !== undefined) {
    apiUserData.u_details = { ...apiUserData.u_details, services: payload.services };
  }
  if (payload.businessModel !== undefined) {
    apiUserData.u_details = { ...apiUserData.u_details, businessModel: payload.businessModel };
  }
  if (payload.organizationName !== undefined) {
    apiUserData.u_details = { ...apiUserData.u_details, organizationName: payload.organizationName };
  }

  await UserAPI.updateUser(apiUserData, 1);
  queryClient.invalidateQueries({ queryKey: ['user', 'authorized'] });
}

/**
 * Хук для обновления основных данных профиля пользователя.
 */
export function useUpdateUser() {
  const mutation = useMutation({
    mutationFn: (payload: UserUpdatePayload, { client }) => updateUser(client, payload),
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    save: mutateAsync
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
  await UserAPI.updateUser({ u_photo: base64Photo }, 1);
  queryClient.invalidateQueries({ queryKey: ['user', 'authorized'] });
}

/**
 * Хук для обновления фотографии профиля пользователя.
 */
export function useUpdateUserAvatar() {
  const mutation = useMutation({
    mutationFn: (photoFile: File, { client }) => updateUserAvatar(client, photoFile),
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    save: mutateAsync
  }
}

/**
 * Обновляет пароль пользователя.
 * @param oldPassword Текущий пароль.
 * @param newPassword Новый пароль.
 * @returns Промис, который разрешается после успешного обновления.
 */
export async function updateUserPassword(oldPassword: string, newPassword: string): Promise<void> {
  await UserAPI.updatePassword(oldPassword, newPassword);
}

/**
 * Хук для обновления пароля пользователя.
 */
export function useUpdateUserPassword() {
  const mutation = useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      updateUserPassword(oldPassword, newPassword),
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    update: mutateAsync
  }
}

/**
 * Инициирует процесс восстановления пароля.
 * @param loginValue Логин пользователя (телефон или e-mail).
 * @returns Промис, который разрешается после успешной отправки запроса.
 */
export async function recoverPassword(loginValue: string): Promise<void> {
  const loginType: UserAPI.LoginType = loginValue.includes('@') ? 'e-mail' : 'phone';
  await UserAPI.recoverPassword(loginValue, loginType);
}

/**
 * Хук для инициирования процесса восстановления пароля.
 */
export function usePasswordRecovery() {
  const mutation = useMutation({
    mutationFn: (loginValue: string) => recoverPassword(loginValue),
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    recover: mutateAsync
  }
}
