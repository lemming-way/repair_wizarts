/**
 * Модуль для работы с глобальным состоянием заказов
 *
 * @summary
 * **Типы данных:**
 * Order, TimeUnit, Offer, OrderStatus, OrderCreationData, OrderUpdateData, CreateOfferData
 *
 * **Функции, влияющие на глобальное состояние:**
 * useCreateOrder, useUpdateOrder, useCancelOrder, useCreateOffer, useUpdateOffer, useAcceptOffer,
 * useRevokeOffer, useAcceptInvoice, useStartOrderWork, useCompleteOrderByContractor, useVerifyOrderCompletion
 *
 * **Функции, не влияющие на глобальное состояние:**
 * useContractors, useClientOrders, useFinishedOrders, useOrdersByIds, useContractorOrders, useAvailableOrders
 */
import {
  QueryClient,
  UseQueryResult,
  useQuery,
  useQueries,
  useMutation
} from '@tanstack/react-query';

import CONFIG from 'config';
import { fileToBase64, isImage } from 'app/shared/lib/utilities';
import * as FileAPI from './api/dropbox';
import * as TripAPI from './api/trips';
import { UserProfile, UserRole, useUser, useUsersByIds } from './user';

// ==================== Типы данных ====================

export type Order = {
  id: number;
  clientId: number;
  contractorId?: number;
  city: number;
  address: string;
  serviceId: number;
  status: OrderStatus;
  description: string;
  agreedPrice?: number;
  desiredPrice: number;
  contractorPrice?: number;
  createdAt: Date;
  updatedAt: Date;
  attachments: number[];
  contractorOffers: Offer[];
}

export enum TimeUnit {
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  WEEKS = 'weeks'
}

export type Offer = {
  contractorId: number;
  price: number;
  comment: string;
  readyIn: {
    value: number,
    unit: TimeUnit
  };
  createdAt: Date;
}

//~ export type Review = {
  //~ id: number;
  //~ orderId: number;
  //~ authorId: number;
  //~ rating: number;
  //~ comment: string;
  //~ createdAt: string;
  //~ // ... другие поля
//~ }

export enum OrderStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  REQUESTED = 'requested',
  CONTRACTOR_CONFIRMED = 'contractor_confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  AWAITING_PAYMENT = 'awaiting_payment',
  PAID = 'paid',
  CLOSED = 'closed',
  DISPUTE = 'dispute',
  CANCELLED = 'cancelled'
}

export const orderStatusString = {
  [OrderStatus.PUBLISHED]: 'Awaiting offer',
  [OrderStatus.REQUESTED]: 'Offered to the contractor',
  [OrderStatus.CONTRACTOR_CONFIRMED]: 'Contractor confirmed',
  [OrderStatus.IN_PROGRESS]: 'In progress',
  [OrderStatus.COMPLETED]: 'Completed',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.CLOSED]: 'Finished',
};

const EMPTY_ARRAY = Object.freeze([]);

// ==================== 1. Выбор мастера ====================

/**
 * Получить список мастеров по конкретной услуге
 * @param service - ID услуги
 * @param city - ID города
 * @param rating - минимальный рейтинг мастера (не реализовано)
 * @param isOnline - возвращать только пользователей онлайн
 * @returns Объект, содержащий объединенное состояние запросов React Query и массив `users` с данными
 *          успешно полученных мастеров, оказывающих данную услугу
 */
export function useContractors({ service, city, rating, isOnline }: {
  service: number;
  city: number;
  rating?: number;
  isOnline?: boolean;
}) {
  const { user } = useUser() as { user: UserProfile };
  const queryResult = useQuery({
    queryKey: [ 'contractors', service, city, rating, isOnline ],
    queryFn: () => TripAPI.getContractorsByService({ serviceId: service, cityId: city, minRating: rating, isOnline }),
    staleTime: CONFIG.API?.userDataStaleTime ?? Infinity,
    enabled: !!user.id  // Доступно только авторизованному пользователю
  });

  const contractors = queryResult.data || [];
  return useUsersByIds(contractors);
}

//~ /**
 //~ * Получить отзывы о мастере
 //~ * @param contractorId - ID мастера
 //~ * @param page - Номер страницы (для пагинации)
 //~ * @param limit - Количество отзывов на странице
 //~ * @returns Список отзывов о мастере
 //~ */
//~ declare function getContractorReviews(
  //~ contractorId: number,
  //~ page?: number,
  //~ limit?: number
//~ ): Promise<{ reviews: Review[]; total: number; page: number }>;

// ==================== 2. Управление заказами (клиентская сторона) ====================

export type OrderCreationData = {
  /** ID города */
  cityId: number;
  /** адрес выполнения работ */
  address: string;
  /** ID заказанной услуги */
  serviceId: number;
  /** ID выбранного мастера */
  contractorId?: number;
  /** Комментарий к заказу */
  description: string;
  /** Фотографии к заказу */
  attachments?: File[];
  /** Предложенная стоимость работ */
  price: number;
}

