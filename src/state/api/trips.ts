/**
 * Модуль api для работы с заказами
 *
 * @summary
 * **Типы:**
 * TripState, DriverState, GetTripsState, TripData, DriverData, DriverOffer, TripCreationData, TripEditData
 *
 * **Получение данных:**
 * getContractorsByService, getTrips, getTripsById
 *
 * **Изменение данных:**
 * createTrip, updateTrip, cancelTripByClient, cancelTripByDriver, inviteDriver, acceptInvoice, createOffer,
 * acceptOffer, setArriveState, startTrip, finishTrip, scoreTrip
 */
import { post, postWithAuthUser } from './request';

// ==================== Типы данных ====================

export enum TripState {
  New = 1,
  Assigned,
  Cancelled,
  Completed,
  Waiting,
  Offering
}

export enum DriverState {
  Offering = 1,
  Cancelled,
  Assigned,
  Waiting,
  Driving,
  Completed
}

/**
 * Структура данных, представляющая одну поездку в API.
 */
export type TripData = {
  /** Идентификатор поездки */
  b_id: string;
  /** Идентификатор клиента */
  u_id: string;
  /** ID города начала поездки */
  city_start?: number | null;
  /** Адрес начальной точки поездки */
  b_start_address: string | null;
  /** Широта начальной точки поездки */
  b_start_latitude: number | null;
  /** Долгота начальной точки поездки */
  b_start_longitude: number | null;
  /** Дата и время начала поездки */
  b_start_datetime: string | null;
  /** Пользовательские комментарии, отсутствующие в справочнике */
  b_custom_comment: string | null;
  /** Идентификатор статуса поездки */
  b_state: string;
  /** Оценка поездки клиентом */
  b_rating: number | null;
  /** Дата и время создания поездки */
  b_created: string;
  /** Причина отмены поездки клиентом */
  b_cancel_reason: string | null;
  /** Список идентификаторов статусов отмены поездки по пользователям */
  b_cancel_states: Record<string, string[]> | null;
  /** Дата одобрения поездки */
  b_approved: string | null;
  /** Дата отмены поездки */
  b_canceled: string | null;
  /** Дата завершения поездки */
  b_completed: string | null;
  /** Максимальное время ожидания машины в секундах */
  b_max_waiting: number;
  /** Список дополнительных параметров */
  b_options: Record<string, unknown> | null;
  /** Оценочная цена маршрута */
  b_price_estimate: number | null;
  /** Валюта поездки */
  b_currency: string | null;
  /** Является ли поездка ночной (1, 0 или null) */
  b_night: number | null;
  /** Список водителей, связанных с поездкой */
  drivers: DriverData[] | null;
  /** Список идентификаторов комментариев к поездкам */
  b_comments: string[] | null;
  /** Список идентификаторов услуг при перевозке */
  b_services: string[] | null;
  /** Является ли поездка голосованием (1 или отсутствует) */
  b_voting?: number;
  /** Идентификатор способа оплаты (для клиента) */
  b_payment_way?: string;
  /** Идентификатор платежной карты (для клиента) */
  b_payment_card?: string;
  /** Список предложений водителям */
  b_offers?: DriverOffer[];
  /** Предложена ли поездка для этого водителя (1 или 0) */
  b_offer?: number;
}

/**
 * Структура данных, представляющая водителя в контексте поездки
 */
export type DriverData = {
  /** Идентификатор водителя */
  u_id: string;
  /** Идентификатор машины */
  c_id: string;
  /** Идентификатор статуса водителя в поездке */
  c_state: string;
  /** Идентификатор способа оплаты (для этого водителя) */
  c_payment_way?: string;
  /** Идентификатор платежной карты (для этого водителя) */
  c_payment_card?: string | null;
  /** Причина отмены поездки водителем */
  c_cancel_reason: string | null;
  /** Оценка поездки водителем */
  c_rating: number | null;
  /** Дата подачи заявки на исполнение */
  c_becomed_candidate: string | null;
  /** Дата назначения исполнителем */
  c_appointed: string | null;
  /** Дата отмены исполнения */
  c_canceled: string | null;
  /** Дата прибытия к клиенту */
  c_arrived: string | null;
  /** Дата начала поездки */
  c_started: string | null;
  /** Дата завершения поездки */
  c_completed: string | null;
  /** Список дополнительных параметров водителя */
  c_options: Record<string, unknown> | null;
}

/**
 * Структура данных, представляющая машину
 */
type CarData = {
  /** Идентификатор машины */
  c_id: string;
}

/**
 * Структура данных, представляющая предложение водителю
 */
export interface DriverOffer {
  /** Идентификатор водителя */
  u_id: string;
  /** Дата добавления предложения */
  created: string;
}

/**
 * Структура данных для создания поездки.
 */
