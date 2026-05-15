/**
 * Модуль для работы с глобальным состоянием заказов
 *
 * @summary
 * **Типы данных:**
 * Order, TimeUnit, Offer, OrderType, OrderStatus, OrderCreationData, OrderUpdateData, CreateOfferData
 *
 * **Функции, влияющие на глобальное состояние:**
 * useCreateOrder, useUpdateOrder, useCancelOrder, useCreateOffer, useUpdateOffer, useAcceptOffer,
 * useRevokeOffer, useAcceptInvoice, useStartOrderWork, useCompleteOrderByContractor, useVerifyOrderCompletion
 *
 * **Функции, не влияющие на глобальное состояние:**
 * useContractors, useClientOrders, useFinishedOrders, useOrdersByIds, useContractorOrders, useAvailableOrders
 */
import { useQuery, useMutation } from '@tanstack/react-query';

import CONFIG from 'config';
import { fileToBase64, isImage } from 'app/shared/lib/utilities';
import * as FileAPI from './api/dropbox';
import * as TripAPI from './api/trips';
import { getDrivenCar } from './api/cars';
import { authorizedUserId } from './auth';
import { createBatchLoader } from './batch-query';
import type { ServicesMap, UserProfile } from './user';
import { UserRole, TimeUnit, useUser, useUsersByIds, getUserById } from './user';

// ==================== Типы данных ====================

export type Order = {
  id: number;
  type: OrderType;
  clientId: number;
  contractorId?: number;
  city: number;
  address: string;
  productId: number;
  services?: OrderServiceDetails[];
  status: OrderStatus;
  description: string;
  agreedPrice?: number;
  desiredPrice: number;
  contractorPrice?: number;
  createdAt: Date;
  updatedAt: Date;
  attachments: number[];
  contractorOffers: Offer[];
  contractorOffersCount: number;
};

export enum OrderType {
  Market = 'market',
  Direct = 'direct'
}

export type OrderServiceDetails = {
  service: string;
  price: number
};

export type Offer = {
  contractorId: number;
  price: number;
  comment: string;
  readyIn: {
    value: number,
    unit: TimeUnit
  };
  createdAt: Date;
};

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
  APPOINTED = 'appointed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  AWAITING_PAYMENT = 'awaiting_payment',
  PAID = 'paid',
  CLOSED = 'closed',
  DISPUTE = 'dispute',
  CANCELLED = 'cancelled'
}

export const orderStatusString = {
  [OrderStatus.PUBLISHED]: 'Awaiting',
  [OrderStatus.REQUESTED]: 'Offered',
  [OrderStatus.APPOINTED]: 'Appointed',
  [OrderStatus.IN_PROGRESS]: 'In progress',
  [OrderStatus.COMPLETED]: 'Completed',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.CLOSED]: 'Finished',
  [OrderStatus.DISPUTE]: 'Dispute',
};

const EMPTY_ARRAY = Object.freeze([]);

// ==================== 1. Выбор мастера ====================

/**
 * Получить список мастеров по конкретной услуге
 * @param product - ID услуги
 * @param city - ID города
 * @param rating - минимальный рейтинг мастера (не реализовано)
 * @param isOnline - возвращать только пользователей онлайн
 * @returns Объект, содержащий объединенное состояние запросов React Query и массив `users` с данными
 *          успешно полученных мастеров, оказывающих данную услугу
 */
