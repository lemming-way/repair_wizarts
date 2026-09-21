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
import { objectMapper } from 'app/shared/lib/objectMapper';
import { fileToBase64, isImage } from 'app/shared/lib/utilities';
import * as FileAPI from './api/dropbox';
import * as MessageAPI from './api/message';
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
export const MessageType = {
  User: 'user',
  System: 'system',
  Admin: 'administrator'
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type MessageType = typeof MessageType[keyof typeof MessageType];

/**
 * Форматы сообщений
 */
export const MessageFormat = {
  Text: 'text',
  Audio: 'audio',
  File: 'file'
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type MessageFormat = typeof MessageFormat[keyof typeof MessageFormat];

interface MessageBase {
  id: number;
  chatId: string;
  from?: number;
  modified?: Date;
  editorId?: number;
  created: Date;
  authorId?: number;
  type: MessageType;
  format: MessageFormat;
  relatedMessage?: number;
  unread: boolean;
  partnerRead: Date | null;
  isEditable: boolean;
  isDeletable: boolean;
}

interface TextMessageBase extends MessageBase {
  format: typeof MessageFormat.Text;
  text: string;
}

interface SystemMessage extends TextMessageBase {
  type: typeof MessageType.System;
  eventType: string;
}

interface TextMessage extends TextMessageBase {
  type: typeof MessageType['User' | 'Admin'];
}

interface AudioMessage extends MessageBase {
  type: typeof MessageType['User' | 'Admin'];
  format: typeof MessageFormat.Audio;
  audioId: number;
  mediaType: string;
}

interface FileMessage extends MessageBase {
  type: typeof MessageType['User' | 'Admin'];
  format: typeof MessageFormat.File;
  caption: string;
  fileId: number;
  fileName: string;
  fileSize: number;
  mediaType: string;
}

/**
 * Сообщение чата
 */
export type Message = SystemMessage | TextMessage | AudioMessage | FileMessage;

export function useActiveChats() {
  const { user } = useUser() as { user: UserProfile };
  const idsResult = useQuery({
    queryKey: [ 'user', user.id, 'active-chats' ],
    queryFn: MessageAPI.getActiveChatIds,
    refetchInterval: CONFIG.API?.chatsDataRefetchTime ?? 300000,
    staleTime: CONFIG.API?.chatsDataRefetchTime ?? 300000,
    enabled: !!user.id && user.id === authorizedUserId()  // Доступно только авторизованному пользователю
  });

  const result = useChatsByIds(idsResult.data || []);

  if (!idsResult.isSuccess) return objectMapper(idsResult, { data: null, chats() { return EMPTY_ARRAY; } });
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
        const timestamp = Date.parse(chat.last_time);
        if (!Number.isNaN(timestamp)) chatItem.lastUpdate = new Date(timestamp);
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
      if (user.id !== authorizedUserId()) throw new Error('User has changed.');
      if (!orderId) throw new Error('Order ID not specified.');
      if (!contractorId) throw new Error('Contractor ID not specified.');

      const chatId = `${orderId}:${contractorId}`;

      await MessageAPI.markChatAsOpen(chatId, isOpen);
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'active-chats' ] });
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'chat-data', chatId ] });

      return;
    }
  });

  return objectMapper(mutation, { mutate: null, mutateAsync: null, setChatOpen: 'mutateAsync' });
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
  const result = useQuery({
    queryKey: [ 'user', user.id, 'chat', chatId ],
    queryFn: ({ client }) => getChatMessageIds(client, user.id, orderId, contractorId),
    refetchInterval: CONFIG.API?.chatMessagesRefetchTime ?? 10000,
    staleTime: CONFIG.API?.chatMessagesRefetchTime ?? 10000,
    enabled: !!user.id && user.id === authorizedUserId()  // Доступно только авторизованному пользователю
             && !!orderId && !!contractorId
  });

  return objectMapper(result, { data: null, messageIds(target) { return target.data as number[] || EMPTY_ARRAY; } });
}

