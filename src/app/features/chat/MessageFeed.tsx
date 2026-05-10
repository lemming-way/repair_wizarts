import type { FC } from 'react';
import React, { useRef, useEffect, useLayoutEffect, useCallback, useState, useMemo } from 'react';
import { useLanguage } from 'app/state/language';
import { Order } from 'app/state/order';
import { UserProfile, UserRole, useUsersByIds } from 'app/state/user';
import { ChatMessage } from './ChatMessage';
import { Message, MessageType, MessageFormat } from 'app/state/chat';

import { useChat, useMessagesByIds } from './MockMessages';

import styles from './Chat.module.css';

interface MessageFeedProps {
  order: Order;
  contractorId: number;
  currentUser: UserProfile;
}

const BATCH_SIZE = 25; // Количество сообщений до и после текущего для окна
const SCROLL_THRESHOLD = 200; // Порог для активации подгрузки сообщений (px от края)

export const MessageFeed: FC<MessageFeedProps> = ({
  order,
  contractorId,
  currentUser,
}) => {
  const text = useLanguage();
  const messageFeedRef = useRef<HTMLDivElement>(null);
  const scrollToBottomRef = useRef<(()=>void) | null>(null);
  const postLoadingRef = useRef<(()=>void) | null>(null);

  const [firstRenderedIndex, setFirstRenderedIndex] = useState(0);
  const [windowSize, setWindowSize] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [pendingScrollToId, setPendingScrollToId] = useState<number | null>(null);
  const [lastVisibleMessage, setLastVisibleMessage] = useState<number | null>(null);
  const [lastVisibleMessageTop, setLastVisibleMessageTop] = useState<number | null>(null);
  const [isLoadingWindow, setIsLoadingWindow] = useState(false); // Для предотвращения множественных запросов
  const [isAtBottom, setIsAtBottom] = useState(true); // Отслеживание нахождения скролла внизу

  // Получаем все ID сообщений чата
  const { messageIds } = useChat(order.id, order.clientId, contractorId);

  // Определяем ID сообщений для текущего окна
  const windowedMessageIds = useMemo(
    () => messageIds.slice(firstRenderedIndex, firstRenderedIndex + windowSize),
    [messageIds, firstRenderedIndex, windowSize]
  );
  const { messages, isLoading: isMessagesLoading, isSuccess: isMessagesSuccess } = useMessagesByIds(windowedMessageIds);

  const allUserIds = messages.reduce((ids, message) => {
    if (message.type === MessageType.User && message.from && message.from !== currentUser.id) {
      ids.add(message.from);
    }
    else if (message.type === MessageType.Admin && message.authorId) {
      ids.add(message.authorId);
    }
    return ids;
  }, new Set<number>());
  const { users } = useUsersByIds([...allUserIds]);
  const usersMap = new Map(users.map(user => [user.id, user]));

  // --- Функция для прокрутки к заданному сообщению по ID ---
  const scrollToMessage = (targetId: number) => {
    if (!messageIds.length) return;

    const targetIndex = messageIds.findIndex(id => id === targetId);
    if (targetIndex === -1) return;

    // Определяем новое окно загрузки вокруг целевого сообщения
    let newFirst = targetIndex - BATCH_SIZE;
    if (newFirst < 0) newFirst = 0;
    let newSize = BATCH_SIZE * 2 + 1;
    if (newFirst + newSize > messageIds.length) {
      newFirst = messageIds.length - BATCH_SIZE * 2 - 1;
      if (newFirst < 0) {
        newSize += newFirst;
        newFirst = 0;
      }
    }

    if (newFirst !== firstRenderedIndex || newSize !== windowSize) {
      setFirstRenderedIndex(newFirst);
      setWindowSize(newSize);
      setPendingScrollToId(targetId);
      setIsLoadingWindow(true);
    }
    else {
      const targetMessageElement = messageFeedRef.current?.querySelector(`[data-message="${targetId}"]`);
      if (targetMessageElement) {
        targetMessageElement.scrollIntoView({ behavior: isInitialLoading ? 'auto' : 'smooth', block: 'nearest' });
      }
      setIsInitialLoading(false);
    }
  };

  // --- Scroll to bottom function, теперь использует scrollToMessage ---
  const scrollToBottom = () => {
    if (messageIds.length > 0) {
      scrollToMessage(messageIds[messageIds.length - 1]);
    }
  };
  scrollToBottomRef.current = scrollToBottom;

  useLayoutEffect(() => {
    // Сброс состояния и прокрутка вниз при начальной загрузке чата
    setFirstRenderedIndex(0);
    setWindowSize(0);
    setLastVisibleMessage(null);
    setLastVisibleMessageTop(null);
    setIsInitialLoading(true);
    scrollToBottomRef.current?.();
  }, [order.id, contractorId, currentUser.id, messageIds.length > 0]);

  // --- Эффект для корректировки скролла после загрузки новой порции сообщений ---
  postLoadingRef.current = () => {
    setIsLoadingWindow(false);
    if (!messages.length) return;

    if (pendingScrollToId) {
      // Прокрутка к заданному сообщению, если запрошено
      const targetMessageElement = messageFeedRef.current?.querySelector(`[data-message="${pendingScrollToId}"]`);
      if (targetMessageElement) {
        targetMessageElement.scrollIntoView({ behavior: isInitialLoading ? 'auto' : 'smooth', block: 'nearest' });
      }
      setPendingScrollToId(null);
      setIsInitialLoading(false);
    }
    else if (lastVisibleMessage && messageFeedRef.current) {
      const msg = messageFeedRef.current.querySelector(`[data-message="${lastVisibleMessage}"]`) as HTMLElement;
      if (msg) {
        const { offsetTop, scrollTop } = messageFeedRef.current;
        messageFeedRef.current.scrollTop = msg.offsetTop - offsetTop - (lastVisibleMessageTop ?? 0);
      }
    }
  }

  useLayoutEffect(() => {
    postLoadingRef.current?.()
  }, [messages]);

  // --- Обработчик скролла для подгрузки сообщений ---
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!messages.length) return;

    const el = event.currentTarget;
    const { scrollTop, scrollHeight, clientHeight, offsetTop } = el;

    // Определяем положение последнего видимого на экране элемента
    const children = el.querySelectorAll('[data-message]');
    let lastVisible: null | HTMLElement = null;
    for (const msg of children) {
      const { offsetTop: msgOffsetTop, offsetHeight: msgOffsetHeight } = msg as HTMLElement;
      if (msgOffsetTop - offsetTop + msgOffsetHeight > scrollTop && msgOffsetTop - offsetTop < scrollTop + clientHeight) {
        lastVisible = msg as HTMLElement;
      }
    }
    if (lastVisible) {
      setLastVisibleMessage(Number(lastVisible.dataset.message));
      setLastVisibleMessageTop(lastVisible.offsetTop - offsetTop - scrollTop);
    }
    else {
      setLastVisibleMessage(null);
      setLastVisibleMessageTop(null);
    }

    const atBottom =
      firstRenderedIndex + windowSize >= messageIds.length &&
      scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
    setIsAtBottom(atBottom);

    if (isLoadingWindow) {
      return; // Игнорируем скролл, если уже идет загрузка
    }

    let newFirst = firstRenderedIndex;
    let newSize = windowSize;

    // Подгрузка старых сообщений (скролл вверх)
    if (scrollTop < SCROLL_THRESHOLD && firstRenderedIndex > 0) {
      newFirst -= BATCH_SIZE;
      if (newFirst < 0) newFirst = 0;
      newSize += BATCH_SIZE;
      if (newSize > 3 * BATCH_SIZE + 1) newSize = 3 * BATCH_SIZE + 1;
      if (newFirst + newSize > messageIds.length) newSize = messageIds.length - newFirst;
    }
    // Подгрузка новых сообщений (скролл вниз)
    else if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD && firstRenderedIndex + windowSize < messageIds.length) {
      newSize += BATCH_SIZE;
      if (firstRenderedIndex + newSize > messageIds.length) newSize = messageIds.length - firstRenderedIndex;
      if (newSize > 3 * BATCH_SIZE + 1) {
        newFirst += newSize - 3 * BATCH_SIZE - 1;
        newSize = 3 * BATCH_SIZE + 1;
      }
    }

    if (newFirst !== firstRenderedIndex || newSize !== windowSize) {
        setIsLoadingWindow(true);
        setFirstRenderedIndex(newFirst);
        setWindowSize(newSize);
    }
  };

  return (
    <div className={styles.message_feed_container}>
      {/* Scroll to bottom button */}
      {!isAtBottom && (
        <button
          className={styles.scroll_to_bottom_button}
          onClick={scrollToBottom}
          title={text('Scroll to bottom')}
        >
          <img src="/img/arrowleft-white.png" alt="Scroll Down" style={{ transform: 'rotate(-90deg)' }}/>
        </button>
      )}

      <div className={styles.message_feed} ref={messageFeedRef} onScroll={handleScroll}>
        {firstRenderedIndex > 0 && isMessagesLoading && (
          <div className={styles.loading_messages_indicator}>
            {text('Loading messages...')}
          </div>
        )}
        {messages.map((message) => {
          const userId =
            message.type === MessageType.User
            ? message.from
            : message.authorId;
          const user = userId ? usersMap.get(userId) : null;
          const userName = user?.fullname || user?.name;
          const avatar = user?.avatar;
          return (
            <ChatMessage
              key={message.id}
              message={message}
              currentUserId={currentUser.id}
              authorName={userName}
              authorAvatar={avatar}
            />
          );
        })}
        {firstRenderedIndex + windowSize < messageIds.length - 1 && isMessagesLoading && (
          <div className={styles.loading_messages_indicator}>
            {text('Loading messages...')}
          </div>
        )}
      </div>
    </div>
  );
};