export function useContractors({ product, city, rating, isOnline }: {
  product: number;
  city: number;
  rating?: number;
  isOnline?: boolean;
}) {
  const { user } = useUser() as { user: UserProfile };
  const { data, ...rest } = useQuery({
    queryKey: [ 'contractors', product, city, rating, isOnline ],
    queryFn: () => TripAPI.getContractorsByProduct({ productId: product, cityId: city, minRating: rating, isOnline }),
    staleTime: CONFIG.API?.userDataStaleTime ?? Infinity,
    // Здесь и далее проверяем соответствие ID пользователя авторизованному пользователю в токене,
    // потому что пользователь может смениться во время выполнения асинхронных операций
    enabled: !!user.id && user.id === authorizedUserId()  // Доступно только авторизованному пользователю
  });

  const { users: contractors, ...rest2 } = useUsersByIds(data || []);
  if (rest.isSuccess) return { ...rest2, contractors };
  else return { ...rest, contractors: EMPTY_ARRAY };
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

// ======================= 2. Получение заказов (общие функции) ========================

/**
 * Преобразует сырые данные API в структуру Order
 * @param rawData Данные поездок от API
 * @returns Список заказов
 */
function parseOrders(userId: number, rawData: Awaited<ReturnType<typeof TripAPI.getTripsByIds>>): Order[] {
  const result = rawData.reduce((ret, trip) => {
    if (trip.b_id && trip.u_id) {
      let c_state = 0;  // статус назначенного исполнителя, если есть
      // очищаем список прикреплённых файлов
      const images = Array.isArray(trip.b_options?.images) ? trip.b_options.images : [];
      const attachments = images
        .map(Number)
        .filter(id => Number.isInteger(id) && id > 0);

      // заполняем основные свойства заказа
      const order: Partial<Order> = {
        id: Number(trip.b_id),
        type: Number(trip.b_only_offer) === 1 ? OrderType.Direct : OrderType.Market,
        clientId: Number(trip.u_id),
        city: Number(trip.city_start ?? 0),
        address: String(trip.b_start_address ?? ''),
        productId: Number(trip.b_options?.product ?? 0),
        description: String(trip.b_options?.description ?? ''),
        desiredPrice: Number(trip.b_options?.desiredPrice ?? 0),
        createdAt: new Date(String(trip.b_created ?? '') || 0),
        attachments,
        contractorOffers: []
      };
      // отбрасываем бракованные данные
      if (!order.id || !order.clientId || !order.productId || !order.city) {
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
          if (d_state === TripAPI.DriverState.Offering) {
            // не назначенный исполнитель
            order.contractorOffers!.push({
              contractorId: d_id,
              price: d_price,
              comment: String(driver.c_options?.comment ?? ''),
              readyIn: driver.c_options?.readyIn && 'object' === typeof driver.c_options.readyIn ?
                driver.c_options.readyIn as { value: number; unit: TimeUnit; } :
                { value: 0, unit: TimeUnit.HOURS },
              createdAt: new Date(String(driver.c_becomed_candidate ?? '') || 0)
            });
            if (d_id === userId && b_state === TripAPI.TripState.New) {
              // текущий пользователь является мастером, откликнувшимся на заказ
              order.contractorPrice = d_price;
            }
          }
          else if (
            d_state === TripAPI.DriverState.Assigned || d_state === TripAPI.DriverState.Waiting ||
            d_state === TripAPI.DriverState.Driving || d_state === TripAPI.DriverState.Completed
          ) {
            // назначенный исполнитель
            c_state = d_state;

            if (d_state === TripAPI.DriverState.Assigned) order.updatedAt = new Date(String(driver.c_appointed ?? '') || 0);
            else if (d_state === TripAPI.DriverState.Waiting) order.updatedAt = new Date(String(driver.c_arrived ?? '') || 0);
            else if (d_state === TripAPI.DriverState.Driving) order.updatedAt = new Date(String(driver.c_started ?? '') || 0);
            else order.updatedAt = new Date(String(driver.c_completed ?? '') || 0);

            order.contractorId = d_id;
            order.contractorPrice = d_price;
          }
        }
      }
      // общее количество откликнувшихся водителей
      order.contractorOffersCount = trip.drivers_count != null ? Number(trip.drivers_count) : order.contractorOffers!.length;
      // проверяем, предложен ли заказ конкретному мастеру
      if (order.type === OrderType.Direct) {
        if (!order.contractorId) {
          if (trip.b_offer) order.contractorId = userId;
          else if (trip.b_offers?.[0]?.u_id) order.contractorId = Number(trip.b_offers[0].u_id);
        }
        order.services = Array.isArray(trip.b_options?.services) ? trip.b_options.services : [];
      }

      // маппинг статусов
      if (b_state === TripAPI.TripState.New) order.status = OrderStatus.PUBLISHED;
      else if (b_state === TripAPI.TripState.Offering) order.status = OrderStatus.REQUESTED;
      else if (b_state === TripAPI.TripState.Assigned) {
        if (c_state === TripAPI.DriverState.Waiting) order.status = OrderStatus.IN_PROGRESS;
        else if (c_state === TripAPI.DriverState.Driving) order.status = OrderStatus.COMPLETED;
        else order.status = OrderStatus.APPOINTED;
        order.agreedPrice = order.contractorPrice;
      }
      else if (b_state === TripAPI.TripState.Cancelled) {
        order.status = OrderStatus.CANCELLED;
        order.updatedAt = new Date(String(trip.b_canceled ?? '') || 0);
      }
      else if (b_state === TripAPI.TripState.Completed) {
        order.status = OrderStatus.CLOSED;
        order.agreedPrice = order.contractorPrice;
      }

      ret.push(order as Order);
    }

    return ret;
  }, [] as Order[]);

  return result;
}

