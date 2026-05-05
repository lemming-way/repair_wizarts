/**
 * Модуль для работы с чатами
 *
 * @summary
 * **Типы данных:**
 *
 * **Функции, влияющие на глобальное состояние:**
 *
 * **Функции, не влияющие на глобальное состояние:**
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
import * as MessageAPI from './api/messages';
import { authorizedUserId } from './auth';
import { UserRole, useUser } from './user';
import type { UserProfile } from './user';

const EMPTY_ARRAY = Object.freeze([]);

export type ChatData = {
  orderId: number;
  clientId: number;
  contractorId: number;
  unreadCount: number;
  firstUnread?: number;
  lastUpdate?: Date;
}

/**
 * Типы сообщений
 */
export enum MessageType {
  User = 1,
  System,
  Admin
}

/**
 * Форматы сообщений
 */
export enum MessageFormat {
  Text = 1,
  Audio,
  Files
}

/**
 * Сообщение чата
 */
export type Message = {
  id: number;
  from?: number;
  text: string;
  audio?: number;
  files?: number[];
  modified?: Date;
  editorId?: number;
  created: Date;
  authorId?: number;
  type: MessageType;
  format: MessageFormat;
  relatedMessage?: number;
  unread: boolean;
}

async function getActiveChats() {
  const chats = await MessageAPI.getActiveChats();
  const ret: ChatData[] = chats.reduce((acc, chat) => {
    const chatItem: ChatData = {
      orderId: Number.isInteger(chat.order) && chat.order > 0 ? chat.order : 0,
      clientId: Number.isInteger(chat.client) && chat.client > 0 ? chat.client : 0,
      contractorId: Number.isInteger(chat.contractor) && chat.contractor > 0 ? chat.contractor : 0,
      unreadCount: Number.isInteger(chat.unread_count) && chat.unread_count > 0 ? chat.unread_count : 0,
    }
    if (!chatItem.orderId || !chatItem.clientId || !chatItem.contractorId) return acc;
    if (Number.isInteger(chat.first_unread) && chat.first_unread! > 0) chatItem.firstUnread = chat.first_unread!;
    if (!!chat.last_time && chat.last_time !== '0000-00-00 00:00:00') {
      const date = new Date(String(chat.last_time));
      if (!Number.isNaN(date.getTime())) chatItem.lastUpdate = date;
    }
    acc.push(chatItem);
    return acc;
  }, [] as ChatData[]);
  return ret;
}

export function useActiveChats() {
  const { user } = useUser() as { user: UserProfile };
  const { data, ...ret } = useQuery({
    queryKey: [ 'user', user.id, 'active-chats' ],
    queryFn: getActiveChats,
    refetchInterval: CONFIG.API?.chatsDataRefetchTime ?? 300000,
    staleTime: CONFIG.API?.chatsDataRefetchTime ?? 300000,
    enabled: !!user.id && user.id === authorizedUserId()  // Доступно только авторизованному пользователю
  });

  const chats = data || EMPTY_ARRAY;
  return {
    ...ret,
    chats
  };
}

const lastChatRefetchTime: Map<string, string> = new Map();
async function getChatMessageIds(client: QueryClient, userId: number, orderId: number, contractorId: number): Promise<number[]> {
  const chatId = `${orderId}:${contractorId}`;
  const lastRefetchTime = lastChatRefetchTime.get(`${userId}:${chatId}`);
  const previous = client.getQueryData<number[]>([ 'user', userId, 'chat', chatId ]);
  if (lastRefetchTime && previous) {
    const resultSet = new Set(previous);
    const result = await MessageAPI.getUpdatedChatMessages(orderId, contractorId, lastRefetchTime);
    for (const message of (result.messages ?? [])) {
      const id = Number(message.id);
      if (!Number.isInteger(id) || id <= 0) continue;
      if (message.del) {
        client.removeQueries({ queryKey: [ 'user', userId, 'message', id ] });
        if (resultSet.has(id)) resultSet.delete(id);
      }
      else {
        client.invalidateQueries({ queryKey: [ 'user', userId, 'message', id ] });
        if (!resultSet.has(id)) resultSet.add(id);
      }
    }
    lastChatRefetchTime.set(`${userId}:${chatId}`, result.server_time);
    return [ ...resultSet ];
  }
  else {
    const result = await MessageAPI.getAllChatMessages(orderId, contractorId);
    lastChatRefetchTime.set(`${userId}:${chatId}`, result.server_time);
    const ids: number[] = (result.messages ?? []).map(Number).filter(id => Number.isInteger(id) && id > 0);
    for (const id of ids) {
      client.invalidateQueries({ queryKey: [ 'user', userId, 'message', id ] });
    }
    return ids;
  }
}

