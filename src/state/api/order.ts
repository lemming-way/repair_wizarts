/**
 * Модуль api для работы с заказами
 *
 * @summary
 * **Типы:**
 *
 * **Авторизация:**
 *
 * **Получение данных:**
 *
 * Изменение данных:**
 *
 * **Вспомогательные функции:**
 */
import { post } from './request';

// ==================== 1. Каталог и выбор мастера ====================

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

//~ /**
 //~ * Получить отзывы о мастере
 //~ * @param contractorId - ID мастера
 //~ * @param page - Номер страницы (для пагинации)
 //~ * @param limit - Количество отзывов на странице
 //~ * @returns Список отзывов о мастере
 //~ */
//~ export declare function getContractorReviews(
  //~ contractorId: number,
  //~ page?: number,
  //~ limit?: number
//~ ): Promise<{ reviews: Review[]; total: number; page: number }>;

//~ // ==================== 2. Управление заказами (клиентская сторона) ====================

//~ /**
 //~ * Создать новый заказ/проект
 //~ * @param orderData - Данные для создания заказа
 //~ * @returns Созданный заказ
 //~ */
//~ export declare function createOrder(orderData: {
  //~ serviceId: number;
  //~ contractorId?: number | null;
  //~ description: string;
  //~ attachments?: File[];
  //~ desiredBudget: number;
  //~ desiredDate?: string;
//~ }): Promise<Order>;

//~ /**
 //~ * Получить список заказов клиента с фильтрацией по статусу
 //~ * @param status - Статус заказов для фильтрации
 //~ * @param page - Номер страницы
 //~ * @param limit - Количество заказов на странице
 //~ * @returns Список заказов клиента
 //~ */
//~ export declare function getClientOrders(
  //~ status?: OrderStatus,
  //~ page?: number,
  //~ limit?: number
//~ ): Promise<{ orders: Order[]; total: number; page: number }>;

//~ /**
 //~ * Получить детальную информацию о заказе
 //~ * @param orderId - ID заказа
 //~ * @returns Детальная информация о заказе
 //~ */
//~ export declare function getOrderDetails(orderId: number): Promise<Order>;

//~ /**
 //~ * Редактировать заказ (доступно в определенных статусах)
 //~ * @param orderId - ID заказа
 //~ * @param updates - Обновленные данные заказа
 //~ * @returns Обновленный заказ
 //~ */
//~ export declare function updateOrder(
  //~ orderId: number,
  //~ updates: Partial<{
    //~ description: string;
    //~ attachments: File[];
    //~ desiredBudget: number;
    //~ desiredDate: string;
  //~ }>
//~ ): Promise<Order>;

//~ /**
 //~ * Отменить заказ (клиентская сторона)
 //~ * @param orderId - ID заказа
 //~ * @param reason - Причина отмены
 //~ * @returns Результат отмены
 //~ */
//~ export declare function cancelOrderByClient(
  //~ orderId: number,
  //~ reason: string
//~ ): Promise<{ success: boolean; message: string }>;

//~ // ==================== 3. Работа с предложениями (откликами мастеров) ====================

//~ /**
 //~ * Получить список предложений по заказу
 //~ * @param orderId - ID заказа
 //~ * @returns Список предложений от мастеров
 //~ */
//~ export declare function getOrderOffers(orderId: number): Promise<Offer[]>;

//~ /**
 //~ * Отправить предложение по заказу (для мастера)
 //~ * @param orderId - ID заказа
 //~ * @param offerData - Данные предложения
 //~ * @returns Созданное предложение
 //~ */
//~ export declare function createOffer(
  //~ orderId: number,
  //~ offerData: {
    //~ price: number;
    //~ dueDate: string;
    //~ comment: string;
  //~ }
//~ ): Promise<Offer>;

//~ /**
 //~ * Обновить предложение по заказу (для мастера)
 //~ * @param offerId - ID предложения
 //~ * @param updates - Обновленные данные предложения
 //~ * @returns Обновленное предложение
 //~ */
//~ export declare function updateOffer(
  //~ offerId: number,
  //~ updates: Partial<{
    //~ price: number;
    //~ dueDate: string;
    //~ comment: string;
  //~ }>
//~ ): Promise<Offer>;

//~ /**
 //~ * Принять предложение мастера (для клиента)
 //~ * @param offerId - ID предложения
 //~ * @returns Обновленный заказ с выбранным мастером
 //~ */
//~ export declare function acceptOffer(offerId: number): Promise<Order>;

//~ /**
 //~ * Отозвать предложение (для мастера)
 //~ * @param offerId - ID предложения
 //~ * @returns Результат отзыва
 //~ */
//~ export declare function revokeOffer(offerId: number): Promise<{ success: boolean }>;

//~ // ==================== 4. Управление заказами (сторона мастера) ====================

//~ /**
 //~ * Получить ленту заказов для мастера
 //~ * @param type - Тип заказов для фильтрации
 //~ * @param page - Номер страницы
 //~ * @param limit - Количество заказов на странице
 //~ * @returns Список заказов
 //~ */
//~ export declare function getContractorOrders(
  //~ type?: 'public' | 'personal' | 'my_offers' | 'active',
  //~ page?: number,
  //~ limit?: number
//~ ): Promise<{ orders: Order[]; total: number; page: number }>;