export type OrderUpdateData = {
  orderId: number,
  address?: string;
  description?: string;
  attachments?: Array<File | number>;
  desiredPrice?: number;
}

/**
 * Создать новый заказ
 * @param cityId - ID города
 * @param address - адрес выполнения работ
 * @param serviceId - ID заказанной услуги
 * @param contractorId - ID выбранного мастера
 * @param description - Комментарий к заказу
 * @param attachments - Фотографии к заказу
 * @param price - Предложенная стоимость работ
 * @returns ID созданного заказа
 */
async function createOrder({
  cityId,
  address,
  serviceId,
  contractorId,
  description,
  attachments,
  price
}: OrderCreationData): Promise<number | null> {
  const orderOptions: Record<string, any> = {
    service: serviceId,
    description,
    desiredPrice: price
  };

  // todo: Здесь возможно появление файлов, не связанных с заказами. Нужно предусмотреть очистку.
  if (attachments?.length) {
    const images = await Promise.all(
      attachments
        .filter(file => isImage(file.type))
        .map(async file => ({ name: file.name, data: await fileToBase64(file) }))
    );
    const uploaded = await Promise.all(
      images.map(image => FileAPI.uploadFile(image.name, image.data, 0))
    );
    orderOptions.images = uploaded.filter(Boolean);
  }

  const orderCreationData: TripAPI.TripCreationData = {
    city_start: cityId,
    b_start_address: address,
    b_start_datetime: 'any',
    b_max_waiting: CONFIG.ORDERS?.initialLifetime ?? 604800,
    b_options: orderOptions,
    b_payment_way: 1,
    b_only_offer: contractorId ? 1 : 0
  }

  const orderId = await TripAPI.createTrip(orderCreationData);
  if (contractorId && orderId) {
    await TripAPI.inviteDriver(orderId, contractorId);
  }

  return orderId;
}

/**
 * Возвращает мутацию для создания заказа.
 * Хук может быть вызван без дополнительных условий, но создание заказа доступно только авторизованному клиенту.
 */
export function useCreateOrder() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async (orderData: OrderCreationData, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.role !== UserRole.Client) throw new Error('User must be a client.');
      if (!orderData.cityId || !orderData.address || !orderData.serviceId) throw new Error('Mandatory parameter is empty.');

      const ret = await createOrder(orderData);
      client.invalidateQueries({ queryKey: [ 'orders', user.id, 'active' ] });
      return ret;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    createOrder: mutateAsync
  }
}

/**
 * Преобразует сырые данные API в структуру Order
 * @param rawData Данные поездок от API
 * @returns Список заказов
 */
function parseOrders(userId: number, rawData: Awaited<ReturnType<typeof TripAPI.getTrips>>): Order[] {
  const result = rawData.reduce((ret, trip) => {
    if (trip.b_id && trip.u_id) {
      let c_state = 0;  // статус назначенного исполнителя исполнителя, если есть
      // очищаем список прикреплённых файлов
      const images = Array.isArray(trip.b_options?.images) ? trip.b_options.images : [];
      const attachments = images
        .map(id => Number(id || 0))
        .filter(Number.isFinite);

      // запоняем основные свойства заказа
      const order: Partial<Order> = {
        id: Number(trip.b_id),
        clientId: Number(trip.u_id),
        city: Number(trip.city_start ?? 0),
        address: String(trip.b_start_address ?? ''),
        serviceId: Number(trip.b_options?.service ?? 0),
        description: String(trip.b_options?.description ?? ''),
        desiredPrice: Number(trip.b_options?.desiredPrice ?? 0),
        createdAt: new Date(String(trip.b_created ?? '')),
        attachments,
        contractorOffers: []
      };
      // отбрасываем бракованные данные
      if (!order.id || !order.clientId || !order.serviceId || !order.city) {
        return ret;
      }
      order.updatedAt = order.createdAt;  // начальное значение, будет меняться
      const b_state = Number(trip.b_state);  // внутренний статус заказа в API
      // обрабатываем исполнителей, откликнувшихся на заказ
      if (trip.drivers?.length) {
        for (const driver of trip.drivers) {
          const d_id = Number(driver.u_id);
          const d_state = Number(driver.c_state ?? 0);
          const d_price = Number(driver.c_options?.price ?? 0);
          if (d_state === 1) {
            // не назначенный исполнитель
            order.contractorOffers!.push({
              contractorId: d_id,
              price: d_price,
              comment: String(driver.c_options?.comment ?? ''),
              readyIn: driver.c_options?.readyIn && 'object' === typeof driver.c_options.readyIn ?
                driver.c_options.readyIn as { value: number; unit: TimeUnit; } :
                { value: 0, unit: TimeUnit.HOURS },
              createdAt: new Date(String(driver.c_becomed_candidate ?? ''))
            });
            if (d_id === userId && b_state === 1) {
              // текущий пользователь является мастером, откликнувшимся на заказ
              order.contractorPrice = d_price;
            }
          }
          else if (d_state === 3 || d_state === 4 || d_state === 5 || d_state === 6) {
            // назначенный исполнитель
            c_state = d_state;

            if (d_state === 3) order.updatedAt = new Date(String(driver.c_appointed ?? ''));
            else if (d_state === 4) order.updatedAt = new Date(String(driver.c_arrived ?? ''));
            else if (d_state === 5) order.updatedAt = new Date(String(driver.c_started ?? ''));
            else order.updatedAt = new Date(String(driver.c_completed ?? ''));

            order.contractorId = d_id;
            order.contractorPrice = d_price;
          }
        }
      }
      // проверяем, предложен ли заказ конкретному мастеру
      if (!order.contractorId) {
        if (trip.b_offers?.[0]?.u_id) order.contractorId = Number(trip.b_offers[0].u_id);
        else if (trip.b_offer) order.contractorId = userId;
      }

      // маппинг статусов
      if (b_state === 1) order.status = OrderStatus.PUBLISHED;
      else if (b_state === 6) order.status = OrderStatus.REQUESTED;
      else if (b_state === 2) {
        if (c_state === 4) order.status = OrderStatus.IN_PROGRESS;
        if (c_state === 5) order.status = OrderStatus.COMPLETED;
        else order.status = OrderStatus.CONTRACTOR_CONFIRMED;
        order.agreedPrice = order.contractorPrice;
      }
      else if (b_state === 3) {
        order.status = OrderStatus.CANCELLED;
        order.updatedAt = new Date(String(trip.b_canceled ?? ''));
      }
      else if (b_state === 4) {
        order.status = OrderStatus.CLOSED;
        order.agreedPrice = order.contractorPrice;
      }

      ret.push(order as Order);
    }

    return ret;
  }, [] as Order[]);

  return result;
}

