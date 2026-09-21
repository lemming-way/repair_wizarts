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
  chat_id: string;
  from?: number;
  text?: string;
  event_type?: string;
  audio_id?: number;
  caption?: string;
  file_id?: number;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  modified: string;
  editor?: number;
  created: string;
  author?: number;
  type: number;
  related?: number;
  unread: 0 | 1;
  partner_read_time?: string;
  editable: 0 | 1;
  deletable: 0 | 1;
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
      chatId: `${orderId}:${contractorId}`,
    }
  };
  const result = await post<AllChatMessagesResponse>('script/template/repair_api', payload);
  return result ?? { server_time: '', messages: [] };
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
      chatId: `${orderId}:${contractorId}`,
      since
    }
  };
  const result = await post<UpdatedChatMessagesResponse>('script/template/repair_api', payload);
  return result ?? { server_time: '', messages: [] };
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

export const MessageType = {
  Regular: 1,
  System: 31,
  Audio: 32,
  Attachment: 33
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
type MessageType = typeof MessageType[keyof typeof MessageType];

type PostMessageData = {
  type?: typeof MessageType['Regular' | 'Audio' | 'Attachment'];
  text?: string;
  file?: File;
  replyTo?: number;
}

/**
 * Отправить новое сообщение в чат.
 * Доступно только для авторизованного пользователя.
 * @param id ID чата
 * @returns Промис, который разрешается после успешного выполнения операции.
 */
export async function postMessage(id: string, message: PostMessageData): Promise<number | null> {
  const {
    type = 1,
    text = '',
    file = null,
    replyTo = null
  } = message;
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'postMessage',
      chatId: id,
      type,
      text,
      replyTo
    }
  } as Record<string, unknown>;
  if (file) {
    payload.attachment = file;
  }
  const result = await post<{id?: string | number}>('script/template/repair_api', payload);
  const messageId = Number(result.id);
  if (Number.isInteger(messageId) && messageId > 0) return messageId;
  else return null;
}

/**
 * Изменить сообщение в чате.
 * Доступно только для авторизованного пользователя.
 * Доступно только автору сообщения.
 * @param id ID сообщения
 * @param text Новый текст сообщения
 * @returns Промис, который разрешается после успешного выполнения операции.
 */
export async function editMessage(id: number, text: string): Promise<void> {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'editMessage',
      id,
      text
    }
  }
  const result = await post<void>('script/template/repair_api', payload);
  return result;
}

/**
 * Удалить сообщение из чата.
 * Доступно только для авторизованного пользователя.
 * Доступно только автору сообщения.
 * @param id ID сообщения
 * @returns Промис, который разрешается после успешного выполнения операции.
 */
export async function deleteMessage(id: number): Promise<void> {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'deleteMessage',
      id
    }
  }
  const result = await post<void>('script/template/repair_api', payload);
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

/**
 * Пометить все сообщения в чате как прочитанные.
 * Доступно только для авторизованного пользователя.
 * @param chatId ID чата
 * @returns Список ID помеченных сообщений.
 */
export async function markAllAsRead(chatId: string): Promise<number[]> {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'markAllAsRead',
      id: chatId
    }
  }
  const result = await post<number[]>('script/template/repair_api', payload);
  return result;
}

/**
 * Пометить чат открытым или закрытым.
 * Доступно только для авторизованного пользователя.
 * @param id ID чата
 * @param isOpen открыт чат или закрыт
 * @returns Промис, который разрешается после успешного выполнения операции.
 */
export async function markChatAsOpen(id: string, isOpen: boolean): Promise<void> {
  const payload = {
    is_var: 1,
    s_t_data: {
      action: 'chatOpenClose',
      id,
      open: isOpen
    }
  }
  const result = await post<void>('script/template/repair_api', payload);
  return result;
}
