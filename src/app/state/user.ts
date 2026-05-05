/**
 * Модуль для работы с глобальным состоянием пользователей и аутентификацией
 *
 * @summary
 * **Типы данных:**
 * TimeUnit, UserRole, UserProfile, RegisterPayload, UserUpdatePayload, BusinessModel
 *
 * **Функции, влияющие на глобальное состояние:**
 * useUser, useUsersByIds, getUserById, login, logout, useLogin,
 * registerClient, useRegisterClient, registerContractor, useRegisterContractor,
 * updateUser, useUpdateUser, updateUserAvatar, useUpdateUserAvatar,
 *
 * **Функции, не влияющие на глобальное состояние:**
 * updateUserPassword, useUpdateUserPassword, recoverPassword, usePasswordRecovery
 */
import { QueryClient, UseQueryResult, useQuery, useQueries, useMutation } from '@tanstack/react-query';

import CONFIG from 'config';
import { setToken, clearToken, isUserAuthorized, authorizedUserId } from './auth';
import { fileToBase64, isImage, randomString } from 'app/shared/lib/utilities';
import * as UserAPI from './api/user';
import * as CarAPI from './api/cars';
import * as FileAPI from './api/dropbox';

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
 * Единицы времени.
 */
export enum TimeUnit {
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  WEEKS = 'weeks'
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
  lastTimeBeenOnline: Date;
}

interface ClientUserProfile extends UserBaseData {
}

export type ServiceDetails = {
  service: string;
  durationFrom: {
    value: number,
    unit: TimeUnit
  };
  durationTo?: {
    value: number,
    unit: TimeUnit
  };
  price: number
};

export type ServicesMap = Record<number, ServiceDetails[]>;

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
  services: ServicesMap;
  /** Бизнес-модель */
  businessModel: BusinessModel;
  /** Название организации */
  organizationName: string;
  /** Фотографии мастера */
  photos?: Array<File | number>;
  /** Активный - пользователь готов принимать заказы */
  active: boolean;
  /** Дата регистрации */
  registrationDate: Date;
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
  const lastTimeBeenOnline = 'string' === typeof u_details?.lastTimeBeenOnline ? new Date(u_details.lastTimeBeenOnline) : null;
  const baseProfile: UserBaseData = {
    id: Number.isInteger(numId) && numId > 0 ? numId : 0,
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
    blackList: Array.isArray(u_details?.blackList) ? u_details.blackList : [],
    isOnline: 'boolean' === typeof u_details?.isOnline ? u_details.isOnline : false,
    lastTimeBeenOnline: Number.isFinite(lastTimeBeenOnline?.getTime()) ? lastTimeBeenOnline! : new Date(0)
  };

  if (baseProfile.role === UserRole.Client) {
    return baseProfile;
  }

  const contractorServices = {} as ServicesMap;
  if (u_details?.services && 'object' === typeof u_details.services) {
    for (const key in u_details.services) {
      const productId = Number(key);
      if (Number.isInteger(productId) && productId > 0 && Array.isArray(u_details.services[key])) {
        contractorServices[productId] = u_details.services[key];
      }
    }
  }

  return {
    ...baseProfile,
    description: String(data.u_description || ''),
    locality: Number(data.u_city) || 0,
    address: 'string' === typeof u_details?.address ? u_details.address : '',
    experience: 'number' === typeof u_details?.experience ? u_details.experience : 0,
    services: contractorServices,
    businessModel: u_details?.businessModel === BusinessModel.ServiceCenter ? BusinessModel.ServiceCenter : BusinessModel.IndependentTechnician,
    organizationName: u_details?.businessModel === BusinessModel.ServiceCenter && 'string' === typeof u_details?.organizationName ? u_details.organizationName : '',
    photos: Array.isArray(u_details?.photos) ? u_details.photos.map(Number).filter(id => Number.isInteger(id) && id > 0) : [],
    active: Number(data.u_active) === 1,
    registrationDate: new Date(String(u_details?.registrationDate ?? '') || 0)
  };
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