/**
 * Получить список заказов с фильтрацией по статусу
 * @param status Статус заказов для фильтрации
 * @returns Список заказов
 */
async function getOrders(client: QueryClient, userId: number, status: TripAPI.GetTripsState): Promise<Order[]> {
  const rawData = await TripAPI.getTrips(status);
  const orders = parseOrders(userId, rawData);
  for (const order of orders) {
    client.setQueryData([ 'orders', userId, order.id ], order);
  }
  return orders;
}

/**
 * Получить список активных заказов клиента
 * @returns Объект с состоянием запроса React Query и объектом `orders`, содержащим список заказов.
 */
export function useClientOrders() {
  const { user } = useUser() as { user: UserProfile };
  const queryResult = useQuery({
    queryKey: [ 'orders', user.id, 'active' ],
    queryFn: ({ client }) => getOrders(client, user.id, TripAPI.GetTripsState.Current),
    staleTime: CONFIG.API?.ordersDataStaleTime ?? 120000,
    refetchInterval: CONFIG.API?.ordersDataRefetchTime ?? 120000,
    enabled: !!user.id && user.role === UserRole.Client  // Доступно только клиенту
  });

  const { data, ...ret } = queryResult;
  const orders = data?.filter(order => order.clientId === user.id) || EMPTY_ARRAY;
  return {
    ...ret,
    orders
  };
}

/**
 * Получить список завершённых и отменённых заказов пользователя (в роли как клиента, так и мастера)
 * @returns Объект с состоянием запроса React Query и объектом `orders`, содержащим список заказов.
 */
export function useFinishedOrders() {
  const { user } = useUser() as { user: UserProfile };
  const queryResult = useQuery({
    queryKey: [ 'orders', user.id, 'finished' ],
    queryFn: ({ client }) => getOrders(client, user.id, TripAPI.GetTripsState.Finished),
    staleTime: CONFIG.API?.ordersDataStaleTime ?? 120000,
    refetchInterval: CONFIG.API?.ordersDataRefetchTime ?? 120000,
    enabled: !!user.id  // Доступно только авторизованному пользователю
  });

  const { data, ...ret } = queryResult;
  const orders = data || EMPTY_ARRAY;
  return {
    ...ret,
    orders
  };
}

let ordersToFetch: {
  userId: number;
  orderId: number;
  resolve: (order: Order | null) => void;
  reject: (error: unknown) => void;
}[] = [];
let ordersFetchTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Получить заказ пользователя по ID
 * Использует батчинг для объединения нескольких запросов в один API вызов.
 * @param orderId ID заказа
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param queryKey Ключ запроса, содержащий ID пользователя и ID заказа (например, ['orders', 8, 123]).
 * @returns Промис, который разрешается с объектом Order или null
 * @throws {Error} Если произошла ошибка при запросе к API или заказ не найден.
 */