export type TripCreationData = {
  /** ID города начала поездки */
  city_start: number;
  /** Адрес начальной точки поездки */
  b_start_address: string;
  /** Широта начальной точки поездки */
  b_start_latitude?: number;
  /** Долгота начальной точки поездки */
  b_start_longitude?: number;
  /** Дата и время начала поездки */
  b_start_datetime?: string;
  /** Пользовательские комментарии, отсутствующие в справочнике */
  b_custom_comment?: string;
  /** Максимальное время ожидания машины в секундах */
  b_max_waiting: number;
  /** Идентификатор способа оплаты (для клиента) */
  b_payment_way: number;
  /** Идентификатор платежной карты (для клиента) */
  b_payment_card?: number;
  /** Список дополнительных параметров */
  b_options?: Record<string, unknown>;
  /** Создавать ли поездку только для выбранных водителей */
  b_only_offer?: 0 | 1;
}

/**
 * Структура данных для редактирования поездки.
 */
export type TripEditData = {
  /** Адрес начальной точки поездки */
  b_start_address?: string;
  /** Широта начальной точки поездки */
  b_start_latitude?: number;
  /** Долгота начальной точки поездки */
  b_start_longitude?: number;
  /** Список дополнительных параметров поездки */
  b_options?: Record<string, unknown>;
  /** Список дополнительных параметров водителя */
  c_options?: Record<string, unknown>;
}

/** Статус поездки для запроса списка поездок */
export enum GetTripsState {
  Any,
  New,
  Current,
  Finished
}

// ==================== 1. Выбор мастера ====================

/**
 * Получить список мастеров по конкретной услуге
 * @param serviceId - ID услуги
 * @param cityId - ID города
 * @param minRating - минимальный рейтинг мастера (не реализовано)
 * @param isOnline - возвращать только пользователей онлайн
 * @returns Список ID мастеров, оказывающих данную услугу
 */
export async function getContractorsByService({ serviceId, cityId, minRating, isOnline }: {
  serviceId: number;
  cityId: number;
  minRating?: number;
  isOnline?: boolean;
}): Promise<number[]> {
  const data = {
    action: "getContractorsByService",
    serviceId,
    cityId,
    isOnline: isOnline ? 1 : 0
  };
  const payload = {
    is_var: 1,
    s_t_data: JSON.stringify(data)
  };
  const result = await post('script/template/repair_api', payload);
  if (Array.isArray(result)) {
    return result.reduce((ret, id) => {
      if (isFinite(id)) ret.push(Number(id));
      return ret;
    }, [] );
  }
  else return [];
};

// ==================== 2. Управление заказами ====================

/**
 * Создать новую поездку
 * @param TripCreationData - Данные для создания поездки
 * @returns ID созданной поездки
 */
export async function createTrip(data: TripCreationData): Promise<number | null> {
  if (!data.b_start_datetime) data.b_start_datetime = 'any';
  if (!data.b_max_waiting) data.b_max_waiting = 604800;
  if (!data.b_payment_way) data.b_payment_way = 1;

  const result = await post<{b_id?: string | number}>('drive', { data });
  const b_id = result.b_id && Number(result.b_id);
  if (Number.isFinite(b_id)) return b_id as number;
  else return null;
}

/**
 * Получить список поездок клиента или водителя с фильтрацией по статусу
 * @param status - Статус заказов для фильтрации
 * @returns Список поездок
 */
export async function getTrips(status: GetTripsState): Promise<TripData[]> {
  const path = [
    "get",
    "now",
    "",
    "archive"
  ];
  const result = await post<{booking: Record<number, TripData>}>(`drive/${path}`, { fields: '000000006' });
  if (result?.booking && 'object' === typeof result.booking) return Object.values(result.booking);
  else return [];
}

/**
 * Получить список поездок по их ID
 * @param tripIds - массив ID поездок
 * @returns Список поездок
 */
export async function getTripsById(tripIds: number[]): Promise<{ data: TripData[], authUserId: number }> {
  if (!tripIds.length) return { data: [], authUserId: 0 };
  const result = await postWithAuthUser<{booking: Record<number, TripData>}>(
    `drive/get/${tripIds}`,
    { fields: '000000006' }
  );
  const data =
    result?.booking && 'object' === typeof result.booking ?
    Object.values(result.booking) : [];
  const auth_user = result?.auth_user as { u_id: string };
  const authUserId = Number(auth_user?.u_id ?? 0);
  return { data, authUserId };
}

/**
 * Редактировать поездку (доступно в определённых статусах)
 * @param tripId - ID поездки
 * @param updates - Обновленные данные поездки
 * @returns Промис, который разрешается после успешного обновления
 */
