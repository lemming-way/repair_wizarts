/**
 * Модуль api для работы с сообщениями чатов
 *
 * @summary
 * **Типы:**
 *
 * **Получение данных:**
 *
 * **Изменение данных:**
 *
 */
import { post } from './request';

// ==================== Типы данных ====================

/**
 * Информация о чате.
 */
export type ChatRecord = {
  order: number;
  client: number;
  contractor: number;
  unread_count: number;
  first_unread: number | null;
  last_time: string;
  is_open: 0 | 1;
};

/**
 * Список всех сообщений
 */
type AllChatMessagesResponse = {
  server_time: string;
  messages: number[] | null;
}

/**
 * Список обновлённых сообщений
 */
type UpdatedChatMessagesResponse = {
  server_time: string;
  messages: Array<{ id: number, del: 0 | 1 }> | null;
}

/**
 * Сообщение чата.
 */
export type ChatMessageRecord = {
  id: number;
  from: number | null;
  text: string;
  modified: string;
  editor: number | null;
  created: string;
  author: number | null;
  type: number;
  related: number | null;
  unread: 0 | 1;
};


// ==================== Функции API ====================

/**
 * Получить ID активных чатов.
 * Доступно только для авторизованного пользователя.
 * @returns Промис, который разрешается со списком ID чатов.
 */
export async function getActiveChatIds(): Promise<string[]> {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'getActiveChatIds'
    }
  }
  const result = await post<string[]>('script/template/repair_api', payload);
  return result;
}

/**
 * Получить информацию о чатах по их ID
 * Доступно только для авторизованного пользователя.
 * @param ids Список ID чатов
 * @returns Промис, который разрешается со списком данных о чатах.
 */
export async function getChatsByIds(ids: string[]): Promise<ChatRecord[]> {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'getChats',
      ids
    }
  }
  const result = await post<ChatRecord[]>('script/template/repair_api', payload);
  return result;
}

/**
 * Получить список всех сообщений чата.
 * Доступно только для авторизованного пользователя.
 * @param orderId ID заказа, связанного с чатом
 * @param contractorId ID мастера, связанного с чатом
 * @returns Промис, который разрешается со списком id сообщений чата.
 */
export async function getAllChatMessages(orderId: number, contractorId: number): Promise<AllChatMessagesResponse> {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'getMessageIds',
      chat_id: `${orderId}:${contractorId}`,
    }
  }
  const result = await post<AllChatMessagesResponse>('script/template/repair_api', payload);
  return result;
}

/**
 * Получить список всех новых и изменённых сообщений чата.
 * Доступно только для авторизованного пользователя.
 * @param orderId ID заказа, связанного с чатом
 * @param contractorId ID мастера, связанного с чатом
 * @param since Момент времени, с которого проверяются изменения
 * @returns Промис, который разрешается со списком id и статусов сообщений чата.
 */
export async function getUpdatedChatMessages(orderId: number, contractorId: number, since: string): Promise<UpdatedChatMessagesResponse> {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'getUpdatedMessageIds',
      chat_id: `${orderId}:${contractorId}`,
      since
    }
  }
  const result = await post<UpdatedChatMessagesResponse>('script/template/repair_api', payload);
  return result;
}

/**
 * Получить сообщения.
 * Доступно только для авторизованного пользователя.
 * @param ids Список ID сообщений для получения
 * @returns Промис, который разрешается со списком сообщений.
 */
export async function getMessagesByIds(ids: number[]): Promise<ChatMessageRecord[]> {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'getMessages',
      ids
    }
  }
  const result = await post<ChatMessageRecord[]>('script/template/repair_api', payload);
  return result;
}

/**
 * Пометить сообщения как прочитанные.
 * Доступно только для авторизованного пользователя.
 * @param ids Список ID прочитанных сообщений
 * @returns Промис, который разрешается после успешного выполнения операции.
 */
export async function markMessagesAsRead(ids: number[]): Promise<void> {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'markMessagesAsRead',
      ids
    }
  }
  const result = await post<void>('script/template/repair_api', payload);
  return result;
}
