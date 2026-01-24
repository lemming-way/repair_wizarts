/**
 * Модуль для работы с глобальным состоянием заказов
 *
 * @summary
 * **Типы данных:**
 *
 * **Функции, влияющие на глобальное состояние:**
 *
 * **Функции, не влияющие на глобальное состояние:**
 */
import { useQuery } from '@tanstack/react-query';

import CONFIG from '../constants';
import { getContractorsByService } from './api/order';
import { UserProfile, useUser, useUsersByIds } from './user';

// ==================== Типы данных ====================

//~ export type Contractor = {
  //~ id: number;
  //~ name: string;
  //~ rating: number;
  //~ reviewsCount: number;
  //~ avatar?: string;
  //~ specialization: string[];
  //~ isOnline: boolean;
  //~ // ... другие поля
//~ }

export type Service = {
  id: number;
  title: string;
  basePrice: number;
  duration: string;
  category: string;
  // ... другие поля
}

export type Order = {
  id: number;
  clientId: number;
  contractorId?: number;
  serviceId: number;
  status: OrderStatus;
  description: string;
  agreedPrice?: number;
  desiredBudget: number;
  desiredDate?: string;
  createdAt: string;
  updatedAt: string;
  attachments: string[];
  // ... другие поля
}

export type Offer = {
  id: number;
  orderId: number;
  contractorId: number;
  price: number;
  dueDate: string;
  comment: string;
  status: OfferStatus;
  createdAt: string;
  // ... другие поля
}

export type Review = {
  id: number;
  orderId: number;
  authorId: number;
  rating: number;
  comment: string;
  createdAt: string;
  // ... другие поля
}

export enum OrderStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  NEGOTIATION = 'negotiation',
  MASTER_CONFIRMED = 'contractor_confirmed',
  AWAITING_PAYMENT = 'awaiting_payment',
  PAID = 'paid',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CLOSED = 'closed',
  DISPUTE = 'dispute',
  CANCELLED = 'cancelled'
}

export enum OfferStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  REVOKED = 'revoked'
}

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
  const { user } = useUser();
  const queryResult = useQuery({
    queryKey: [ 'contractors', service, city, rating, isOnline ],
    queryFn: () => getContractorsByService({ serviceId: service, cityId: city, minRating: rating, isOnline }),
    staleTime: CONFIG.API?.userDataStaleTime ?? Infinity,
    enabled: !!(user as UserProfile).id  // Доступно только авторизованному пользователю
  });

  const contractors = queryResult.data || [];
  return useUsersByIds(contractors);
}

/**
 * Получить отзывы о мастере
 * @param contractorId - ID мастера
 * @param page - Номер страницы (для пагинации)
 * @param limit - Количество отзывов на странице
 * @returns Список отзывов о мастере
 */
declare function getContractorReviews(
  contractorId: number,
  page?: number,
  limit?: number
): Promise<{ reviews: Review[]; total: number; page: number }>;

// ==================== 2. Управление заказами (клиентская сторона) ====================

/**
 * Создать новый заказ/проект
 * @param orderData - Данные для создания заказа
 * @returns Созданный заказ
 */
declare function createOrder(orderData: {
  serviceId: number;
  contractorId?: number | null;
  description: string;
  attachments?: File[];
  desiredBudget: number;
  desiredDate?: string;
}): Promise<Order>;

/**
 * Получить список заказов клиента с фильтрацией по статусу
 * @param status - Статус заказов для фильтрации
 * @param page - Номер страницы
 * @param limit - Количество заказов на странице
 * @returns Список заказов клиента
 */
declare function getClientOrders(
  status?: OrderStatus,
  page?: number,
  limit?: number
): Promise<{ orders: Order[]; total: number; page: number }>;

/**
 * Получить детальную информацию о заказе
 * @param orderId - ID заказа
 * @returns Детальная информация о заказе
 */
declare function getOrderDetails(orderId: number): Promise<Order>;

/**
 * Редактировать заказ (доступно в определенных статусах)
 * @param orderId - ID заказа
 * @param updates - Обновленные данные заказа
 * @returns Обновленный заказ
 */
declare function updateOrder(
  orderId: number,
  updates: Partial<{
    description: string;
    attachments: File[];
    desiredBudget: number;
    desiredDate: string;
  }>
): Promise<Order>;

/**
 * Отменить заказ (клиентская сторона)
 * @param orderId - ID заказа
 * @param reason - Причина отмены
 * @returns Результат отмены
 */
declare function cancelOrderByClient(
  orderId: number,
  reason: string
): Promise<{ success: boolean; message: string }>;

// ==================== 3. Работа с предложениями (откликами мастеров) ====================

/**
 * Получить список предложений по заказу
 * @param orderId - ID заказа
 * @returns Список предложений от мастеров
 */
declare function getOrderOffers(orderId: number): Promise<Offer[]>;

/**
 * Отправить предложение по заказу (для мастера)
 * @param orderId - ID заказа
 * @param offerData - Данные предложения
 * @returns Созданное предложение
 */
declare function createOffer(
  orderId: number,
  offerData: {
    price: number;
    dueDate: string;
    comment: string;
  }
): Promise<Offer>;

/**
 * Обновить предложение по заказу (для мастера)
 * @param offerId - ID предложения
 * @param updates - Обновленные данные предложения
 * @returns Обновленное предложение
 */
