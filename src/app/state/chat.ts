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
import { QueryClient, useQuery, useMutation } from '@tanstack/react-query';

import CONFIG from 'config';
import { fileToBase64, isImage } from 'app/shared/lib/utilities';
import * as FileAPI from './api/dropbox';
import * as MessageAPI from './api/messages';
import { authorizedUserId } from './auth';
import { createBatchLoader } from './batch-query';
import { UserRole, useUser } from './user';
import type { UserProfile } from './user';

const EMPTY_ARRAY = Object.freeze([]);

export type ChatData = {
  id: string;
  orderId: number;
  clientId: number;
  contractorId: number;
  unreadCount: number;
  firstUnread?: number;
  lastUpdate?: Date;
  isOpen: boolean;
};

/**
 * Типы сообщений
 */
export enum MessageType {
  User = 'user',
  System = 'system',
  Admin = 'administrator'
}

/**
 * Форматы сообщений
 */
export enum MessageFormat {
  Text = 'text',
  Audio = 'audio',
  File = 'file'
}

interface MessageBase {
  id: number;
  from?: number;
  modified?: Date;
  editorId?: number;
  created: Date;
  authorId?: number;
  type: MessageType;
  format: MessageFormat;
  relatedMessage?: number;
  unread: boolean;
}

interface TextMessageBase extends MessageBase {
  format: MessageFormat.Text;
  text: string;
}

interface SystemMessage extends TextMessageBase {
  type: MessageType.System;
  eventType: string;
}

interface TextMessage extends TextMessageBase {
  type: MessageType.User | MessageType.Admin;
}

interface AudioMessage extends MessageBase {
  type: MessageType.User | MessageType.Admin;
  format: MessageFormat.Audio;
  audioId: number;
}

interface FileMessage extends MessageBase {
  type: MessageType.User | MessageType.Admin;
  format: MessageFormat.File;
  caption: string;
  fileId: number;
}

/**
 * Сообщение чата
 */
export type Message = SystemMessage | TextMessage | AudioMessage | FileMessage;

export function useActiveChats() {
  const { user } = useUser() as { user: UserProfile };
  const { data, ...ret } = useQuery({
    queryKey: [ 'user', user.id, 'active-chats' ],
    queryFn: MessageAPI.getActiveChatIds,
    refetchInterval: CONFIG.API?.chatsDataRefetchTime ?? 300000,
    staleTime: CONFIG.API?.chatsDataRefetchTime ?? 300000,
    enabled: !!user.id && user.id === authorizedUserId()  // Доступно только авторизованному пользователю
  });

  const result = useChatsByIds(data || []);

  if (!ret.isSuccess) return { ...ret, chats: EMPTY_ARRAY };
  return result;
}

const [ getChatById, useChatsByIds ] = createBatchLoader({
  fetchFn: async (ids: string[]) => {
    const data = await MessageAPI.getChatsByIds(ids);
    const ret: ChatData[] = (data ?? []).reduce((acc, chat) => {
      const chatItem: ChatData = {
        id: `${chat.order}:${chat.contractor}`,
        orderId: Number.isInteger(chat.order) && chat.order > 0 ? chat.order : 0,
        clientId: Number.isInteger(chat.client) && chat.client > 0 ? chat.client : 0,
        contractorId: Number.isInteger(chat.contractor) && chat.contractor > 0 ? chat.contractor : 0,
        unreadCount: Number.isInteger(chat.unread_count) && chat.unread_count > 0 ? chat.unread_count : 0,
        isOpen: !!chat.is_open,
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
  },
  createQueryKey: (userId, chatId) => [ 'user', userId, 'chat-data', chatId ],
  extractKeys: (queryKey) => [ Number(queryKey[1]), String(queryKey[3]) ],
  staleTime: CONFIG.API?.chatsDataRefetchTime ?? 300000,
  dataKey: 'chats'
});

/**
 * Получить данные чатов пользователя по ID (без сообщений)
 * @param ids Список ID чатов
 * @returns Объект, содержащий объединенное состояние запросов React Query
 *          и массив `chats` с данными успешно полученных чатов.
 */
export { useChatsByIds };

export function useSetChatOpen() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async ({orderId, contractorId, isOpen}: {orderId: number, contractorId: number, isOpen: boolean}, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (!orderId) throw new Error('Order ID not specified.');
      if (!contractorId) throw new Error('Contractor ID not specified.');

      const chatId = `${orderId}:${contractorId}`;

      await MessageAPI.markChatAsOpen(chatId, isOpen);
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'active-chats' ] });
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'chat-data', chatId ] });

      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    setChatOpen: mutateAsync
  }
}