function fetchOrderById({ queryKey }: { queryKey: (string | number)[] }): Promise<Order | null> {
  const userId = Number(queryKey[1]);
  const orderId = Number(queryKey[2]);
  if (!userId || !orderId) return Promise.resolve(null);

  if (ordersFetchTimeout) clearTimeout(ordersFetchTimeout);
  ordersFetchTimeout = setTimeout(async () => {
    const resolvers = ordersToFetch;
    ordersToFetch = [];
    ordersFetchTimeout = null;

    const orderIdsToFetch = [...new Set(resolvers.map(item => item.orderId))];

    if (orderIdsToFetch.length === 0) {
      return;
    }

    try {
      const { data, authUserId } = await TripAPI.getTripsById(orderIdsToFetch);
      const orders = data && authUserId ? parseOrders(authUserId, data) : [];
      const ordersMap = Object.fromEntries(orders.map(order => [order.id, order]));
      resolvers.forEach(item => {
        const order = ordersMap[item.orderId];
        if (order && authUserId === item.userId) {
          item.resolve(order);
        } else {
          item.resolve(null);
        }
      });
    } catch (error) {
      resolvers.forEach(item => item.reject(error));
    }
  }, 10);

  return new Promise((resolve, reject) => {
    ordersToFetch.push({ userId, orderId, resolve, reject });
  });
}

function combineFetchOrderResults(results: UseQueryResult<Awaited<Order | null>, unknown>[]) {
  // Агрегируем состояния загрузки и ошибок
  const ret = {
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null as unknown,
    isSuccess: true,
    orders: [] as Order[]
  };

  for (const query of results) {
    ret.isLoading ||= query.isLoading;
    ret.isFetching ||= query.isFetching;
    if (query.isError && !ret.error) {
      ret.isError = true;
      ret.error = query.error;
    }
    ret.isSuccess &&= query.isSuccess;
    if (query.data) ret.orders.push(query.data as Order);
  }

  return ret;
}

/**
 * Получить список заказов пользователя по ID (в роли как клиента, так и мастера)
 * @param ids Список ID заказов
 * @returns Объект, содержащий объединенное состояние запросов React Query
 *          и массив `orders` с данными успешно полученных заказов.
 */
export function useOrdersByIds(ids: number[]) {
  const { user } = useUser() as { user: UserProfile };
  const queries = ids.map(orderId => ({
    queryKey: [ 'orders', user.id, orderId ],
    queryFn: fetchOrderById,
    staleTime: CONFIG.API?.ordersDataStaleTime ?? 120000,
    refetchInterval: CONFIG.API?.ordersDataRefetchTime ?? 120000,
    enabled: !!user.id  // Доступно только авторизованному пользователю
  }));

  return useQueries({
    queries,
    combine: combineFetchOrderResults
  });
}

/**
 * Редактировать заказ (доступно в определенных статусах)
 * @param orderId - ID заказа
 * @param address Адрес выполнения услуги
 * @param description Описание заказа
 * @param attachments Изображения к заказу
 * @param desiredPrice Предложенная стоимость работ
 * @returns Промис, который разрешается после успешного обновления данных
 */
async function updateOrder({ orderId, address, description, attachments, desiredPrice }: OrderUpdateData) {
  const updates: TripAPI.TripEditData = {};
  const ret: { updatedFiles: number[]; deletedFiles: number[] } = { updatedFiles: [], deletedFiles: [] };
  if (address !== undefined) updates.b_start_address = address;
  if (description !== undefined || attachments || desiredPrice !== undefined) {
    updates.b_options = {};
    if (description !== undefined) updates.b_options.description = description;
    if (desiredPrice !== undefined) updates.b_options.desiredPrice = desiredPrice;
    if (attachments) {
      const fileAttachments = attachments.filter(file => file instanceof File);
      const idAttachments = attachments.filter(file => 'number' === typeof file);

      const oldData = await TripAPI.getTripsById([ orderId ]);
      let oldFilesInfo = [] as (FileAPI.DropboxFileInfo | null)[];
      if (Array.isArray(oldData[0]?.b_options?.images)) {
        const oldIds = (oldData[0].b_options.images ?? [])
          .map(Number)
          .filter(id => !!id && Number.isFinite(id) && !idAttachments.includes(id));
        oldFilesInfo = await FileAPI.getFilesInfo(oldIds);
      }
      // todo: Здесь возможна рассинхронизация загруженных файлов и данных заказа.
      //       Нужно предусмотреть очистку или сделать транзакцию на бэкенде.
      const newAttachments = idAttachments;
      if (fileAttachments.length) {
        const images = await Promise.all(
          fileAttachments
            .filter(file => isImage(file.type))
            .map(async file => ({ name: file.name, data: await fileToBase64(file) }))
        );
        const uploads = images.map(image => {
          const fileIndex = oldFilesInfo.findIndex(file => file?.json?.name === image.name);
          if (fileIndex >= 0) {
            const oldId = Number(oldFilesInfo[fileIndex]!.dl_id || 0);
            oldFilesInfo[fileIndex] = null;
            ret.updatedFiles.push(oldId);
            return FileAPI.updateFile(oldId, image.data);
          }
          return FileAPI.uploadFile(image.name, image.data, 0);
        });
        const deletedIds = oldFilesInfo.filter(Boolean).map(file => Number(file!.dl_id));
        ret.deletedFiles = deletedIds;
        const deletes = deletedIds.map(id => FileAPI.deleteFile(id));
        if (deletes.length) {
          await Promise.all(deletes);
        }
        const uploaded = (await Promise.all(uploads)).filter(Boolean) as number[];
        newAttachments.push(...uploaded);
        updates.b_options.images = newAttachments;
      }
    }
  }
  await TripAPI.updateTrip(orderId, updates);
  return ret;
}