declare function updateOffer(
  offerId: number,
  updates: Partial<{
    price: number;
    dueDate: string;
    comment: string;
  }>
): Promise<Offer>;

/**
 * Принять предложение мастера (для клиента)
 * @param offerId - ID предложения
 * @returns Обновленный заказ с выбранным мастером
 */
declare function acceptOffer(offerId: number): Promise<Order>;

/**
 * Отозвать предложение (для мастера)
 * @param offerId - ID предложения
 * @returns Результат отзыва
 */
declare function revokeOffer(offerId: number): Promise<{ success: boolean }>;

// ==================== 4. Управление заказами (сторона мастера) ====================

/**
 * Получить ленту заказов для мастера
 * @param type - Тип заказов для фильтрации
 * @param page - Номер страницы
 * @param limit - Количество заказов на странице
 * @returns Список заказов
 */
declare function getContractorOrders(
  type?: 'public' | 'personal' | 'my_offers' | 'active',
  page?: number,
  limit?: number
): Promise<{ orders: Order[]; total: number; page: number }>;

/**
 * Получить список отправленных мастером предложений
 * @param status - Статус предложений для фильтрации
 * @param page - Номер страницы
 * @param limit - Количество предложений на странице
 * @returns Список предложений мастера
 */
declare function getContractorOffers(
  status?: OfferStatus,
  page?: number,
  limit?: number
): Promise<{ offers: Offer[]; total: number; page: number }>;

/**
 * Отказаться от персонального заказа (для мастера)
 * @param orderId - ID заказа
 * @param reason - Причина отказа
 * @returns Результат отказа
 */
declare function rejectOrderByContractor(
  orderId: number,
  reason: string
): Promise<{ success: boolean }>;

/**
 * Подтвердить готовность принять заказ (после выбора клиентом)
 * @param orderId - ID заказа
 * @returns Обновленный заказ
 */
declare function confirmOrderByContractor(orderId: number): Promise<Order>;

/**
 * Начать работу над заказом (после подтверждения оплаты)
 * @param orderId - ID заказа
 * @returns Обновленный заказ
 */
declare function startOrderWork(orderId: number): Promise<Order>;

/**
 * Отметить заказ как выполненный (для мастера)
 * @param orderId - ID заказа
 * @param completionDetails - Детали выполнения
 * @returns Обновленный заказ
 */
declare function completeOrderByContractor(
  orderId: number,
  completionDetails?: {
    notes?: string;
    resultFiles?: File[];
  }
): Promise<Order>;

/**
 * Отказаться от выполнения заказа в процессе работы (форс-мажор)
 * @param orderId - ID заказа
 * @param reason - Причина отказа
 * @returns Результат отказа
 */
declare function cancelOrderByContractor(
  orderId: number,
  reason: string
): Promise<{ success: boolean; message: string }>;

// ==================== 5. Подтверждение и завершение (клиент) ====================

/**
 * Подтвердить мастера/условия после согласования (для клиента)
 * @param orderId - ID заказа
 * @returns Обновленный заказ
 */
declare function confirmOrderByClient(orderId: number): Promise<Order>;

/**
 * Подтвердить выполнение заказа (для клиента)
 * @param orderId - ID заказа
 * @param reviewData - Данные для отзыва (опционально)
 * @returns Результат подтверждения
 */
declare function verifyOrderCompletion(
  orderId: number,
  reviewData?: {
    rating: number;
    comment?: string;
  }
): Promise<{ success: boolean; order: Order }>;

/**
 * Открыть спор по заказу
 * @param orderId - ID заказа
 * @param disputeData - Данные спора
 * @returns Результат открытия спора
 */
declare function openOrderDispute(
  orderId: number,
  disputeData: {
    reason: string;
    description: string;
    attachments?: File[];
  }
): Promise<{ success: boolean; disputeId: number }>;

// ==================== 6. Вспомогательные и системные ====================

/**
 * Загрузить файлы к заказу
 * @param orderId - ID заказа
 * @param files - Файлы для загрузки
 * @param uploadedBy - ID пользователя, загружающего файлы
 * @returns Результат загрузки
 */
declare function uploadOrderFiles(
  orderId: number,
  files: File[],
  uploadedBy: number
): Promise<{ success: boolean; fileUrls: string[] }>;

/**
 * Webhook для обработки платежей от платежной системы
 * @param paymentData - Данные платежа от платежного шлюза
 * @returns Результат обработки
 */
declare function handlePaymentWebhook(paymentData: {
  orderId: number;
  paymentId: string;
  status: 'success' | 'failed' | 'refunded';
  amount: number;
  signature?: string;
}): Promise<{ success: boolean; order?: Order }>;

/**
 * Получить историю статусов заказа
 * @param orderId - ID заказа
 * @returns История изменений статуса заказа
 */
declare function getOrderStatusHistory(orderId: number): Promise<
  Array<{
    status: OrderStatus;
    changedAt: string;
    changedBy: number;
    comment?: string;
  }>
>;

/**
 * Получить статистику по заказам для дашборда
 * @param userId - ID пользователя
 * @param role - Роль пользователя ('client' или 'contractor')
 * @returns Статистика заказов
 */
declare function getOrderStatistics(
  userId: number,
  role: 'client' | 'contractor'
): Promise<{
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  totalRevenue?: number;
  averageRating?: number;
}>;
