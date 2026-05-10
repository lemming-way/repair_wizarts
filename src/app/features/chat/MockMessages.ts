import { useState, useEffect } from 'react';
import { Message, MessageType, MessageFormat } from 'app/state/chat';

// Генератор мок-сообщений
let autoIncrement = 1;
const allMessages = [] as Message[];
const allChats = new Map<string, number[]>();

export const MOCK_MESSAGES_GENERATOR = (orderId: number, clientId: number, contractorId: number) => {
  const totalMessages = 300;
  const ids = [] as number[];

  for (let i = 0; i < totalMessages; i++) {
    const id = i + autoIncrement;
    const created = new Date(Date.now() - (totalMessages - i) * 10000); // Сообщения становятся старше
    const isClientSender = i % 2 === 0; // Чередование отправителей

    let message: Message;

    if (i % 5 === 0) { // Каждое 5-е сообщение - системное
      message = {
        id,
        created,
        type: MessageType.System,
        format: MessageFormat.Text,
        text: `Системное сообщение №${id}: Заказ обновлен.`,
        unread: false,
      };
    } else if (i % 7 === 0) { // Каждое 7-е сообщение - от администратора
      message = {
        id,
        created,
        authorId: 2, // Мок ID администратора
        type: MessageType.Admin,
        format: MessageFormat.Text,
        text: `Администратор (ID:3) напоминает о сообщении №${id}.`,
        unread: true,
      };
    } else { // Сообщения пользователей
      message = {
        id,
        created,
        from: isClientSender ? clientId : contractorId,
        authorId: isClientSender ? clientId : contractorId,
        type: MessageType.User,
        format: MessageFormat.Text,
        text: `${isClientSender ? 'Клиент' : 'Мастер'} отправил сообщение №${id}.`,
        unread: (i > totalMessages * 4 / 5), // Некоторые сообщения непрочитаны
      };

      // Пример измененного сообщения
      if (i % 8 === 0 && i % 5 !== 0) {
        message.modified = new Date(created.getTime() + 1000);
        message.editorId = message.authorId;
        message.text = `Это измененное сообщение №${id}.`;
      }
    }
    allMessages.push(message);
    ids.push(id);
  }
  autoIncrement += totalMessages;
  allChats.set(`${orderId}:${contractorId}`, ids);
  return;
};

// Имитация задержки API
const API_DELAY = 500; // миллисекунды

    /**
 * Мок-хук для имитации получения ID сообщений чата.
 * Возвращает все ID из сгенерированного списка.
 * @param orderId ID заказа
 * @param contractorId ID подрядчика
 * @returns Объект с `messageIds`, `isLoading`, `isSuccess`.
 */
export function useChat(orderId: number, clientId: number, contractorId: number) {
  const [messageIds, setMessageIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setMessageIds([]);
    const timer = setTimeout(() => {
      const chatId = `${orderId}:${contractorId}`;
      if (!allChats.has(chatId)) MOCK_MESSAGES_GENERATOR(orderId, clientId, contractorId);
      const ids = allChats.get(chatId) ?? [];
      setMessageIds(ids);
      setIsLoading(false);
      setIsSuccess(true);
    }, API_DELAY);

    return () => clearTimeout(timer);
  }, [orderId, clientId, contractorId]);

  return { messageIds, isLoading, isSuccess };
}

/**
 * Мок-хук для имитации получения сообщений по списку ID.
 * Возвращает отфильтрованный список сообщений из сгенерированного списка.
 * @param ids Список ID сообщений для загрузки
 * @returns Объект с `messages`, `isLoading`, `isSuccess`.
 */
export function useMessagesByIds(ids: number[]) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!ids || ids.length === 0) {
      setMessages([]);
      setIsLoading(false);
      setIsSuccess(true);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      const filteredMessages = ids.map(id => allMessages[id - 1]);
      setMessages(filteredMessages);
      setIsLoading(false);
      setIsSuccess(true);
    }, API_DELAY);

    return () => clearTimeout(timer);
  }, [ids]);

  return { messages, isLoading, isSuccess };
}