export function useChat(orderId: number, contractorId: number) {
  const chatId = `${orderId}:${contractorId}`;
  const { user } = useUser() as { user: UserProfile };
  const { data, ...ret } = useQuery({
    queryKey: [ 'user', user.id, 'chat', chatId ],
    queryFn: ({ client }) => getChatMessageIds(client, user.id, orderId, contractorId),
    refetchInterval: CONFIG.API?.chatMessagesRefetchTime ?? 10000,
    staleTime: CONFIG.API?.chatMessagesRefetchTime ?? 10000,
    enabled: !!user.id && user.id === authorizedUserId()  // Доступно только авторизованному пользователю
  });

  const messageIds = data || EMPTY_ARRAY;
  return {
    ...ret,
    messageIds
  };
}

let messagesToFetch: {
  userId: number;
  messageId: number;
  resolve: (message: Message | null) => void;
  reject: (error: unknown) => void;
}[] = [];
let messagesFetchTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Получить сообщение по ID
 * Использует батчинг для объединения нескольких запросов в один API вызов.
 * @param messageId ID сообщения
 * @param queryClient Инстанс QueryClient для управления кэшем.
 * @param queryKey Ключ запроса, содержащий ID пользователя и ID сообщения (например, ['user', 8, 'message', 123]).
 * @returns Промис, который разрешается с объектом Message или null
 * @throws {Error} Если произошла ошибка при запросе к API или заказ не найден.
 */
function getMessageById({ queryKey }: { queryKey: (string | number)[] }): Promise<Message | null> {
  const userId = Number(queryKey[1]);
  const messageId = Number(queryKey[3]);
  if (!userId || !messageId) return Promise.resolve(null);

  if (messagesFetchTimeout) clearTimeout(messagesFetchTimeout);
  messagesFetchTimeout = setTimeout(async () => {
    const resolvers = messagesToFetch;
    messagesToFetch = [];
    messagesFetchTimeout = null;

    const messageIdsToFetch = [...new Set(resolvers.map(item => item.messageId))];

    if (messageIdsToFetch.length === 0) {
      return;
    }

    try {
      const authUserId = authorizedUserId();
      const data = authUserId ? (await MessageAPI.getMessagesByIds(messageIdsToFetch)) : null;

      const messages: Message[] = (data ?? []).map(messageRec => {
        const ret = {
          id: Number.isInteger(messageRec.id) && messageRec.id > 0 ? messageRec.id : 0,
          text: String(messageRec.text),
          created: new Date(String(messageRec.created ?? '') || 0),
          type:
            messageRec.type === 31 ? MessageType.System :
            !!messageRec.from ? MessageType.User :
            MessageType.Admin,
          format:
            messageRec.type === 32 ? MessageFormat.Audio :
            messageRec.type === 33 ? MessageFormat.Files :
            MessageFormat.Text,
          unread: !!messageRec.unread
        } as Message;
        if (Number.isInteger(messageRec.from) && messageRec.from! > 0) ret.from = messageRec.from!;
        if (messageRec.modified) {
          const date = new Date(String(messageRec.modified));
          if (!Number.isNaN(date.getTime())) ret.modified = date;
        }
        if (Number.isInteger(messageRec.editor) && messageRec.editor! > 0) ret.editorId = messageRec.editor!;
        if (Number.isInteger(messageRec.author) && messageRec.author! > 0) ret.authorId = messageRec.author!;
        if (Number.isInteger(messageRec.related) && messageRec.related! > 0) ret.relatedMessage = messageRec.related!;
        return ret;
      });

      const messagesMap = Object.fromEntries(messages.map(message => [message.id, message]));
      resolvers.forEach(item => {
        const message = messagesMap[item.messageId];
        if (message && authUserId === item.userId) {
          item.resolve(message);
        } else {
          item.resolve(null);
        }
      });
    } catch (error) {
      resolvers.forEach(item => item.reject(error));
    }
  }, 10);

  return new Promise((resolve, reject) => {
    messagesToFetch.push({ userId, messageId, resolve, reject });
  });
}

function combineFetchMessageResults(results: UseQueryResult<Awaited<Message | null>, unknown>[]) {
  // Агрегируем состояния загрузки и ошибок
  const ret = {
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null as unknown,
    isSuccess: true,
    messages: [] as Message[]
  };

  for (const query of results) {
    ret.isLoading ||= query.isLoading;
    ret.isFetching ||= query.isFetching;
    if (query.isError && !ret.error) {
      ret.isError = true;
      ret.error = query.error;
    }
    ret.isSuccess &&= query.isSuccess;
    if (query.data) ret.messages.push(query.data as Message);
  }

  return ret;
}

/**
 * Получить список сообщений по ID
 * @param ids Список ID сообщений
 * @returns Объект, содержащий объединенное состояние запросов React Query
 *          и массив `messages` с данными успешно полученных сообщений.
 */
export function useMessagesByIds(ids: number[]) {
  const { user } = useUser() as { user: UserProfile };
  const queries = ids.map(messageId => ({
    queryKey: [ 'user', user.id, 'message', messageId ],
    queryFn: getMessageById,
    staleTime: Infinity,  // Изменённые сообщения перезагружаются в getChatMessageIds
    enabled: !!user.id && user.id === authorizedUserId()  // Доступно только авторизованному пользователю
  }));

  return useQueries({
    queries,
    combine: combineFetchMessageResults
  });
}