const lastChatRefetchTime: Map<string, string> = new Map();
async function getChatMessageIds(client: QueryClient, userId: number, orderId: number, contractorId: number): Promise<number[]> {
  const chatId = `${orderId}:${contractorId}`;
  const lastRefetchTime = lastChatRefetchTime.get(`${userId}:${chatId}`);
  const previous = client.getQueryData<number[]>([ 'user', userId, 'chat', chatId ]);
  if (lastRefetchTime && previous) {
    const resultSet = new Set(previous);
    const result = await MessageAPI.getUpdatedChatMessages(orderId, contractorId, lastRefetchTime);
    if (!result.messages?.length) return previous;

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

const [ getMessageById, useMessagesByIds ] = createBatchLoader({
  fetchFn: async (ids: number[]) => {
    const data = await MessageAPI.getMessagesByIds(ids);

    const messages = (data ?? []).map(messageRec => {
      const ret = {
        id: Number.isInteger(messageRec.id) && messageRec.id > 0 ? messageRec.id : 0,
        created: new Date(String(messageRec.created ?? '') || 0),
        type:
          messageRec.type === 31 ? MessageType.System :
          !!messageRec.from ? MessageType.User :
          MessageType.Admin,
        format:
          messageRec.type === 32 ? MessageFormat.Audio :
          messageRec.type === 33 ? MessageFormat.File :
          MessageFormat.Text,
        unread: !!messageRec.unread
      } as Message;
      if (ret.type === MessageType.System) ret.eventType = String(messageRec.event_type ?? '');
      if (ret.format === MessageFormat.Text) ret.text = String(messageRec.text ?? '');
      if (ret.format === MessageFormat.Audio) ret.audioId = Number(messageRec.audio_id ?? 0);
      if (ret.format === MessageFormat.File) {
        ret.caption = String(messageRec.caption ?? '');
        ret.fileId = Number(messageRec.file_id ?? 0);
      }
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

    return messages;
  },
  createQueryKey: (userId, messageId) => [ 'user', userId, 'message', messageId ],
  extractKeys: (queryKey) => [ Number(queryKey[1]), Number(queryKey[3]) ],
  staleTime: Infinity,  // Изменённые сообщения перезагружаются в getChatMessageIds
  dataKey: 'messages'
});


/**
 * Получить список сообщений по ID
 * @param ids Список ID сообщений
 * @returns Объект, содержащий объединенное состояние запросов React Query
 *          и массив `messages` с данными успешно полученных сообщений.
 */
export { useMessagesByIds };

export type SendMessageParams = {
  orderId: number,
  contractorId: number,
  text?: string;
  audio?: Blob;
  file?: File;
  format?: MessageFormat;
  replyToMessage?: number;
};

async function sendMessage(message: SendMessageParams): Promise<number | null> {
  if (!message.orderId || !message.contractorId) throw new Error('Order or contractor not specified.');
  const chatId = `${message.orderId}:${message.contractorId}`;
  const data = {} as any;
  if (message.format === MessageFormat.Audio) {
    if (!message.audio) throw new Error('Audio file not specified.');
    const type = message.audio.type;
    if (!type.startsWith('audio/')) throw new Error('Invalid media type.');
    const format = type.substring(6);
    if (format !== 'webm' && format !== 'ogg' && !format.startsWith('ogg;')) throw new Error('Invalid media type.');
    const ext = format === 'webm' ? 'weba' : 'ogg';
    const base64 = await fileToBase64(message.audio);
    const fileId = await FileAPI.uploadFile((message.audio as File).name ?? `audio_file.${ext}`, base64, 0);
    if (!fileId) throw new Error('Audio uploading failed.');
    data.type = 32;
    data.file_id = fileId;
  }
  else if (message.format === MessageFormat.File) {
    if (!message.file) throw new Error('Attachment not specified.');
    const base64 = await fileToBase64(message.file);
    const fileId = await FileAPI.uploadFile(message.file.name, base64, 0);
    if (!fileId) throw new Error('File uploading failed.');
    data.type = 33;
    data.text = message.text ?? '';
    data.file_id = fileId;
  }
  else {
    if (!message.text) throw new Error('Message is empty.');
    data.type = 1;
    data.text = message.text;
  }
  return MessageAPI.postMessage(chatId, message);
}

export function useSendMessage() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async (data: SendMessageParams, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (!data.orderId) throw new Error('Order ID not specified.');
      if (!data.contractorId) throw new Error('Contractor ID not specified.');

      await sendMessage(data);
      const chatId = `${data.orderId}:${data.contractorId}`;
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'chat', chatId ] });
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'chat-data', chatId ] });

      return;
    }
  });

  const { mutateAsync, ...ret } = mutation;
  return {
    ...ret,
    sendMessage: mutateAsync
  }
}