// Группы заказов для выборки
type OrderStage = 'new' | 'active' | 'finished';

/**
 * Получить список заказов с фильтрацией по статусу
 * @param userRole Роль пользователя для запроса
 * @param types Виды заказов
 * @param stages Состояния заказов
 * @returns Список заказов
 */
function useOrders(userRole: UserRole, types: OrderType[], stages: OrderStage[]) {
  const { user } = useUser() as { user: UserProfile };

  let filter = 0;
  for (const type of types) {
    if (type === OrderType.Market) filter |= TripAPI.TripFilter.public;
    else if (type === OrderType.Direct) filter |= TripAPI.TripFilter.offer;
  }

  for (const stage of stages) {
    if (stage === 'new') filter |= TripAPI.TripFilter.now;
    else if (stage === 'active') filter |= TripAPI.TripFilter.current;
    else if (stage === 'finished') filter |= TripAPI.TripFilter.archive;
  }

  const { data, ...rest } = useQuery({
    queryKey: [ 'orders', user.id, 'list', types, stages ],
    queryFn: () => TripAPI.getTripIds(filter),
    staleTime: CONFIG.API?.ordersListRefetchTime ?? 120000,
    refetchInterval: CONFIG.API?.ordersListRefetchTime ?? 120000,
    enabled: !!user.id && user.role === userRole &&  // Доступно только пользователю с заданной ролью
             user.id === authorizedUserId() &&   // Авторизованный пользователь не изменился
             !!(filter & 3) && !!(filter & 28)   // Хотя бы один фильтр каждого типа
  });

  const result = useOrdersByIds(data || []);

  if (!rest.isSuccess) return { ...rest, orders: EMPTY_ARRAY };

  // todo: Нужно обновить данные заказов, если статус заказа на сервере изменился, а в кэше - нет
  // todo: Подумать, как это сделать

  return result;
}

const [ getOrderById, useOrdersByIds ] = createBatchLoader({
  fetchFn: async (ids: number[], authUserId: number) => {
    const data = await TripAPI.getTripsByIds(ids);
    return data ? parseOrders(authUserId, data) : [];
  },
  createQueryKey: (userId, orderId) => [ 'orders', userId, orderId ],
  extractKeys: (queryKey) => [ Number(queryKey[1]), Number(queryKey[2]) ],
  staleTime: CONFIG.API?.ordersDataRefetchTime ?? 300000,
  dataKey: 'orders'
});

/**
 * Получить список заказов пользователя по ID (в роли как клиента, так и мастера)
 * @param ids Список ID заказов
 * @returns Объект, содержащий объединенное состояние запросов React Query
 *          и массив `orders` с данными успешно полученных заказов.
 */
export { useOrdersByIds };

// ==================== 3. Управление заказами (клиентская сторона) ====================

