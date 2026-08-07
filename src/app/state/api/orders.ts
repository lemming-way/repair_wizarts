import { post } from './request';

/** Статус заказа на бэкенде */
export const enum OrderStatus {
  New = 1,
  Assigned,
  Cancelled,
  Completed,
  Inactive,
  Offering
};

/** Статус исполнителя на бэкенде */
export const enum ContractorStatus {
  Offering = 1,
  Cancelled,
  Assigned,
  Waiting,
  Driving,
  Completed
};

/** Структура данных заказа от бэкенда */
export type OrderRecord = {
  /** Идентификатор заказа */
  id: number;
  /** Идентификатор клиента */
  client: number;
  /** Идентификатор мастера */
  contractor: number | null;
  /** ID города заказа */
  city: number | null;
  /** Адрес заказа */
  address: string;
  /** Широта точки заказа */
  latitude: number | null;
  /** Долгота точки заказа */
  longitude: number | null;
  /** Статус заказа */
  order_status: number,
  /** Статус исполнителя */
  contractor_status: number | null,
  /** Тип поездки market / direct */
  is_direct: 0 | 1;
  /** Оценка заказа клиентом */
  client_rating: number | null;
  /** Оценка заказа мастером */
  contractor_rating: number | null;
  /** Дата и время создания заказа */
  created_at: string;
  /** Дата и время одобрения мастера */
  appointed_at: string | null;
  /** Дата и время начала работы */
  started_at: string | null;
  /** Дата и время завершения работы */
  finished_at: string | null;
  /** Дата и время отмены заказа */
  canceled_at: string | null;
  /** Причина отмены заказа клиентом или мастером в случае прямого заказа */
  cancel_reason: string | null;
  /** Дата и время завершения заказа */
  completed_at: string | null;
  /** Предложенная цена */
  desired_price: number;
  /** Цена мастера */
  contractor_price: number | null;
  /** Согласованная цена */
  agreed_price: number | null;
  /** Список мастеров, связанных с заказом, возвращается для пользователя-клиента */
  contractor_offers?: ContractorRecord[] | null;
  /** Предложение мастера, возвращается для пользователя-мастера */
  contractor_offer?: ContractorRecord | null;
  /** Количество мастеров, связанных с заказом, возвращается для пользователя-мастера */
  offers_count?: number;
  /** Идентификатор способа оплаты */
  payment_way: number;
  /** Мастер, которому предложен заказ - только для прямых заказов */
  invited_contractor: number | null;
  /** Заказанная услуга по классификатору */
  product: number | null;
  /** Список заказанных услуг по прайсу мастера - только для прямых заказов */
  services: OrderService[] | null;
  /** Описание заказа */
  description: string | null;
  /** Прикреплённые изображения */
  images: number[] | null;
};

type OrderService = {
  service: string;
  price: number;
};

/** Предложение мастера от бэкенда */
type ContractorRecord = {
  /** Идентификатор пользователя */
  id: number;
  /** Цена мастера */
  price: number;
  /** Комментарий к предложению мастера */
  comment: string | null;
  ready_in: {
    /** Единица времени готовности мастера */
    unit: string;
    /** Время готовности мастера */
    value: number;
  } | null;
  /** Дата и время создания предложения */
  created_at: string;
};

/** Структура данных для создания заказа */
export type OrderCreationParams = {
  /** ID города заказа */
  cityId: number;
  /** Адрес заказа */
  address: string;
  /** Предложенная цена */
  price: number;
  /** Мастер, которому предложен заказ - только для прямых заказов */
  contractorId?: number;
  /** Заказанная услуга по классификатору */
  productId: number;
  /** Список заказанных услуг по прайсу мастера - только для прямых заказов */
  services?: string[];
  /** Описание заказа */
  description: string;
  /** Прикреплённые изображения */
  attachments?: File[];
};

/** Параметр для выборки заказов */
export const OrdersFilter = {
  market: 1,
  direct: 2,
  new: 4,
  current: 8,
  finished: 16
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type OrdersFilter = typeof OrdersFilter[keyof typeof OrdersFilter];

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
      const numId = Number(id);
      if (Number.isInteger(numId) && numId > 0) ret.push(numId);
      return ret;
    }, [] );
  }
  else return [];
};

// createOrder

/**
 * Получить список ID заказов клиента или мастера с фильтрацией по статусу
 * @param status - Статус заказов для фильтрации
 * @returns Промис, который разрешается со списком ID заказов
 */
export function getOrderIds(filter: OrdersFilter): Promise<number[]> {
  return post<number[]>('script/template/repair_api', { is_var: 1, s_t_data: { action: 'getOrderIds', flags: filter } });
}

/**
 * Получить список заказов по их ID
 * @param orderIds - массив ID заказов
 * @returns Промис, который разрешается со списком заказов
 */
export async function getOrdersByIds(orderIds: number[]): Promise<OrderRecord[]> {
  if (!orderIds.length) return [];
  const result = await post<OrderRecord[]>(
    'script/template/repair_api',
    { is_var: 1, s_t_data: { action: 'getOrdersByIds', order_ids: orderIds } }
  );
  const data = result && Array.isArray(result) ? result : [];
  return data;
}

/**
 * Создать новый заказ.
 * Вызывается клиентом.
 * @param options - параметры создаваемого заказа
 * @returns Промис, который разрешается с ID созданного заказа
 */
export async function createOrder({ attachments, ...data }: OrderCreationParams): Promise<number> {
  const payload = { is_var: 1, s_t_data: { ...data, action: 'createOrder' } };
  if (attachments) {
    let index = 0;
    for (const file of attachments) {
      payload[`attachments[${index}]`] = file;
      index++;
    }
  }
  const result = await post<{id: number}>('script/template/repair_api', payload);
  const id = Number(result.id);
  if (!Number.isInteger(id) || id <= 0) throw new Error('No order ID returned');
  return id;
}

export type OrderUpdateParams = {
  id: number,
  address?: string;
  description?: string;
  attachments?: Array<File | number>;
  price?: number;
}

/**
 * Изменить данные заказа.
 * Вызывается клиентом. Можно менять описание, цену, адрес и фотографии к заказу, но только до одобрения исполнителя.
 * @param options - изменяемые параметры заказа
 * @returns Промис, который после успешного обновления данных
 */
export function updateOrder({ attachments, ...data }: OrderUpdateParams): Promise<void> {
  const fileAttachments = {};
  const idAttachments = {};
  if (attachments) {
    let index = 0;
    for (const fileOrNumber of attachments) {
      if (fileOrNumber instanceof Blob) fileAttachments[`attachments[${index}]`] = fileOrNumber;
      else idAttachments[index] = fileOrNumber;
      index++;
    }
    (data as any).attachments = idAttachments;
  }
  const payload = { is_var: 1, s_t_data: { ...data, action: 'updateOrder' }, ...fileAttachments };
  return post<void>('script/template/repair_api', payload);
}