//~ /**
 //~ * Получить список отправленных мастером предложений
 //~ * @param status - Статус предложений для фильтрации
 //~ * @param page - Номер страницы
 //~ * @param limit - Количество предложений на странице
 //~ * @returns Список предложений мастера
 //~ */
//~ export declare function getContractorOffers(
  //~ status?: OfferStatus,
  //~ page?: number,
  //~ limit?: number
//~ ): Promise<{ offers: Offer[]; total: number; page: number }>;

//~ /**
 //~ * Отказаться от персонального заказа (для мастера)
 //~ * @param orderId - ID заказа
 //~ * @param reason - Причина отказа
 //~ * @returns Результат отказа
 //~ */
//~ export declare function rejectOrderByContractor(
  //~ orderId: number,
  //~ reason: string
//~ ): Promise<{ success: boolean }>;

//~ /**
 //~ * Подтвердить готовность принять заказ (после выбора клиентом)
 //~ * @param orderId - ID заказа
 //~ * @returns Обновленный заказ
 //~ */
//~ export declare function confirmOrderByContractor(orderId: number): Promise<Order>;

//~ /**
 //~ * Начать работу над заказом (после подтверждения оплаты)
 //~ * @param orderId - ID заказа
 //~ * @returns Обновленный заказ
 //~ */
//~ export declare function startOrderWork(orderId: number): Promise<Order>;

//~ /**
 //~ * Отметить заказ как выполненный (для мастера)
 //~ * @param orderId - ID заказа
 //~ * @param completionDetails - Детали выполнения
 //~ * @returns Обновленный заказ
 //~ */
//~ export declare function completeOrderByContractor(
  //~ orderId: number,
  //~ completionDetails?: {
    //~ notes?: string;
    //~ resultFiles?: File[];
  //~ }
//~ ): Promise<Order>;

//~ /**
 //~ * Отказаться от выполнения заказа в процессе работы (форс-мажор)
 //~ * @param orderId - ID заказа
 //~ * @param reason - Причина отказа
 //~ * @returns Результат отказа
 //~ */
//~ export declare function cancelOrderByContractor(
  //~ orderId: number,
  //~ reason: string
//~ ): Promise<{ success: boolean; message: string }>;

//~ // ==================== 5. Подтверждение и завершение (клиент) ====================

//~ /**
 //~ * Подтвердить мастера/условия после согласования (для клиента)
 //~ * @param orderId - ID заказа
 //~ * @returns Обновленный заказ
 //~ */
//~ export declare function confirmOrderByClient(orderId: number): Promise<Order>;

//~ /**
 //~ * Подтвердить выполнение заказа (для клиента)
 //~ * @param orderId - ID заказа
 //~ * @param reviewData - Данные для отзыва (опционально)
 //~ * @returns Результат подтверждения
 //~ */
//~ export declare function verifyOrderCompletion(
  //~ orderId: number,
  //~ reviewData?: {
    //~ rating: number;
    //~ comment?: string;
  //~ }
//~ ): Promise<{ success: boolean; order: Order }>;

//~ /**
 //~ * Открыть спор по заказу
 //~ * @param orderId - ID заказа
 //~ * @param disputeData - Данные спора
 //~ * @returns Результат открытия спора
 //~ */
//~ export declare function openOrderDispute(
  //~ orderId: number,
  //~ disputeData: {
    //~ reason: string;
    //~ description: string;
    //~ attachments?: File[];
  //~ }
//~ ): Promise<{ success: boolean; disputeId: number }>;

//~ // ==================== 6. Вспомогательные и системные ====================

//~ /**
 //~ * Загрузить файлы к заказу
 //~ * @param orderId - ID заказа
 //~ * @param files - Файлы для загрузки
 //~ * @param uploadedBy - ID пользователя, загружающего файлы
 //~ * @returns Результат загрузки
 //~ */
//~ export declare function uploadOrderFiles(
  //~ orderId: number,
  //~ files: File[],
  //~ uploadedBy: number
//~ ): Promise<{ success: boolean; fileUrls: string[] }>;

//~ /**
 //~ * Webhook для обработки платежей от платежной системы
 //~ * @param paymentData - Данные платежа от платежного шлюза
 //~ * @returns Результат обработки
 //~ */
//~ export declare function handlePaymentWebhook(paymentData: {
  //~ orderId: number;
  //~ paymentId: string;
  //~ status: 'success' | 'failed' | 'refunded';
  //~ amount: number;
  //~ signature?: string;
//~ }): Promise<{ success: boolean; order?: Order }>;

//~ /**
 //~ * Получить историю статусов заказа
 //~ * @param orderId - ID заказа
 //~ * @returns История изменений статуса заказа
 //~ */
//~ export declare function getOrderStatusHistory(orderId: number): Promise<
  //~ Array<{
    //~ status: OrderStatus;
    //~ changedAt: string;
    //~ changedBy: number;
    //~ comment?: string;
  //~ }>
//~ >;

//~ /**
 //~ * Получить статистику по заказам для дашборда
 //~ * @param userId - ID пользователя
 //~ * @param role - Роль пользователя ('client' или 'contractor')
 //~ * @returns Статистика заказов
 //~ */
//~ export declare function getOrderStatistics(
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