export type OrderCreationData = {
  /** ID города */
  cityId: number;
  /** адрес выполнения работ */
  address: string;
  /** ID заказанной услуги */
  productId: number;
  /** ID выбранного мастера */
  contractorId?: number;
  /** выбранные услуги */
  services?: OrderServiceDetails[];
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
 * @param userId - ID пользователя
 * @param cityId - ID города
 * @param address - адрес выполнения работ
 * @param productId - ID заказанной услуги
 * @param contractorId - ID выбранного мастера
 * @param services - выбранные услуги
 * @param description - Комментарий к заказу
 * @param attachments - Фотографии к заказу
 * @param price - Предложенная стоимость работ
 * @returns ID созданного заказа
 */
async function createOrder(
  userId: number,
  {
    cityId,
    address,
    productId,
    contractorId,
    services,
    description,
    attachments,
    price
  }: OrderCreationData
): Promise<number | null> {
  const orderOptions: Record<string, any> = {
    product: productId,
    description,
    desiredPrice: price
  };

  if (contractorId) {
    orderOptions.services = services;
  }

  // todo: Здесь возможно появление файлов, не связанных с заказами. Нужно предусмотреть очистку.
  if (attachments?.length) {
    const images = await Promise.all(
      attachments
        .filter(file => isImage(file.type))
        .map(async file => ({ name: file.name, data: await fileToBase64(file) }))
    );
    if (userId !== authorizedUserId()) throw new Error('User was changed.');
    const uploaded = await Promise.all(
      images.map(image => FileAPI.uploadFile(image.name, image.data, 0))
    );
    if (userId !== authorizedUserId()) throw new Error('User was changed.');
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

  // todo: сделать подобие транзакции или перенести на бэкенд
  const orderId = await TripAPI.createTrip(orderCreationData);
  if (userId !== authorizedUserId()) throw new Error('User was changed.');
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
      if (user.id !== authorizedUserId()) throw new Error('User was changed.');
      if (user.role !== UserRole.Client) throw new Error('User must be a client.');
      if (!orderData.cityId || !orderData.address || !orderData.productId) throw new Error('Mandatory parameter is empty.');
      if (orderData.contractorId && !orderData.services?.length) throw new Error('Mandatory parameter is empty.');

      if (orderData.contractorId) {
        const contractorUser = (await getUserById(client, user.id, orderData.contractorId)) as { services?: ServicesMap };
        if (!contractorUser.services?.[orderData.productId]) throw new Error('Bad contractor');
        const contractorServices = contractorUser.services[orderData.productId];
        let validServices = 0;
        for (const orderService of orderData.services!) {
          for (const contractorService of contractorServices) {
            if (orderService.service === contractorService.service && orderService.price === contractorService.price) {
              validServices++;
              break;
            }
          }
        }
        if (orderData.services!.length !== validServices) throw new Error('Bad services data');
      }

      const ret = await createOrder(user.id, orderData);
      // Инвалидация списка новых заказов
      const orderType = orderData.contractorId ? OrderType.Direct : OrderType.Market;
      const filteredQueries = client.getQueryCache().findAll({ predicate: ({ queryKey }) => (
        queryKey[0] === 'orders' &&
        queryKey[1] === user.id &&
        queryKey[2] === 'list' &&
        Array.isArray(queryKey[3]) &&
        Array.isArray(queryKey[4]) &&
        queryKey[3].includes(orderType) &&
        queryKey[4].includes('new')
      )});
      for (const { queryKey } of filteredQueries) {
          client.invalidateQueries({ queryKey });
      }

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
 * Получить список активных заказов клиента
 * @param includeMarket - включить заказы на бирже.
 * @param includeDirect - включить персональные заказы.
 * @returns Объект с состоянием запроса React Query и объектом `orders`, содержащим список заказов.
 */
export function useClientOrders(includeMarket: boolean, includeDirect: boolean) {
  const types = [] as OrderType[];
  if (includeMarket) types.push(OrderType.Market);
  if (includeDirect) types.push(OrderType.Direct);
  return useOrders(UserRole.Client, types, ['new', 'active']);
}

/**
 * Получить список завершённых и отменённых заказов пользователя (в роли как клиента, так и мастера)
 * @param includeMarket - включить заказы на бирже.
 * @param includeDirect - включить персональные заказы.
 * @returns Объект с состоянием запроса React Query и объектом `orders`, содержащим список заказов.
 */
export function useFinishedOrders(includeMarket: boolean, includeDirect: boolean) {
  const types = [] as OrderType[];
  if (includeMarket) types.push(OrderType.Market);
  if (includeDirect) types.push(OrderType.Direct);
  return useOrders(UserRole.Client, types, ['finished']);
}

/**
 * Редактировать заказ (доступно в определенных статусах)
 * @param orderId - ID заказа
 * @param address Адрес выполнения услуги
 * @param description Описание заказа
 * @param attachments Изображения к заказу
 * @param desiredPrice Предложенная стоимость работ
 * @returns Промис, который разрешается со списками обновлённых и удалённых прикреплённых файлов для инвалидации кэша
 */
async function updateOrder(userId, { orderId, address, description, attachments, desiredPrice }: OrderUpdateData) {
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

      const oldData = await TripAPI.getTripsByIds([ orderId ]);
      if (userId !== authorizedUserId()) throw new Error('User was changed.');

      let oldFilesInfo = [] as (FileAPI.DropboxFileInfo | null)[];
      if (Array.isArray(oldData[0]?.b_options?.images)) {
        const oldIds = (oldData[0].b_options.images ?? [])
          .map(Number)
          .filter(id => Number.isInteger(id) && id > 0 && !idAttachments.includes(id));
        oldFilesInfo = await FileAPI.getFilesInfo(oldIds);
        if (userId !== authorizedUserId()) throw new Error('User was changed.');
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
        if (userId !== authorizedUserId()) throw new Error('User was changed.');

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
          if (userId !== authorizedUserId()) throw new Error('User was changed.');
        }
        const uploaded = (await Promise.all(uploads)).filter(Boolean) as number[];
        if (userId !== authorizedUserId()) throw new Error('User was changed.');
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
      if (user.id !== authorizedUserId()) throw new Error('User was changed.');
      if (user.role !== UserRole.Client) throw new Error('User must be a client.');
      if (!orderId) throw new Error('Order ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'orders', user.id, orderId ],
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (user.id !== authorizedUserId()) throw new Error('User was changed.');
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

      const results = await updateOrder(user.id, { orderId, address, description, attachments, desiredPrice });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });
      for (const id of results.deletedFiles) {
        client.removeQueries({ queryKey: [ 'files', id ] });
      }
      for (const id of results.updatedFiles) {
        client.invalidateQueries({ queryKey: [ 'files', id ] });
      }
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
      if (user.id !== authorizedUserId()) throw new Error('User was changed.');
      if (!orderId) throw new Error('Order ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'orders', user.id, orderId ],
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (user.id !== authorizedUserId()) throw new Error('User was changed.');
      if (!order) throw new Error('Order not found.');
      if (
        ![ OrderStatus.DRAFT, OrderStatus.PUBLISHED, OrderStatus.REQUESTED, OrderStatus.APPOINTED ]
        .includes(order.status)
      ) {
        throw new Error('Cannot cancel an ongoing order.');
      }

      if (user.role === UserRole.Contractor) {
        await cancelOrderByContractor(orderId, reason);
      }
      else {
        await cancelOrderByClient(orderId, reason);
      }
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });
      // Инвалидация списков заказов
      // - заказ может быть либо в списке "new", либо в списке "active"
      // - при отмене заказчиком перемещается в "завершённые"
      // - при отмене мастером перемещается в "новые"
      const filteredQueries = client.getQueryCache().findAll({ predicate: ({ queryKey, state: {data} }) => (
        queryKey[0] === 'orders' &&
        queryKey[1] === user.id &&
        queryKey[2] === 'list' &&
        Array.isArray(queryKey[3]) &&
        Array.isArray(queryKey[4]) &&
        queryKey[3].includes(order.type) &&
        queryKey[4].some(stage =>
          (
            stage === 'new' &&
            (
              user.role === UserRole.Contractor ||
              (Array.isArray(data) && data.includes(orderId))
            )
          ) ||
          (
            stage === 'active' &&
            Array.isArray(data) &&
            data.includes(orderId)
          ) ||
          (
            stage === 'finished' &&
            user.role === UserRole.Client
          )
        )
      )});
      for (const { queryKey } of filteredQueries) {
          client.invalidateQueries({ queryKey });
      }

      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    cancelOrder: mutateAsync
  }
}

