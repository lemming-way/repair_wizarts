/**
 * Модуль для работы с глобальным состоянием заказов
 *
 * @summary
 * **Типы данных:**
 * Order, OrderServiceDetails, Offer, OrderType, OrderStatus, OrderCreationData, OrderUpdateData, CreateOfferData
 *
 * **Функции, влияющие на глобальное состояние:**
 * useCreateOrder, useUpdateOrder, useCancelOrder, useCreateOffer, useUpdateOffer, useAcceptOffer,
 * useRevokeOffer, useAcceptInvoice, useRejectInvoice, useStartOrderWork, useFinishOrderWork,
 * useConfirmOrderCompletion
 *
 * **Функции, не влияющие на глобальное состояние:**
 * useContractors, useClientOrders, useFinishedOrders, useOrdersByIds, useContractorOrders, useAvailableOrders
 */
import { useQuery, useMutation } from '@tanstack/react-query';

import CONFIG from 'config';
import * as OrderAPI from './api/order';
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

export const OrderType = {
  Market: 'market',
  Direct: 'direct'
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type OrderType = typeof OrderType[keyof typeof OrderType];

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

export const OrderStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  REQUESTED: 'requested',
  APPOINTED: 'appointed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  AWAITING_PAYMENT: 'awaiting_payment',
  PAID: 'paid',
  CLOSED: 'closed',
  DISPUTE: 'dispute',
  CANCELLED: 'cancelled'
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

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
    queryFn: () => OrderAPI.getContractorsByProduct({ productId: product, cityId: city, minRating: rating, isOnline }),
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
 * @param rawData Данные заказов от API
 * @returns Список заказов
 */
function parseOrders(rawData: OrderAPI.OrderRecord[]): Order[] {
  const result = rawData.reduce((ret, data) => {
    // очищаем список прикреплённых файлов
    const images = Array.isArray(data.images) ? data.images : [];
    const attachments = images
      .map(Number)
      .filter(id => Number.isInteger(id) && id > 0);

    const status =
      data.order_status === OrderAPI.OrderStatus.New ? OrderStatus.PUBLISHED :
      data.order_status === OrderAPI.OrderStatus.Offering ? OrderStatus.REQUESTED :
      data.order_status === OrderAPI.OrderStatus.Cancelled ? OrderStatus.CANCELLED :
      data.order_status === OrderAPI.OrderStatus.Completed ? OrderStatus.CLOSED :
      data.order_status === OrderAPI.OrderStatus.Assigned ? (
        data.contractor_status === OrderAPI.ContractorStatus.Waiting ? OrderStatus.IN_PROGRESS :
        data.contractor_status === OrderAPI.ContractorStatus.Driving ? OrderStatus.IN_PROGRESS :
        data.contractor_status === OrderAPI.ContractorStatus.Completed ? OrderStatus.COMPLETED :
        OrderStatus.APPOINTED
      ) :
      null;
    if (!status) return ret;

    const offersData =
      Array.isArray(data.contractor_offers) ? data.contractor_offers :
      !!data.contractor_offer && 'object' === typeof data.contractor_offer ? [ data.contractor_offer ] :
      [];

    const contractorOffers = offersData.reduce((ret, data) => {
      const offer = {
        contractorId: Number(data.id),
        price: Number(data.price),
        comment: String(data.comment ?? ''),
        readyIn:
          data.ready_in?.unit ?
          {
            value: Number(data.ready_in.value ?? 0),
            unit: String(data.ready_in.unit) as TimeUnit
          } :
          {
            value: 0,
            unit: TimeUnit.HOURS
          },
        createdAt: new Date(Date.parse(data.created_at) || 0)
      };
      if (offer.contractorId > 0 && offer.price >= 0) {
        ret.push(offer);
      }

      return ret;
    }, [] as Offer[]);

    const lastUpdate =
      data.canceled_at ??
      data.finished_at ??
      data.completed_at ??
      data.started_at ??
      data.appointed_at ??
      data.created_at;

    // заполняем основные свойства заказа
    const order: Order = {
      id: Number(data.id),
      type: Number(data.is_direct) === 1 ? OrderType.Direct : OrderType.Market,
      clientId: Number(data.client),
      city: Number(data.city ?? 0),
      address: String(data.address ?? ''),
      productId: Number(data.product ?? 0),
      description: String(data.description ?? ''),
      desiredPrice: Number(data.desired_price ?? 0),
      status,
      createdAt: new Date(Date.parse(data.created_at) || 0),
      updatedAt: new Date(Date.parse(lastUpdate) || 0),
      contractorOffers,
      contractorOffersCount: Number.isInteger(data.offers_count) ? Number(data.offers_count) : contractorOffers.length,
      attachments
    };
    // отбрасываем бракованные данные
    if (!order.id || !order.clientId || !order.productId || !order.city) {
      return ret;
    }

    const contractorId = data.contractor || data.invited_contractor;
    if (contractorId) order.contractorId = contractorId;

    if (order.type === OrderType.Direct) {
      const services = (data.services || []).reduce((ret, data) => {
        const service = {
          service: String(data.service ?? ''),
          price: Number(data.price ?? 0)
        };
        if (service.service && service.price >= 0) {
          ret.push(service);
        }

        return ret;
      }, [] as OrderServiceDetails[]);
      order.services = services;
    }

    if (data.contractor_price !== null) {
      order.contractorPrice = Number(data.contractor_price ?? 0);
    }

    if (order.status !== OrderStatus.PUBLISHED && order.status !== OrderStatus.REQUESTED && data.agreed_price !== null) {
      order.agreedPrice = Number(data.agreed_price ?? 0);
    }

    ret.push(order);

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
    if (type === OrderType.Market) filter |= OrderAPI.OrdersFilter.market;
    else if (type === OrderType.Direct) filter |= OrderAPI.OrdersFilter.direct;
  }

  for (const stage of stages) {
    if (stage === 'new') filter |= OrderAPI.OrdersFilter.new;
    else if (stage === 'active') filter |= OrderAPI.OrdersFilter.current;
    else if (stage === 'finished') filter |= OrderAPI.OrdersFilter.finished;
  }

  const { data, ...rest } = useQuery({
    queryKey: [ 'user', user.id, 'orders', types, stages ],
    queryFn: () => OrderAPI.getOrderIds(filter),
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
  fetchFn: async (ids: number[]) => {
    const data = await OrderAPI.getOrdersByIds(ids);
    return data ? parseOrders(data) : [];
  },
  createQueryKey: (userId, orderId) => [ 'user', userId, 'order', orderId ],
  extractKeys: (queryKey) => [ Number(queryKey[1]), Number(queryKey[3]) ],
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
  price?: number;
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
  // todo: Добавление изображений не протестировано, потому что нет в UI
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
  const orderOptions: OrderAPI.OrderCreationParams = {
    cityId,
    address,
    productId,
    description,
    price: price!
  };

  if (contractorId) {
    orderOptions.contractorId = contractorId;
    orderOptions.services = services!.map(item => item.service);
  }

  if (attachments) orderOptions.attachments = attachments;

  const orderId = await OrderAPI.createOrder(orderOptions);

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
      if (user.id !== authorizedUserId()) throw new Error('User has changed.');
      if (user.role !== UserRole.Client) throw new Error('User must be a client.');
      if (!orderData.cityId || !orderData.address || !orderData.productId) throw new Error('Mandatory parameter is empty.');
      if (orderData.contractorId && !orderData.services?.length) throw new Error('Mandatory parameter is empty.');
      if (!orderData.contractorId && !(orderData.price! >= 0)) throw new Error('Invalid price.');

      if (orderData.contractorId) {
        const contractorUser = (await getUserById(client, user.id, orderData.contractorId)) as { services?: ServicesMap };
        if (!contractorUser.services?.[orderData.productId]) throw new Error('Bad contractor');
        const contractorServices = contractorUser.services[orderData.productId];
        let validServices = 0;
        let totalPrice = 0;
        for (const orderService of orderData.services!) {
          for (const contractorService of contractorServices) {
            if (orderService.service === contractorService.service && orderService.price === contractorService.price) {
              validServices++;
              totalPrice += orderService.price;
              break;
            }
          }
        }
        if (orderData.services!.length !== validServices) throw new Error('Bad services data');
        orderData.price = totalPrice;
      }

      const ret = await createOrder(user.id, orderData);
      // Инвалидация списка новых заказов
      const orderType = orderData.contractorId ? OrderType.Direct : OrderType.Market;
      const filteredQueries = client.getQueryCache().findAll({ predicate: ({ queryKey }) => (
        queryKey[0] === 'user' &&
        queryKey[1] === user.id &&
        queryKey[2] === 'orders' &&
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
 * @param data.id - ID заказа
 * @param data.address Адрес выполнения услуги
 * @param data.description Описание заказа
 * @param data.attachments Изображения к заказу
 * @param data.desiredPrice Предложенная стоимость работ
 * @returns Промис, который разрешается со списками обновлённых и удалённых прикреплённых файлов для инвалидации кэша
 */
function updateOrder(data: OrderUpdateData) {
  const params: OrderAPI.OrderUpdateParams = { id: data.orderId };
  if (data.address) params.address = data.address;
  if (data.description !== undefined) params.description = data.description;
  if (data.attachments) params.attachments = data.attachments;
  if (data.desiredPrice! > 0) params.price = data.desiredPrice;
  return OrderAPI.updateOrder(params);
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
      if (user.id !== authorizedUserId()) throw new Error('User has changed.');
      if (user.role !== UserRole.Client) throw new Error('User must be a client.');
      if (!orderId) throw new Error('Order ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'user', user.id, 'order', orderId ],
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (user.id !== authorizedUserId()) throw new Error('User has changed.');
      if (!order) throw new Error('Order not found.');
      if (order.clientId !== user.id) throw new Error('User is not the customer.');
      if (
        !([ OrderStatus.DRAFT, OrderStatus.PUBLISHED, OrderStatus.REQUESTED ] as OrderStatus[])
        .includes(order.status)
      ) {
        throw new Error('Invalid order state.');
      }
      const payload = { orderId } as OrderUpdateData;
      if (address !== undefined && address !== '' && address !== order.address) payload.address = address;
      if (description !== undefined && description !== order.description) payload.description = description;
      if (desiredPrice !== undefined && desiredPrice >= 0 && desiredPrice !== order.desiredPrice) payload.desiredPrice = desiredPrice;
      if (attachments && (attachments.length !== order.attachments.length || attachments.some((e, i) => e !== order.attachments[i]))) payload.attachments = attachments;
      if (Object.keys(payload).length <= 1) return;

      await updateOrder(payload);
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'order', orderId ] });
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
  return OrderAPI.cancelOrderByClient(orderId, reason);
}

/**
 * Отменить заказ (сторона мастера)
 * @param orderId - ID заказа
 * @param reason - Причина отмены
 * @returns Промис, который разрешается после успешной отмены
 */
function cancelOrderByContractor(orderId: number, reason: string): Promise<void> {
  return OrderAPI.cancelOrderByContractor(orderId, reason);
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
      if (user.id !== authorizedUserId()) throw new Error('User has changed.');
      if (!orderId) throw new Error('Order ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'user', user.id, 'order', orderId ],
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (user.id !== authorizedUserId()) throw new Error('User has changed.');
      if (!order) throw new Error('Order not found.');

      if (user.role === UserRole.Contractor) {
        if (order.status !== OrderStatus.APPOINTED) throw new Error('Invalid order state.');
        await cancelOrderByContractor(orderId, reason);
      }
      else {
        if (
          !([ OrderStatus.DRAFT, OrderStatus.PUBLISHED, OrderStatus.REQUESTED, OrderStatus.APPOINTED ] as OrderStatus[])
          .includes(order.status)
        ) {
          throw new Error('Invalid order state.');
        }
        await cancelOrderByClient(orderId, reason);
      }
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'order', orderId ] });
      // Инвалидация списков заказов
      // - заказ может быть либо в списке "new", либо в списке "active"
      // - при отмене заказчиком перемещается в "завершённые"
      // - при отмене мастером прямого заказа перемещается в "завершённые"
      // - при отмене мастером заказа с биржи перемещается в "новые"
      const filteredQueries = client.getQueryCache().findAll({ predicate: ({ queryKey, state: {data} }) => (
        queryKey[0] === 'user' &&
        queryKey[1] === user.id &&
        queryKey[2] === 'orders' &&
        Array.isArray(queryKey[3]) &&
        Array.isArray(queryKey[4]) &&
        queryKey[3].includes(order.type) &&
        queryKey[4].some(stage =>
          (
            stage === 'new' &&
            (
              (user.role === UserRole.Contractor && order.type === OrderType.Market) ||
              (user.role === UserRole.Client && Array.isArray(data) && data.includes(orderId))
            )
          ) ||
          (
            stage === 'active' &&
            (
              user.role === UserRole.Contractor ||
              (Array.isArray(data) && data.includes(orderId))
            )
          ) ||
          (
            stage === 'finished' &&
            (
              user.role === UserRole.Client ||
              (user.role === UserRole.Contractor && order.type === OrderType.Direct)
            )
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
  const data = {
    price,
    comment,
    readyInTime: readyIn.value,
    readyInUnit: readyIn.unit,
  };
  return OrderAPI.createOffer(orderId, data);
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
      if (user.id !== authorizedUserId()) throw new Error('User has changed.');
      if (user.role !== UserRole.Contractor) throw new Error('User must be a contractor.');
      if (!orderId) throw new Error('Order ID not specified.');
      if (!price || !comment || !readyIn) throw new Error('Mandatory parameter is empty.');

      const order = await client.fetchQuery({
        queryKey: [ 'user', user.id, 'order', orderId ],
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (user.id !== authorizedUserId()) throw new Error('User has changed.');
      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.PUBLISHED) throw new Error('Invalid order state.');
      if (order.contractorOffers.some(offer => offer.contractorId === user.id)) throw new Error('Offer already exists.');

      await createOffer({ orderId, price, comment, readyIn });
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'order', orderId ] });

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
  const data = {} as Partial<OrderAPI.OfferData>;
  if (price !== undefined) data.price = price;
  if (comment !== undefined) data.comment = comment;
  if (readyIn !== undefined) {
    data.readyInTime = readyIn.value;
    data.readyInUnit = readyIn.unit;
  }
  return OrderAPI.updateOffer(orderId, data);
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
      if (user.id !== authorizedUserId()) throw new Error('User has changed.');
      if (user.role !== UserRole.Contractor) throw new Error('User must be a contractor.');
      if (!orderId) throw new Error('Order ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'user', user.id, 'order', orderId ],
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (user.id !== authorizedUserId()) throw new Error('User has changed.');
      if (!order) throw new Error('Order not found.');
      const offer = order.contractorOffers.find(offer => offer.contractorId === user.id);
      if (order.status !== OrderStatus.PUBLISHED || !offer) throw new Error('Invalid order state.');
      if (
        (price === undefined || offer.price === price) &&
        (comment === undefined || offer.comment === comment) &&
        (readyIn === undefined || (offer.readyIn.value === readyIn.value && offer.readyIn.unit === readyIn.unit))
      ) {
        return;
      }

      await updateOffer({ orderId, price, comment, readyIn });
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'order', orderId ] });

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
  return OrderAPI.acceptOffer(orderId, contractorId);
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
        queryKey: [ 'user', user.id, 'order', orderId ],
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (!order || order.clientId !== user.id) throw new Error('Order not found.');
      if (order.status !== OrderStatus.PUBLISHED) throw new Error('Invalid order state.');
      if (order.clientId !== user.id) throw new Error('User is not the customer.');
      if (!order.contractorOffers.some(offer => offer.contractorId === contractorId)) throw new Error('No offer from the contractor.');

      await acceptOffer(orderId, contractorId);
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'order', orderId ] });
      // Инвалидация списков новых и активных заказов
      // - заказ перемещается из "новых" в "активные"
      const filteredQueries = client.getQueryCache().findAll({ predicate: ({ queryKey }) => (
        queryKey[0] === 'user' &&
        queryKey[1] === user.id &&
        queryKey[2] === 'orders' &&
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
        queryKey: [ 'user', user.id, 'order', orderId ],
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.PUBLISHED) throw new Error('Invalid order state.');
      if (!order.contractorOffers.some(offer => offer.contractorId === user.id)) throw new Error('No offer from the contractor.');

      await cancelOrderByContractor(orderId, reason);
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'order', orderId ] });

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

/**
 * Подтвердить готовность принять заказ (после выбора клиентом)
 * @param orderId - ID заказа
 * @returns Промис, который разрешается после успешного завершения операции
 */
async function acceptInvoice(orderId: number): Promise<void> {
  return OrderAPI.acceptInvoice(orderId);
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
        queryKey: [ 'user', user.id, 'order', orderId ],
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.REQUESTED) throw new Error('Invalid order state.');
      if (order.contractorId !== user.id) throw new Error('No invoice for the contractor.');

      await acceptInvoice(orderId);
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'order', orderId ] });
      // Инвалидация списков новых и активных заказов
      // - заказ перемещается из "новых" в "активные"
      const filteredQueries = client.getQueryCache().findAll({ predicate: ({ queryKey }) => (
        queryKey[0] === 'user' &&
        queryKey[1] === user.id &&
        queryKey[2] === 'orders' &&
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
 * Возвращает мутацию отказа от выполнения прямого заказа мастером
 * Хук может быть вызван без дополнительных условий, но принятие заказа доступно только мастеру,
 * для которого есть предложение о выполнении заказа.
 */
export function useRejectInvoice() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: number, reason?: string }, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.role !== UserRole.Contractor) throw new Error('User must be a contractor.');
      if (!orderId) throw new Error('Order ID not specified.');
      if (!reason) reason = '';

      const order = await client.fetchQuery({
        queryKey: [ 'user', user.id, 'order', orderId ],
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.REQUESTED) throw new Error('Invalid order state.');
      if (order.contractorId !== user.id) throw new Error('No invoice for the contractor.');

      await cancelOrderByContractor(orderId, reason);
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'order', orderId ] });
      // Инвалидация списков новых и завершённых/отменённых заказов
      // - заказ перемещается из "новых" в "завершённые"
      const filteredQueries = client.getQueryCache().findAll({ predicate: ({ queryKey }) => (
        queryKey[0] === 'user' &&
        queryKey[1] === user.id &&
        queryKey[2] === 'orders' &&
        Array.isArray(queryKey[3]) &&
        Array.isArray(queryKey[4]) &&
        queryKey[3].includes(OrderType.Direct) &&
        queryKey[4].some(stage => stage === 'new' || stage === 'finished')
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
    rejectInvoice: mutateAsync
  }
}

/**
 * Начать работу над заказом
 * @param orderId - ID заказа
 * @returns Промис, который разрешается после успешного завершения операции
 */
function startOrderWork(orderId: number): Promise<void> {
  return OrderAPI.startOrderWork(orderId);
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
        queryKey: [ 'user', user.id, 'order', orderId ],
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.APPOINTED) throw new Error('Invalid order state.');
      if (order.contractorId !== user.id) throw new Error('User is not the contractor.');

      await startOrderWork(orderId);
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'order', orderId ] });

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
function finishOrderWork(orderId: number): Promise<void> {
  return OrderAPI.finishOrderWork(orderId);
}