/**
 * Возвращает мутацию для редактирования заказа.
 * Хук может быть вызван без дополнительных условий, но изменение заказа доступно только авторизованному клиенту.
 */
export function useUpdateOrder() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async ({ orderId, address, description, attachments, desiredPrice }: OrderUpdateData, { client }) => {
      if (
        address === undefined &&
        description === undefined &&
        attachments === undefined &&
        desiredPrice === undefined
      ) return;
      if (!user.id) throw new Error('User must be authorized.');
      if (user.role !== UserRole.Client) throw new Error('User must be a client.');
      if (!orderId) throw new Error('Order ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'orders', user.id, orderId ],
        queryFn: fetchOrderById,
        staleTime: CONFIG.API?.ordersDataStaleTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.clientId !== user.id) throw new Error('User is not the customer.');
      if (
        ![ OrderStatus.DRAFT, OrderStatus.PUBLISHED, OrderStatus.REQUESTED ]
        .includes(order.status)
      ) {
        throw new Error('Incorrect order state.');
      }
      if (
        (address === undefined || address === order.address) &&
        (description === undefined || description === order.description) &&
        (desiredPrice === undefined || desiredPrice === order.desiredPrice) &&
        !attachments
      ) {
        return;
      }

      const results = await updateOrder({ orderId, address, description, attachments, desiredPrice });
      for (const id of results.deletedFiles) {
        client.removeQueries({ queryKey: [ 'files', id ] });
      }
      for (const id of results.updatedFiles) {
        client.invalidateQueries({ queryKey: [ 'files', id ] });
      }
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, 'active' ] });
      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    updateOrder: mutateAsync
  }
}

/**
 * Отменить заказ (клиентская сторона)
 * @param orderId - ID заказа
 * @param reason - Причина отмены
 * @returns Промис, который разрешается после успешной отмены
 */
function cancelOrderByClient(orderId: number, reason: string): Promise<void> {
  return TripAPI.cancelTripByClient(orderId, reason);
}

/**
 * Отменить заказ (сторона мастера)
 * @param orderId - ID заказа
 * @param reason - Причина отмены
 * @returns Промис, который разрешается после успешной отмены
 */
function cancelOrderByContractor(orderId: number, reason: string): Promise<void> {
  return TripAPI.cancelTripByDriver(orderId, reason);
}

/**
 * Возвращает мутацию для отмены заказа.
 * Хук может быть вызван без дополнительных условий, но отмена заказа доступна только авторизованному пользователю,
 * который является заказчиком или исполнителем данного заказа. Отмена возможна до начала выполнения заказа.
 * @todo: Добавить отмену после начала выполнения заказа с учётом согласования условий отмены.
 */
export function useCancelOrder() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async ({ orderId, reason } : { orderId: number, reason: string }, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (!orderId) throw new Error('Order ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'orders', user.id, orderId ],
        queryFn: fetchOrderById,
        staleTime: CONFIG.API?.ordersDataStaleTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (
        ![ OrderStatus.DRAFT, OrderStatus.PUBLISHED, OrderStatus.REQUESTED, OrderStatus.CONTRACTOR_CONFIRMED ]
        .includes(order.status)
      ) {
        throw new Error('Cannot cancel an ongoing order.');
      }

      if (user.role === UserRole.Contractor) {
        await cancelOrderByContractor(orderId, reason);
        client.invalidateQueries({ queryKey: [ 'orders', user.id, 'available' ] });
        client.invalidateQueries({ queryKey: [ 'orders', user.id, 'contractor' ] });
      }
      else {
        await cancelOrderByClient(orderId, reason);
        client.invalidateQueries({ queryKey: [ 'orders', user.id, 'active' ] });
        client.invalidateQueries({ queryKey: [ 'orders', user.id, 'finished' ] });
      }
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });
      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    cancelOrder: mutateAsync
  }
}

// ==================== 3. Работа с предложениями (откликами мастеров) ====================

export type CreateOfferData = {
  orderId: number,
  price: number;
  comment: string;
  readyIn: {
    value: number;
    unit: TimeUnit;
  }
}