// ==================== 4. Работа с предложениями (откликами мастеров) ====================

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
async function createOffer({ orderId, price, comment, readyIn }: CreateOfferData): Promise<void> {
  const result = await getDrivenCar();
  const carId = Number(result?.c_id);
  if (!Number.isInteger(carId) || carId <= 0) throw new Error('User has no car');

  const options = {
    price,
    comment,
    readyIn
  };
  return TripAPI.createOffer(orderId, carId, options);
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
      if (user.id !== authorizedUserId()) throw new Error('User was changed.');
      if (user.role !== UserRole.Contractor) throw new Error('User must be a contractor.');
      if (!orderId) throw new Error('Order ID not specified.');
      if (!price || !comment || !readyIn) throw new Error('Mandatory parameter is empty.');

      const order = await client.fetchQuery({
        queryKey: [ 'orders', user.id, orderId ],
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (user.id !== authorizedUserId()) throw new Error('User was changed.');
      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.PUBLISHED) throw new Error('Incorrect order state.');
      if (order.contractorOffers.some(offer => offer.contractorId === user.id)) throw new Error('Offer already exists.');

      await createOffer({ orderId, price, comment, readyIn });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });

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
      if (user.id !== authorizedUserId()) throw new Error('User was changed.');
      if (user.role !== UserRole.Contractor) throw new Error('User must be a contractor.');
      if (!orderId) throw new Error('Order ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'orders', user.id, orderId ],
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (user.id !== authorizedUserId()) throw new Error('User was changed.');
      if (!order) throw new Error('Order not found.');
      const offer = order.contractorOffers.find(offer => offer.contractorId === user.id);
      if (order.status !== OrderStatus.PUBLISHED || !offer) throw new Error('Incorrect order state.');
      if (
        (price === undefined || offer.price === price) &&
        (comment === undefined || offer.comment === comment) &&
        (readyIn === undefined || (offer.readyIn.value === readyIn.value && offer.readyIn.unit === readyIn.unit))
      ) {
        return;
      }

      await updateOffer({ orderId, price, comment, readyIn });
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });

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
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (!order || order.clientId !== user.id) throw new Error('Order not found.');
      if (order.status !== OrderStatus.PUBLISHED) throw new Error('Incorrect order state.');
      if (order.clientId !== user.id) throw new Error('User is not the customer.');
      if (!order.contractorOffers.some(offer => offer.contractorId === contractorId)) throw new Error('No offer from the contractor.');

      await acceptOffer(orderId, contractorId);
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });
      // Инвалидация списков новых и активных заказов
      // - заказ перемещается из "новых" в "активные"
      const filteredQueries = client.getQueryCache().findAll({ predicate: ({ queryKey }) => (
        queryKey[0] === 'orders' &&
        queryKey[1] === user.id &&
        queryKey[2] === 'list' &&
        Array.isArray(queryKey[3]) &&
        Array.isArray(queryKey[4]) &&
        queryKey[3].includes(OrderType.Market) &&
        queryKey[4].some(stage => stage === 'new' || stage === 'active')
      )});
      for (const { queryKey } of filteredQueries) {
          client.invalidateQueries({ queryKey });
      }

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
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.PUBLISHED) throw new Error('Incorrect order state.');
      if (!order.contractorOffers.some(offer => offer.contractorId === user.id)) throw new Error('No offer from the contractor.');

      await revokeOffer(orderId, reason);
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });

      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    revokeOffer: mutateAsync
  }
}

