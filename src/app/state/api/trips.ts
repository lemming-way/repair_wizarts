/**
 * Модуль api для работы с заказами
 *
 * @summary
 * **Типы:**
 * TripState, DriverState, GetTripsState, TripData, DriverData, DriverOffer, TripCreationData, TripEditData
 *
 * **Получение данных:**
 * getContractorsByProduct, getTripIds, getTripsByIds
 *
 * **Изменение данных:**
 * createTrip, updateTrip, cancelTripByClient, cancelTripByDriver, inviteDriver, acceptInvoice, createOffer,
 * acceptOffer, setArriveState, startTrip, finishTrip, scoreTrip
 */
import { post } from './request';

// ==================== Типы данных ====================

export enum TripState {
  New = 1,
  Assigned,
  Cancelled,
  Completed,
  Inactive,
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
  b_id: number;
  /** Идентификатор клиента */
  u_id: number;
  /** ID города начала поездки */
  city_start: number | null;
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
  b_state: number;
  /** Поездка доступна только назначенным водителям */
  b_only_offer: 0 | 1;
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
  /** Список водителей, связанных с поездкой */
  drivers: DriverData[] | null;
  /** Количество водителей, связанных с поездкой. Возвращается для пользователя-водителя,
   *  потому что массив drivers не будет содержать данных других водителей.
   */
  drivers_count: number | null;
  /** Идентификатор способа оплаты (для клиента) */
  b_payment_way: number | null;
  /** Идентификатор платежной карты (для клиента) */
  b_payment_card: number | null;
  /** Список предложений водителям */
  b_offers: DriverOffer[] | null;
  /** Предложена ли поездка для этого водителя (1 или 0) */
  b_offer: 0 | 1 | null;
}

/**
 * Структура данных, представляющая водителя в контексте поездки
 */
export type DriverData = {
  /** Идентификатор водителя */
  u_id: number;
  /** Идентификатор машины */
  c_id: number;
  /** Идентификатор статуса водителя в поездке */
  c_state: number;
  /** Идентификатор способа оплаты (для этого водителя) */
  c_payment_way: number;
  /** Идентификатор платежной карты (для этого водителя) */
  c_payment_card: number | null;
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
 * Структура данных, представляющая предложение водителю
 */
export interface DriverOffer {
  /** Идентификатор водителя */
  u_id: number;
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

/** Параметр для выборки поездок */
export const TripFilter = {
  public: 1,
  offer: 2,
  now: 4,
  current: 8,
  archive: 16
};

// ==================== 1. Выбор мастера ====================

/**
 * Получить список мастеров по конкретной услуге
 * @param productId - ID услуги
 * @param cityId - ID города
 * @param minRating - минимальный рейтинг мастера (не реализовано)
 * @param isOnline - возвращать только пользователей онлайн
 * @returns Промис, который разрешается со списком ID мастеров, оказывающих данную услугу
 */
export async function getContractorsByProduct({ productId, cityId, minRating, isOnline }: {
  productId: number;
  cityId: number;
  minRating?: number;
  isOnline?: boolean;
}): Promise<number[]> {
  const data = {
    action: "getContractorsByProduct",
    productId,
    cityId,
    isOnline: isOnline ? 1 : 0
  };
  const payload = {
    is_var: 1,
    s_t_data: data
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
 * @returns Промис, который разрешается с ID созданной поездки
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
 * @returns Промис, который разрешается со списком поездок
 */
export function getTripIds(filter: number): Promise<number[]> {
  return post<number[]>('script/template/repair_api', { is_var: 1, s_t_data: { action: 'getTripIds', flags: filter } });
}

/**
 * Получить список поездок по их ID
 * @param tripIds - массив ID поездок
 * @returns Промис, который разрешается со списком поездок
 */
export async function getTripsByIds(tripIds: number[]): Promise<TripData[]> {
  if (!tripIds.length) return [];
  const result = await post<TripData[]>(
    'script/template/repair_api',
    { is_var: 1, s_t_data: { action: 'getTripsByIds', order_ids: tripIds } }
  );
  const data = result && Array.isArray(result) ? result : [];
  return data;
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

console.log('drive/get', tripId, 'edit', formattedData);
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
export async function acceptInvoice(tripId: number, carId: number, options?: Record<string, any>): Promise<void> {
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
export async function createOffer(tripId: number, carId: number, options?: Record<string, any>): Promise<void> {
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