export async function updateTrip(tripId: number, updates: TripEditData): Promise<void> {
  const { b_options, c_options, ...rest } = updates;
  const formattedData: Record<string, unknown> = rest;

  if (b_options) {
    const formattedDetails = Object.entries(b_options).map(([key, value]) => {
      if (value === undefined) value = null;
      return ['=', [key], value];
    });

    formattedData.b_options = formattedDetails;
  }

  if (c_options) {
    const formattedDetails = Object.entries(c_options).map(([key, value]) => {
      if (value === undefined) value = null;
      return ['=', [key], value];
    });

    formattedData.c_options = formattedDetails;
  }

  return post<void>(`drive/get/${tripId}`, { action: 'edit', data: formattedData });
}

/**
 * Отменить поездку (для клиента).
 * Поездка отменяется полностью.
 * @param tripId - ID поездки
 * @param reason - Причина отмены
 * @returns Промис, который разрешается после успешной отмены
 */
export async function cancelTripByClient(tripId: number, reason: string): Promise<void> {
  const payload = {
    action: 'set_cancel_state',
    cancel_states: '2',
    reason
  };

  return post<void>(`drive/get/${tripId}`, payload);
}

/**
 * Отменить поездку (для водителя).
 * Если поездка ещё не начата, только открепляет водителя от этой поездки. Начатая поездка отменяется полностью.
 * @param tripId - ID поездки
 * @param reason - Причина отмены
 * @returns Промис, который разрешается после успешной отмены
 */
export async function cancelTripByDriver(tripId: number, reason: string): Promise<void> {
  const payload = {
    action: 'set_cancel_state',
    cancel_states: '3',
    reason
  };

  return post<void>(`drive/get/${tripId}`, payload);
}

// ==================== 3. Работа с предложениями (откликами мастеров) ====================

/**
 * Отправить предложение по поездке (для клиента)
 * @param tripId - ID поездки
 * @param userId - ID водителя
 * @returns Промис, который разрешается после успешного обновления
 */
export async function inviteDriver(tripId: number, userId: number): Promise<void> {
  return post<void>(`drive/get/${tripId}`, { action: 'set_offer', u_id: userId });
}

/**
 * Принять предложение от клиента (для водителя)
 * @param tripId - ID поездки
 * @param options - дополнительные параметры водителя в контексте поездки
 * @returns Промис, который разрешается после успешного обновления
 */
export async function acceptInvoice(tripId: number, options?: Record<string, any>): Promise<void> {
  const result = await post<{ car: Record<number, CarData> }>('user/authorized/car/driven');
  if (!result?.car) throw new Error('API Error');
  const carId = Object.keys(result.car)[0];
  if (!carId) throw new Error('User has no car');
  const data: any = {
    c_id: carId,
    c_payment_way: 1
  };
  if (options) data.c_options = options;
  return post<void>(`drive/get/${tripId}`, { action: 'set_performer', performer: 1, data });
}

/**
 * Отправить предложение по поездке (для водителя)
 * @param tripId - ID поездки
 * @param options - дополнительные параметры водителя в контексте поездки
 * @returns Промис, который разрешается после успешного обновления
 */
export async function createOffer(tripId: number, options?: Record<string, any>): Promise<void> {
  const result = await post<{ car: Record<number, CarData> }>('user/authorized/car/driven');
  if (!result?.car) throw new Error('API Error');
  const carId = Object.keys(result.car)[0];
  if (!carId) throw new Error('User has no car');
  const data: any = {
    c_id: carId,
    c_payment_way: 1
  };
  if (options) data.c_options = options;
  return post<void>(`drive/get/${tripId}`, { action: 'set_performer', performer: 0, data });
}

/**
 * Принять предложение от водителя (для клиента)
 * @param tripId - ID поездки
 * @param userId - ID водителя
 * @returns Промис, который разрешается после успешного обновления
 */
export async function acceptOffer(tripId: number, userId: number): Promise<void> {
  return post<void>(`drive/get/${tripId}`, { action: 'set_performer', u_id: userId });
}

// ==================== 4. Управление заказами ====================

/**
 * Установить статус поездки "машина подана"
 * @param tripId - ID поездки
 * @returns Промис, который разрешается после успешного обновления
 */
export async function setArriveState(tripId: number): Promise<void> {
  return post<void>(`drive/get/${tripId}`, { action: 'set_arrive_state' });
}

/**
 * Начать поездку
 * @param tripId - ID поездки
 * @returns Промис, который разрешается после успешного обновления
 */
export async function startTrip(tripId: number): Promise<void> {
  return post<void>(`drive/get/${tripId}`, { action: 'set_start_state' });
}

/**
 * Завершить поездку
 * @param tripId - ID поездки
 * @returns Промис, который разрешается после успешного обновления
 */
export async function finishTrip(tripId: number): Promise<void> {
  return post<void>(`drive/get/${tripId}`, { action: 'set_complete_state' });
}

/**
 * Оценить поездку
 * @param tripId - ID поездки
 * @param points - количество баллов
 * @returns Промис, который разрешается после успешного обновления
 */
export async function scoreTrip(tripId: number, points: number): Promise<void> {
  return post<void>(`drive/get/${tripId}`, { action: 'set_rate', value: points });
}