// ==================== 5. Управление заказами (сторона мастера) ====================

/**
 * Получить список активных заказов для мастера
 * @param includeMarket - включить заказы на бирже.
 * @param includeDirect - включить персональные заказы.
 * @returns Объект с состоянием запроса React Query и объектом `orders`, содержащим список заказов.
 */
export function useContractorOrders(includeMarket: boolean, includeDirect: boolean) {
  const types = [] as OrderType[];
  if (includeMarket) types.push(OrderType.Market);
  if (includeDirect) types.push(OrderType.Direct);
  return useOrders(UserRole.Contractor, types, ['active']);
}

/**
 * Получить список доступных заказов для мастера
 * @param includeMarket - включить заказы на бирже.
 * @param includeDirect - включить персональные заказы.
 * @returns Объект с состоянием запроса React Query и объектом `orders`, содержащим список заказов.
 */
export function useAvailableOrders(includeMarket: boolean, includeDirect: boolean) {
  const types = [] as OrderType[];
  if (includeMarket) types.push(OrderType.Market);
  if (includeDirect) types.push(OrderType.Direct);
  return useOrders(UserRole.Contractor, types, ['new']);
}

/**
 * Получить список завершённых заказов для мастера
 * @param includeMarket - включить заказы на бирже.
 * @param includeDirect - включить персональные заказы.
 * @returns Объект с состоянием запроса React Query и объектом `orders`, содержащим список заказов.
 */