const [ getMessageById, useMessagesByIds ] = createBatchLoader({
  fetchFn: async (ids: number[]) => {
    const data = await MessageAPI.getMessagesByIds(ids);

    const messages = (data ?? []).map(messageRec => {
      const partnerRead = messageRec.partner_read_time ? Date.parse(messageRec.partner_read_time) : null;
      const ret = {
        id: Number.isInteger(messageRec.id) && messageRec.id > 0 ? messageRec.id : 0,
        chatId: String(messageRec.chat_id ?? ''),
        created: new Date(Date.parse(messageRec.created) || 0),
        type:
          messageRec.type === MessageAPI.MessageType.System ? MessageType.System :
          !!messageRec.from ? MessageType.User :
          MessageType.Admin,
        format:
          messageRec.type === MessageAPI.MessageType.Audio ? MessageFormat.Audio :
          messageRec.type === MessageAPI.MessageType.Attachment ? MessageFormat.File :
          MessageFormat.Text,
        unread: !!messageRec.unread,
        partnerRead: partnerRead && !Number.isNaN(partnerRead) ? new Date(partnerRead) : null,
        isEditable: !!messageRec.editable,
        isDeletable: !!messageRec.deletable
      } as Message;
      if (ret.type === MessageType.System) ret.eventType = String(messageRec.event_type ?? '');
      if (ret.format === MessageFormat.Text) ret.text = String(messageRec.text ?? '');
      if (ret.format === MessageFormat.Audio) {
        ret.audioId = Number(messageRec.audio_id ?? 0);
        ret.mediaType = String(messageRec.file_type ?? '');
      }
      if (ret.format === MessageFormat.File) {
        ret.caption = String(messageRec.caption ?? '');
        ret.fileId = Number(messageRec.file_id ?? 0);
        ret.fileName = String(messageRec.file_name ?? '');
        ret.fileSize = Number(messageRec.file_size ?? 0);
        ret.mediaType = String(messageRec.file_type ?? '');
      }
      if (Number.isInteger(messageRec.from) && messageRec.from! > 0) ret.from = messageRec.from!;
      if (messageRec.modified) {
        const timestamp = Date.parse(messageRec.modified);
        if (!Number.isNaN(timestamp)) ret.modified = new Date(timestamp);
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

export function useSetMessagesRead() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async (messageIds: number[], { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.id !== authorizedUserId()) throw new Error('User has changed.');
      if (!messageIds?.length) throw new Error('Message IDs not specified.');

      const promises = [] as Promise<Message>[];
      for (const id of messageIds) {
        promises.push(client.ensureQueryData({
          queryKey: ['user', user.id, 'message', id],
          queryFn: getMessageById,
          staleTime: Infinity  // Изменённые сообщения перезагружаются в getChatMessageIds
        }));
      }
      const messages = await Promise.all(promises);
      if (user.id !== authorizedUserId()) throw new Error('User has changed.');

      const filteredIds = new Set<number>();
      const chatIds = new Set<string>();
      for (const message of messages) {
        if (message.unread) {
          filteredIds.add(message.id);
          chatIds.add(message.chatId);
        }
      }

      const filteredArr = [...filteredIds];
      await MessageAPI.markMessagesAsRead(filteredArr);
      for (const id of filteredArr) {
        client.invalidateQueries({ queryKey: [ 'user', user.id, 'message', id ] });
      }
      for (const chatId of [...chatIds]) {
        client.invalidateQueries({ queryKey: [ 'user', user.id, 'chat-data', chatId ] });
      }

      return;
    }
  });

  return objectMapper(mutation, { mutate: null, mutateAsync: null, setMessagesRead: 'mutateAsync' });
}

export function useSetChatRead() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async ({ orderId, contractorId }: { orderId: number, contractorId: number }, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.id !== authorizedUserId()) throw new Error('User has changed.');
      if (!orderId) throw new Error('Order ID not specified.');
      if (!contractorId) throw new Error('Contractor ID not specified.');
      const chatId = `${orderId}:${contractorId}`;

      // получить чат
      const chat = await client.ensureQueryData({
        queryKey: ['user', user.id, 'chat-data', chatId],
        queryFn: getChatById,
        staleTime: CONFIG.API?.chatsDataRefetchTime ?? 300000
      });
      const result = await MessageAPI.markAllAsRead(chatId);
      if (Array.isArray(result)) {
        for (const id of result) {
          client.invalidateQueries({ queryKey: [ 'user', user.id, 'message', id ] });
        }
      }
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'chat-data', chatId ] });

      return;
    }
  });

  return objectMapper(mutation, { mutate: null, mutateAsync: null, setChatRead: 'mutateAsync' });
}

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
    const validTypes = {
      'audio/mp4': 'm4a',
      'audio/aac': 'm4a',
      'audio/webm': 'webm',
      'audio/webm;codecs=opus': 'webm',
      'audio/ogg': 'ogg',
      'audio/ogg;codecs=opus': 'ogg'
    };
    if (!validTypes[type]) throw new Error('Invalid media type.');
    const ext = validTypes[type];
    const uploadName = `audio_file.${ext}`;
    data.type = MessageAPI.MessageType.Audio;
    data.file = new File(
      [message.audio],
      uploadName,
      { type, lastModified: (message.audio as { lastModified?: number }).lastModified });
  }
  else if (message.format === MessageFormat.File) {
    if (!message.file) throw new Error('Attachment not specified.');
    data.type = MessageAPI.MessageType.Attachment;
    data.text = message.text ?? '';
    data.file = message.file;
  }
  else {
    if (!message.text) throw new Error('Message is empty.');
    data.type = MessageAPI.MessageType.Regular;
    data.text = message.text;
  }
  if (message.replyToMessage) data.replyTo = message.replyToMessage;
  return MessageAPI.postMessage(chatId, data);
}