let usersToFetch: UserResolver[] = [];
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
 * Получить данные пользователя по ID.
 * Только для внутреннего использования в API. Для UI рекомендуется использовать хук `useUsersByIds`.
 * @internal
 * @param userId ID пользователя.
 * @returns Промис, разрешающийся с данными запрошенного пользователя.
 */
export async function getUserById(queryClient: QueryClient, userId: number) {
  if (!userId) return {};
  return (await queryClient.ensureQueryData({
    queryKey: ['user', userId],
    queryFn: fetchUserById,
    staleTime: CONFIG.API?.userDataStaleTime ?? Infinity,
  })) ?? {};
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

    setToken({
      u_id: Number(authResult.auth_user?.u_id ?? 0),
      token: authResult.token,
      u_hash: authResult.u_hash
    }, keepAuthorized);

    // Заполняем данные пользователя в кэше, если auth_user присутствует
    if (!authResult.auth_user) {
      queryClient.invalidateQueries({ queryKey: ['user', 'authorized'] });
    }
    else {
      const userProfile = fillUserProfile(authResult.auth_user);
      queryClient.setQueryData(['user', 'authorized'], userProfile);

      // Дополнительная проверка для пользователя-мастера
      if (userProfile.role === UserRole.Contractor) {
        const userId = userProfile.id;
        // Здесь и далее проверяем соответствие ID пользователя авторизованному пользователю в токене,
        // потому что пользователь может смениться во время выполнения асинхронных операций
        if (authorizedUserId() !== userId) return;

        const checkState = Number(authResult.auth_user.u_check_state);
        let userChecked = checkState === 2;
        const userUnchecked = !checkState || !Number.isInteger(checkState) || checkState === 1;
        const drivenCar = await CarAPI.getDrivenCar();
        if (authorizedUserId() !== userId) return;

        let carToDrive: number|null = null;
        if (!drivenCar) {
          const userCars = await CarAPI.getUserCars();
          if (authorizedUserId() !== userId) return;

          if (userCars.length === 0 && userUnchecked) {
            const carData = {
              seats: 1,
              registration_plate: randomString(12)
            };
            carToDrive = Number(await CarAPI.createCar(carData));
            if (authorizedUserId() !== userId) return;
          }
          else if (userCars.length > 0) {
            carToDrive = Number(userCars[0].c_id);
          }
        }

        if (userUnchecked) {
          await UserAPI.makeUserVerified();
          if (authorizedUserId() !== userId) return;
          userChecked = true;
        }

        if (!drivenCar && userChecked && Number.isInteger(carToDrive) && carToDrive! > 0) {
          CarAPI.driveCar(carToDrive!);  // можно не ждать
        }
      }
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
    console.warn('Logout API call failed, but clearing token anyway:', error);
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
  products?: number[];
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
): Promise<number> {
  const {
    name,
    lastname,
    phone,
    email,
    password,
    address,
    experience,
    products,
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
    const services = Object.fromEntries((products || []).map(id => [id, []]));
    registerData.u_details = {
      address: address || '',
      experience: experience || 0,
      services,
      businessModel: businessModel || BusinessModel.IndependentTechnician,
      registrationDate: (new Date()).toISOString()
    };
    if (businessModel === BusinessModel.ServiceCenter) {
      registerData.u_details.organizationName = organizationName || '';
    }
  }

  const result = await registerApiFn(registerData);
  if (!result.token || !result.u_hash) {
    throw new Error('Registration failed: token or user hash is missing.');
  }
  setToken({ u_id: Number(result.u_id), token: result.token, u_hash: result.u_hash }, keepAuthorized);
  queryClient.invalidateQueries({ queryKey: ['user', 'authorized'] });

  return Number(result.u_id);
}

/**
 * Регистрирует нового пользователя как клиента.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param payload Объект с данными для регистрации.
 * @returns Промис, который разрешается после успешной регистрации.
 */
export async function registerClient(queryClient: QueryClient, payload: RegisterPayload): Promise<void> {
  await _registerUser(queryClient, payload, UserAPI.registerAsClient, UserRole.Client);
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
  // todo: предусмотреть возобновление регистрации, если она прервана между запросами
  const userId = await _registerUser(queryClient, payload, UserAPI.registerAsContractor, UserRole.Contractor);
  if (payload.locality || payload.description) {
    const updateData: UserAPI.UserUpdateData = {};
    if (payload.locality) updateData.u_city = payload.locality;
    if (payload.description) updateData.u_description = payload.description;
    await UserAPI.updateUser(updateData);
    if (authorizedUserId() !== userId) return;
  }

  const carData = {
    seats: 1,
    registration_plate: randomString(12)
  }
  const carId = Number(await CarAPI.createCar(carData));
  if (authorizedUserId() !== userId) return;

  await UserAPI.makeUserVerified();
  if (authorizedUserId() !== userId) return;

  queryClient.invalidateQueries({ queryKey: ['user', 'authorized'] });
  if (carId) CarAPI.driveCar(carId);  // можно не ждать
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
  lastTimeBeenOnline?: Date;
  services?: ServicesMap;
  businessModel?: BusinessModel;
  organizationName?: string;
  photos?: Array<File | number>;
}

/**
 * Обновляет основные данные профиля пользователя.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param payload Объект с данными для обновления, использующий логические имена полей.
 * @returns Промис, который разрешается после успешного обновления.
 */
export async function updateUser(queryClient: QueryClient, userId: number | undefined, payload: UserUpdatePayload): Promise<void> {
  if (!userId) throw new Error('User must be authorized.');
  if (userId !== authorizedUserId()) throw new Error('User was changed.');

  // todo: Может быть, добавить полную проверку для phone, email, language, currency, locality
  const updatedFiles = [] as number[];
  const deletedFiles = [] as number[];
  const apiUserData = {} as UserAPI.UserUpdateData;

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
    apiUserData.u_details = { ...apiUserData.u_details, lastTimeBeenOnline: payload.lastTimeBeenOnline.toISOString() };
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
  if (payload.photos !== undefined) {
    const filePhotos = payload.photos.filter(file => file instanceof File);
    const idPhotos = payload.photos.filter(file => 'number' === typeof file);

    const oldData = await UserAPI.getAuthUser();
    if (Number(oldData.u_id) !== userId || userId !== authorizedUserId()) throw new Error('User was changed.');

    let oldFilesInfo = [] as (FileAPI.DropboxFileInfo | null)[];
    if (Array.isArray(oldData.u_details?.photos)) {
      const oldIds = (oldData.u_details.photos ?? [])
        .map(Number)
        .filter(id => Number.isInteger(id) && id > 0 && !idPhotos.includes(id));
      oldFilesInfo = await FileAPI.getFilesInfo(oldIds);
      if (userId !== authorizedUserId()) throw new Error('User was changed.');
    }
    // todo: Здесь возможна рассинхронизация загруженных файлов и данных заказа.
    //       Нужно предусмотреть очистку или сделать транзакцию на бэкенде.
    const newPhotos = idPhotos;
    if (filePhotos.length) {
      const photos = await Promise.all(
        filePhotos
          .filter(file => isImage(file.type))
          .map(async file => ({ name: file.name, data: await fileToBase64(file) }))
      );
      if (userId !== authorizedUserId()) throw new Error('User was changed.');

      const uploads = photos.map(image => {
        const fileIndex = oldFilesInfo.findIndex(file => file?.json?.name === image.name);
        if (fileIndex >= 0) {
          const oldId = Number(oldFilesInfo[fileIndex]!.dl_id || 0);
          oldFilesInfo[fileIndex] = null;
          updatedFiles.push(oldId);
          return FileAPI.updateFile(oldId, image.data);
        }
        return FileAPI.uploadFile(image.name, image.data, 0);
      });
      const deletedIds = oldFilesInfo.filter(Boolean).map(file => Number(file!.dl_id));
      if (deletedIds.length) deletedFiles.push(...deletedIds);
      const deletes = deletedIds.map(id => FileAPI.deleteFile(id));
      if (deletes.length) {
        await Promise.all(deletes);
        if (userId !== authorizedUserId()) throw new Error('User was changed.');
      }
      const uploaded = (await Promise.all(uploads)).filter(Boolean) as number[];
      if (userId !== authorizedUserId()) throw new Error('User was changed.');
      newPhotos.push(...uploaded);
      apiUserData.u_details = { ...apiUserData.u_details, photos: newPhotos };
    }
  }

  await UserAPI.updateUser(apiUserData, UserRole.Client);
  queryClient.invalidateQueries({ queryKey: ['user', 'authorized'] });
  for (const id of deletedFiles) {
    queryClient.removeQueries({ queryKey: [ 'files', id ] });
  }
  for (const id of updatedFiles) {
    queryClient.invalidateQueries({ queryKey: [ 'files', id ] });
  }
}

/**
 * Хук для обновления основных данных профиля пользователя.
 */
export function useUpdateUser() {
  const { user } = useUser();
  const mutation = useMutation({
    mutationFn: (payload: UserUpdatePayload, { client }) => updateUser(client, user.id, payload),
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
export async function updateUserAvatar(queryClient: QueryClient, userId: number, photoFile: File): Promise<void> {
  if (!userId) throw new Error('User must be authorized.');
  if (userId !== authorizedUserId()) throw new Error('User was changed.');

  const base64Photo = await fileToBase64(photoFile);
  await UserAPI.updateUser({ u_photo: base64Photo }, UserRole.Client);
  queryClient.invalidateQueries({ queryKey: ['user', 'authorized'] });
}

/**
 * Хук для обновления фотографии профиля пользователя.
 */
export function useUpdateUserAvatar() {
  const { user } = useUser();
  const mutation = useMutation({
    mutationFn: (photoFile: File, { client }) => updateUserAvatar(client, user.id, photoFile),
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    save: mutateAsync
  }
}

/**
 * Обновляет статус активности для мастера.
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param isActive Новый статус активности.
 * @returns Промис, который разрешается после успешного обновления.
 */
export async function setContractorActive(queryClient: QueryClient, userId: number, isActive: boolean): Promise<void> {
  if (!userId) throw new Error('User must be authorized.');
  if (userId !== authorizedUserId()) throw new Error('User was changed.');

  await UserAPI.updateUser({ u_active: isActive ? 1 : 0 });
  queryClient.invalidateQueries({ queryKey: ['user', 'authorized'] });
}

/**
 * Хук для обновления статуса активности мастера.
 */
export function useSetContractorActive() {
  const { user } = useUser();

  const mutation = useMutation({
    mutationFn: (isActive: boolean, { client }) => {
      if (user.role !== UserRole.Contractor) throw new Error('User must be a contractor');
      return setContractorActive(client, user.id, isActive);
    },
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    setContractorActive: mutateAsync
  }
}

/**
 * Обновляет пароль пользователя.
 * @param oldPassword Текущий пароль.
 * @param newPassword Новый пароль.
 * @returns Промис, который разрешается после успешного обновления.
 */
export async function updateUserPassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
  if (!userId) throw new Error('User must be authorized.');
  if (userId !== authorizedUserId()) throw new Error('User was changed.');

  await UserAPI.updatePassword(oldPassword, newPassword);
}

/**
 * Хук для обновления пароля пользователя.
 */
export function useUpdateUserPassword() {
  const { user } = useUser();
  const mutation = useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      updateUserPassword(user.id, oldPassword, newPassword),
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