/**
 * Отправить предложение по заказу (для мастера)
 * @param orderId - ID заказа
 * @param price - Стоимость работ
 * @param comment - Комментарий
 * @param readyIn - Срок начала работ
 * @returns Промис, который разрешается после размещения предложения
 */
function createOffer({ orderId, price, comment, readyIn }: CreateOfferData): Promise<void> {
  const options = {
    price,
    comment,
    readyIn
  };
  return TripAPI.createOffer(orderId, options);
}

/**
 * Возвращает мутацию создания предложения по заказу для мастера.
 * Хук может быть вызван без дополнительных условий, но создание предложения доступно только авторизованному мастеру.
 */
export function useCreateOffer() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async ({ orderId, price, comment, readyIn }: CreateOfferData, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.role !== UserRole.Contractor) throw new Error('User must be a contractor.');
      if (!orderId) throw new Error('Order ID not specified.');
      if (!price || !comment || !readyIn) throw new Error('Mandatory parameter is empty.');

      const order = await client.fetchQuery({
        queryKey: [ 'orders', user.id, orderId ],
        queryFn: fetchOrderById,
        staleTime: CONFIG.API?.ordersDataStaleTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.PUBLISHED) throw new Error('Incorrect order state.');
      if (order.contractorOffers.some(offer => offer.contractorId === user.id)) throw new Error('Offer already exists.');

      await createOffer({ orderId, price, comment, readyIn });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, 'contractor' ] });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, 'available' ] });
      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    createOffer: mutateAsync
  }
}

/**
 * Обновить предложение по заказу (для мастера)
 * @param offerId - ID предложения
 * @param price - Стоимость работ
 * @param comment - Комментарий
 * @param readyIn - Срок начала работ
 * @returns Промис, который разрешается после успешного обновления
 */
function updateOffer({ orderId, price, comment, readyIn }: Partial<CreateOfferData> & { orderId: number }): Promise<void> {
  if (price === undefined && comment === undefined && !readyIn) return Promise.resolve();
  const c_options = {} as Partial<CreateOfferData>;
  if (price !== undefined) c_options.price = price;
  if (comment !== undefined) c_options.comment = comment;
  if (readyIn !== undefined) c_options.readyIn = readyIn;
  return TripAPI.updateTrip(orderId, { c_options });
}

/**
 * Возвращает мутацию обновления предложения по заказу для мастера.
 * Хук может быть вызван без дополнительных условий, но обновления предложения доступно только авторизованному мастеру,
 * у которого есть предложение по данному заказу.
 */
export function useUpdateOffer() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async ({ orderId, price, comment, readyIn }: Partial<CreateOfferData>, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.role !== UserRole.Contractor) throw new Error('User must be a contractor.');
      if (!orderId) throw new Error('Order ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'orders', user.id, orderId ],
        queryFn: fetchOrderById,
        staleTime: CONFIG.API?.ordersDataStaleTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      const offer = order.contractorOffers.find(offer => offer.contractorId === user.id);
      if (order.status !== OrderStatus.PUBLISHED || !offer) throw new Error('Incorrect order state.');
      if (
        (price === undefined || offer.price === price) ||
        (comment === undefined || offer.comment === comment) ||
        (readyIn === undefined || (offer.readyIn.value === readyIn.value && offer.readyIn.unit === readyIn.unit))
      ) {
        return;
      }

      await updateOffer({ orderId, price, comment, readyIn });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, 'contractor' ] });
      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    updateOffer: mutateAsync
  }
}

/**
 * Принять предложение мастера (для клиента)
 * @param orderId - ID заказа
 * @param contractorId - ID мастера
 * @returns Промис, который разрешается после успешного назначения исполнителя
 */
function acceptOffer(orderId: number, contractorId: number): Promise<void> {
  return TripAPI.acceptOffer(orderId, contractorId);
}

/**
 * Возвращает мутацию назначения исполнителя по заказу.
 * Хук может быть вызван без дополнительных условий, но назначения исполнителя доступно только клиенту,
 * создавшему заказ.
 */
export function useAcceptOffer() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async ({ orderId, contractorId }: { orderId: number, contractorId: number }, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.role !== UserRole.Client) throw new Error('User must be a client.');
      if (!orderId) throw new Error('Order ID not specified.');
      if (!contractorId) throw new Error('Contractor ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'orders', user.id, orderId ],
        queryFn: fetchOrderById,
        staleTime: CONFIG.API?.ordersDataStaleTime ?? 120000
      });

      if (!order || order.clientId !== user.id) throw new Error('Order not found.');
      if (order.status !== OrderStatus.PUBLISHED) throw new Error('Incorrect order state.');
      if (order.clientId !== user.id) throw new Error('User is not the customer.');
      if (!order.contractorOffers.some(offer => offer.contractorId === contractorId)) throw new Error('No offer from the contractor.');

      await acceptOffer(orderId, contractorId);
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, 'active' ] });
      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    acceptOffer: mutateAsync
  }
}