/**
 * Возвращает мутацию для завершения работы над заказом
 * Хук может быть вызван без дополнительных условий, но завершение работы доступно только мастеру,
 * выполняющему заказ.
 */
export function useFinishOrderWork() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async (orderId: number, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.role !== UserRole.Contractor) throw new Error('User must be a contractor.');
      if (!orderId) throw new Error('Order ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'user', user.id, 'order', orderId ],
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.IN_PROGRESS) throw new Error('Invalid order state.');
      if (order.contractorId !== user.id) throw new Error('User is not the contractor.');

      await finishOrderWork(orderId);
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'order', orderId ] });

      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    finishOrderWork: mutateAsync
  }
}

// ==================== 6. Подтверждение и завершение (клиент) ====================

/**
 * Подтвердить выполнение заказа (для клиента)
 * @param orderId - ID заказа
 * @returns Промис, который разрешается после успешного завершения операции
 */
function confirmOrderCompletion(orderId: number): Promise<void> {
  return OrderAPI.completeOrder(orderId);
}

/**
 * Возвращает мутацию для подтверждения выполнения заказа
 * Хук может быть вызван без дополнительных условий, но подтверждение выполнения доступно только клиенту,
 * создавшему заказ.
 */
export function useConfirmOrderCompletion() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async (orderId: number, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.role !== UserRole.Client) throw new Error('User must be a client.');
      if (!orderId) throw new Error('Order ID not specified.');

      const order = await client.fetchQuery({
        queryKey: [ 'user', user.id, 'order', orderId ],
        queryFn: getOrderById,
        staleTime: CONFIG.API?.ordersDataRefetchTime ?? 120000
      });

      if (!order) throw new Error('Order not found.');
      if (order.status !== OrderStatus.COMPLETED) throw new Error('Invalid order state.');
      if (order.clientId !== user.id) throw new Error('User is not the customer.');

      await confirmOrderCompletion(orderId);
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'order', orderId ] });
      // Инвалидация списков активных и завершённых заказов
      // - заказ перемещается из "активных" в "завершённые"
      const filteredQueries = client.getQueryCache().findAll({ predicate: ({ queryKey }) => (
        queryKey[0] === 'user' &&
        queryKey[1] === user.id &&
        queryKey[2] === 'orders' &&
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
    confirmOrderCompletion: mutateAsync
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