export function useContractorFinishedOrders(includeMarket: boolean, includeDirect: boolean) {
  const types = [] as OrderType[];
  if (includeMarket) types.push(OrderType.Market);
  if (includeDirect) types.push(OrderType.Direct);
  return useOrders(UserRole.Contractor, types, ['finished']);
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
async function acceptInvoice(orderId: number, price: number): Promise<void> {
  const result = await getDrivenCar();
  const carId = Number(result?.c_id);
  if (!Number.isInteger(carId) || carId <= 0) throw new Error('User has no car');
  return TripAPI.acceptInvoice(orderId, carId, { price });
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
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.REQUESTED) throw new Error('Incorrect order state.');
      if (order.contractorId !== user.id) throw new Error('No invoice for the contractor.');

      await acceptInvoice(orderId, order.desiredPrice);
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });
      // Инвалидация списков новых и активных заказов
      // - заказ перемещается из "новых" в "активные"
      const filteredQueries = client.getQueryCache().findAll({ predicate: ({ queryKey }) => (
        queryKey[0] === 'orders' &&
        queryKey[1] === user.id &&
        queryKey[2] === 'list' &&
        Array.isArray(queryKey[3]) &&
        Array.isArray(queryKey[4]) &&
        queryKey[3].includes(OrderType.Direct) &&
        queryKey[4].some(stage => stage === 'new' || stage === 'active')
      )});
      for (const { queryKey } of filteredQueries) {
          client.invalidateQueries({ queryKey });
      }

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
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.APPOINTED) throw new Error('Incorrect order state.');
      if (order.contractorId !== user.id) throw new Error('User is not the contractor.');

      await startOrderWork(orderId);
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });

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
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.IN_PROGRESS) throw new Error('Incorrect order state.');
      if (order.contractorId !== user.id) throw new Error('User is not the contractor.');

      await completeOrderByContractor(orderId);
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });

      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    completeOrderByContractor: mutateAsync
  }
}

// ==================== 6. Подтверждение и завершение (клиент) ====================

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
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.COMPLETED) throw new Error('Incorrect order state.');
      if (order.clientId !== user.id) throw new Error('User is not the customer.');

      await verifyOrderCompletion(orderId);
      client.invalidateQueries({ queryKey: [ 'orders', user.id, orderId ] });
      // Инвалидация списков активных и завершённых заказов
      // - заказ перемещается из "активных" в "завершённые"
      const filteredQueries = client.getQueryCache().findAll({ predicate: ({ queryKey }) => (
        queryKey[0] === 'orders' &&
        queryKey[1] === user.id &&
        queryKey[2] === 'list' &&
        Array.isArray(queryKey[3]) &&
        Array.isArray(queryKey[4]) &&
        queryKey[3].includes(order.type) &&
        queryKey[4].some(stage => stage === 'active' || stage === 'finished')
      )});
      for (const { queryKey } of filteredQueries) {
          client.invalidateQueries({ queryKey });
      }

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

// ==================== 7. Вспомогательные и системные ====================

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