/**
 * Отозвать предложение (для мастера)
 * @param orderId - ID заказа
 * @returns Промис, который разрешается после успешного отзыва предложения
 */
function revokeOffer(orderId: number, reason: string = ''): Promise<void> {
  return TripAPI.cancelTripByDriver(orderId, reason);
}

/**
 * Возвращает мутацию назначения отзыва предложения от мастера.
 * Хук может быть вызван без дополнительных условий, но отзыв предложения доступен только мастеру,
 * сделавшему предложение о выполнении заказа.
 */
export function useRevokeOffer() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: number, reason?: string }, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.role !== UserRole.Contractor) throw new Error('User must be a contractor.');
      if (!orderId) throw new Error('Order ID not specified.');
      if (!reason) reason = '';

      const order = await client.fetchQuery({
        queryKey: [ 'orders', user.id, orderId ],
        queryFn: fetchOrderById,
        staleTime: CONFIG.API?.ordersDataStaleTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.PUBLISHED) throw new Error('Incorrect order state.');
      if (!order.contractorOffers.some(offer => offer.contractorId === user.id)) throw new Error('No offer from the contractor.');

      await revokeOffer(orderId, reason);
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, 'contractor' ] });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, 'available' ] });
      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    revokeOffer: mutateAsync
  }
}

// ==================== 4. Управление заказами (сторона мастера) ====================

/**
 * Получить список активных заказов для мастера
 * @returns Объект с состоянием запроса React Query и объектом `orders`, содержащим список заказов.
 */
export function useContractorOrders() {
  const { user } = useUser() as { user: UserProfile };
  const queryResult = useQuery({
    queryKey: [ 'orders', user.id, 'contractor' ],
    queryFn: ({ client }) => getOrders(client, user.id, TripAPI.GetTripsState.Current),
    staleTime: CONFIG.API?.ordersDataStaleTime ?? 120000,
    refetchInterval: CONFIG.API?.ordersDataRefetchTime ?? 120000,
    enabled: !!user.id && user.role === UserRole.Contractor  // Доступно только мастеру
  });

  const { data, ...ret } = queryResult;
  const orders = data?.filter(order =>
    order.status === OrderStatus.PUBLISHED ?
      order.contractorOffers.some(offer => offer.contractorId === user.id) :
      order.contractorId === user.id
  ) || EMPTY_ARRAY;
  return {
    ...ret,
    orders
  };
}

/**
 * Получить список доступных заказов для мастера
 * @returns Объект с состоянием запроса React Query и объектом `orders`, содержащим список заказов.
 */
export function useAvailableOrders() {
  const { user } = useUser() as { user: UserProfile & { services: number[] } };
  const queryResult = useQuery({
    queryKey: [ 'orders', user.id, 'available' ],
    queryFn: ({ client }) => getOrders(client, user.id, TripAPI.GetTripsState.New),
    staleTime: CONFIG.API?.ordersDataStaleTime ?? 120000,
    refetchInterval: CONFIG.API?.ordersDataRefetchTime ?? 120000,
    enabled: !!user.id && user.role === UserRole.Contractor  // Доступно только мастеру
  });

  const { data, ...ret } = queryResult;
  const filteredData = data?.filter(order => user.services?.includes(order.serviceId));
  const orders = filteredData?.length ? filteredData : EMPTY_ARRAY;
  return {
    ...ret,
    orders
  };
}

//~ /**
 //~ * Отказаться от персонального заказа (для мастера)
 //~ * @param orderId - ID заказа
 //~ * @param reason - Причина отказа
 //~ * @returns Результат отказа
 //~ */
//~ declare function rejectOrderByContractor(
  //~ orderId: number,
  //~ reason: string
//~ ): Promise<{ success: boolean }>;

/**
 * Подтвердить готовность принять заказ (после выбора клиентом)
 * @param orderId - ID заказа
 * @returns Промис, который разрешается после успешного завершения операции
 */
function acceptInvoice(orderId: number, price: number): Promise<void> {
  return TripAPI.acceptInvoice(orderId, { price });
}

/**
 * Возвращает мутацию принятия заказа мастером
 * Хук может быть вызван без дополнительных условий, но принятие заказа доступно только мастеру,
 * для которого есть предложение о выполнении заказа.
 */
export function useAcceptInvoice() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async (orderId: number, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.role !== UserRole.Contractor) throw new Error('User must be a contractor.');
      if (!orderId) throw new Error('Order ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'orders', user.id, orderId ],
        queryFn: fetchOrderById,
        staleTime: CONFIG.API?.ordersDataStaleTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.REQUESTED) throw new Error('Incorrect order state.');
      if (order.contractorId !== user.id) throw new Error('No invoice for the contractor.');

      await acceptInvoice(orderId, order.desiredPrice);
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, 'contractor' ] });
      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    acceptInvoice: mutateAsync
  }
}