export function useSendMessage() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async (data: SendMessageParams, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.id !== authorizedUserId()) throw new Error('User has changed.');
      if (!data.orderId) throw new Error('Order ID not specified.');
      if (!data.contractorId) throw new Error('Contractor ID not specified.');

      await sendMessage(data);
      const chatId = `${data.orderId}:${data.contractorId}`;
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'chat', chatId ] });
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'chat-data', chatId ] });

      return;
    }
  });

  return objectMapper(mutation, { mutate: null, mutateAsync: null, sendMessage: 'mutateAsync' });
}

type EditMessageParams = {
  messageId: number,
  text: string
};

export function useUpdateMessage() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async ({ messageId, text }: EditMessageParams, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.id !== authorizedUserId()) throw new Error('User has changed.');
      if (!messageId) throw new Error('Message ID not specified.');

      const message = await client.ensureQueryData({
        queryKey: ['user', user.id, 'message', messageId],
        queryFn: getMessageById,
        staleTime: Infinity  // Изменённые сообщения перезагружаются в getChatMessageIds
      });
      if (
        !message ||
        message.type !== MessageType.User ||
        (message.format !== MessageFormat.Text && message.format !== MessageFormat.File) ||
        !message.isEditable
      ) {
        throw new Error('Not ediable message.');
      }
      await MessageAPI.editMessage(messageId, text);
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'message', messageId ] });
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'chat-data', message.chatId ] });

      return;
    }
  });

  return objectMapper(mutation, { mutate: null, mutateAsync: null, updateMessage: 'mutateAsync' });
}

export function useDeleteMessage() {
  const { user } = useUser() as { user: UserProfile };
  const mutation = useMutation({
    mutationFn: async (messageId: number, { client }) => {
      if (!user.id) throw new Error('User must be authorized.');
      if (user.id !== authorizedUserId()) throw new Error('User has changed.');
      if (!messageId) throw new Error('Message ID not specified.');

      const message = await client.ensureQueryData({
        queryKey: ['user', user.id, 'message', messageId],
        queryFn: getMessageById,
        staleTime: Infinity  // Изменённые сообщения перезагружаются в getChatMessageIds
      });
      if (
        !message ||
        message.type !== MessageType.User ||
        !message.isDeletable
      ) {
        throw new Error('Not deletable message.');
      }
      await MessageAPI.deleteMessage(messageId);
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'chat', message.chatId ] });
      client.invalidateQueries({ queryKey: [ 'user', user.id, 'chat-data', message.chatId ] });

      return;
    }
  });

  return objectMapper(mutation, { mutate: null, mutateAsync: null, deleteMessage: 'mutateAsync' });
}