/**
 * Начать работу над заказом
 * @param orderId - ID заказа
 * @returns Промис, который разрешается после успешного завершения операции
 */
function startOrderWork(orderId: number): Promise<void> {
  return TripAPI.setArriveState(orderId);
}

/**
 * Возвращает мутацию для начала работы над заказом
 * Хук может быть вызван без дополнительных условий, но начало работы доступно только мастеру,
 * одобренного для выполнения заказа.
 */
export function useStartOrderWork() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async (orderId: number, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.role !== UserRole.Contractor) throw new Error('User must be a contractor.');
      if (!orderId) throw new Error('Order ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'orders', user.id, orderId ],
        queryFn: fetchOrderById,
        staleTime: CONFIG.API?.ordersDataStaleTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.CONTRACTOR_CONFIRMED) throw new Error('Incorrect order state.');
      if (order.contractorId !== user.id) throw new Error('User is not the contractor.');

      await startOrderWork(orderId);
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, 'contractor' ] });
      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    startOrderWork: mutateAsync
  }
}

/**
 * Отметить заказ как выполненный (для мастера)
 * @param orderId - ID заказа
 * @returns Промис, который разрешается после успешного завершения операции
 */
function completeOrderByContractor(orderId: number): Promise<void> {
  return TripAPI.startTrip(orderId);
}

/**
 * Возвращает мутацию для завершения работы над заказом
 * Хук может быть вызван без дополнительных условий, но завершение работы доступно только мастеру,
 * выполняющему заказ.
 */
export function useCompleteOrderByContractor() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async (orderId: number, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.role !== UserRole.Contractor) throw new Error('User must be a contractor.');
      if (!orderId) throw new Error('Order ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'orders', user.id, orderId ],
        queryFn: fetchOrderById,
        staleTime: CONFIG.API?.ordersDataStaleTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.IN_PROGRESS) throw new Error('Incorrect order state.');
      if (order.contractorId !== user.id) throw new Error('User is not the contractor.');

      await completeOrderByContractor(orderId);
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, 'contractor' ] });
      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    completeOrderByContractor: mutateAsync
  }
}

// ==================== 5. Подтверждение и завершение (клиент) ====================

/**
 * Подтвердить выполнение заказа (для клиента)
 * @param orderId - ID заказа
 * @returns Промис, который разрешается после успешного завершения операции
 */
function verifyOrderCompletion(orderId: number): Promise<void> {
  return TripAPI.finishTrip(orderId);
}

/**
 * Возвращает мутацию для подтверждения выполнения заказа
 * Хук может быть вызван без дополнительных условий, но подтверждение выполнения доступно только клиенту,
 * создавшему заказ.
 */
export function useVerifyOrderCompletion() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async (orderId: number, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.role !== UserRole.Client) throw new Error('User must be a client.');
      if (!orderId) throw new Error('Order ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'orders', user.id, orderId ],
        queryFn: fetchOrderById,
        staleTime: CONFIG.API?.ordersDataStaleTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.COMPLETED) throw new Error('Incorrect order state.');
      if (order.clientId !== user.id) throw new Error('User is not the customer.');

      await verifyOrderCompletion(orderId);
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, 'active' ] });
      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    verifyOrderCompletion: mutateAsync
  }
}

//~ /**
 //~ * Открыть спор по заказу
 //~ * @param orderId - ID заказа
 //~ * @param disputeData - Данные спора
 //~ * @returns Результат открытия спора
 //~ */
//~ declare function openOrderDispute(
  //~ orderId: number,
  //~ disputeData: {
    //~ reason: string;
    //~ description: string;
    //~ attachments?: File[];
  //~ }
//~ ): Promise<{ success: boolean; disputeId: number }>;

// ==================== 6. Вспомогательные и системные ====================

export function useFileById(fileId: number | null) {
  const queryResult = useQuery({
    queryKey: [ 'files', fileId ],
    queryFn: () => FileAPI.fetchFile(fileId ?? 0),
    staleTime: CONFIG.API?.filesStaleTime ?? 1800000,
    enabled: !!fileId
  });

  const { data: { blob, type, filename } = {}, ...ret } = queryResult;
  return {
    ...ret,
    blob,
    type,
    filename
  };
}

//~ /**
 //~ * Получить статистику по заказам для дашборда
 //~ * @param userId - ID пользователя
 //~ * @param role - Роль пользователя ('client' или 'contractor')
 //~ * @returns Статистика заказов
 //~ */
//~ declare function getOrderStatistics(
  //~ userId: number,
  //~ role: 'client' | 'contractor'
//~ ): Promise<{
  //~ total: number;
  //~ active: number;
  //~ completed: number;
  //~ cancelled: number;
  //~ totalRevenue?: number;
  //~ averageRating?: number;
//~ }>;
