import type { FC } from 'react';
import React, { useRef, useEffect, useLayoutEffect, useCallback, useState, useMemo } from 'react';
import { useLanguage } from 'app/state/language';
import { Order } from 'app/state/order';
import { UserProfile, UserRole, useUsersByIds } from 'app/state/user';
import { ChatMessage } from './ChatMessage';
import { Message, MessageType, MessageFormat, useChat, useMessagesByIds, useSetMessagesRead } from 'app/state/chat';

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
  const { current: locals } = useRef({
    isInitialLoading: false,
    pendingScrollToId: null as number | null,
    lastVisibleMessage: null as number | null,
    lastVisibleMessageTop: null as number | null,
    isLoadingWindow: false,   // Для предотвращения множественных запросов
    scrollToMessage: (targetId: number) => {},
    scrollToBottom: () => {},
    afterLoading: () => {}
  });

  const [firstRenderedIndex, setFirstRenderedIndex] = useState(0);
  const [windowSize, setWindowSize] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true); // Отслеживание нахождения скролла внизу

  // Получаем все ID сообщений чата
  const { messageIds } = useChat(order.id, contractorId);

  // Корректируем размер окна, если необходимо
  // Можно положить этот код в useLayoutEffect, но так тоже сработает
  if (windowSize < BATCH_SIZE * 2 - 1 && messageIds.length > windowSize) {
    let newSize = Math.min(messageIds.length, BATCH_SIZE * 2 - 1 );
    let newFirst = firstRenderedIndex;
    if (newFirst + newSize > messageIds.length) {
      newFirst = messageIds.length - newSize;
    }
    setFirstRenderedIndex(newFirst);
    setWindowSize(newSize);
  }

  // Определяем ID сообщений для текущего окна
  const windowedMessageIds = messageIds.slice(firstRenderedIndex, firstRenderedIndex + windowSize);
  const { messages, isLoading: isMessagesLoading } = useMessagesByIds(windowedMessageIds);

  const allUserIds = messages.reduce((ids, message) => {
    if (message.type === MessageType.User && message.from && message.from !== currentUser.id) {
      ids.add(message.from);
    }
    else if (message.type === MessageType.Admin && message.authorId) {
      ids.add(message.authorId);
    }
    return ids;
  }, new Set<number>());

  const { setMessagesRead } = useSetMessagesRead();
  const { users } = useUsersByIds([...allUserIds]);
  const usersMap = new Map(users.map(user => [user.id, user]));

  // --- Функция для прокрутки к заданному сообщению по ID ---
  locals.scrollToMessage = (targetId: number) => {
    const messageFeed = messageFeedRef.current;

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
      locals.pendingScrollToId = targetId;
      locals.isLoadingWindow = true;
    }
    else {
      const targetMessageElement = messageFeed?.querySelector(`[data-message="${targetId}"]`);
      if (targetMessageElement) {
        targetMessageElement.scrollIntoView({ behavior: locals.isInitialLoading ? 'auto' : 'smooth', block: 'nearest' });
      }
      locals.isInitialLoading = false;
    }
  };

  // --- Scroll to bottom function, теперь использует scrollToMessage ---
  locals.scrollToBottom = () => {
    if (messageIds.length > 0) {
      locals.scrollToMessage(messageIds[messageIds.length - 1]);
    }
    else {
      setFirstRenderedIndex(0);
      setWindowSize(0);
    }
  };

  const hasMessages = messageIds.length > 0;
  useLayoutEffect(() => {
    // Сброс состояния и прокрутка вниз при начальной загрузке чата
    locals.lastVisibleMessage = null;
    locals.lastVisibleMessageTop = null;
    locals.isInitialLoading = true;
    locals.scrollToBottom();
  }, [locals, order.id, contractorId, currentUser.id, hasMessages]);

  const handleScrollPosition = () => {
    const el = messageFeedRef.current;
    if (!el || !messages.length) return;

    const { scrollTop, scrollHeight, clientHeight, offsetTop } = el;

    // Определяем положение последнего видимого на экране элемента
    const children = el.querySelectorAll('[data-message]');
    let lastVisible: null | HTMLElement = null;
    const visibleIds: number[] = [];
    for (const msg of children) {
      const { offsetTop: msgOffsetTop, offsetHeight: msgOffsetHeight } = msg as HTMLElement;
      if (msgOffsetTop - offsetTop + msgOffsetHeight > scrollTop && msgOffsetTop - offsetTop < scrollTop + clientHeight) {
        lastVisible = msg as HTMLElement;
        visibleIds.push(Number(lastVisible.dataset.message));
      }
    }
    if (visibleIds.length) {
      const unreadIds: number[] = [];
      for (const msg of messages) {
        if (msg.unread && visibleIds.includes(msg.id)) unreadIds.push(msg.id);
      }
      if (unreadIds.length) {
        setMessagesRead(unreadIds);
      }
    }
    if (lastVisible) {
      locals.lastVisibleMessage = Number(lastVisible.dataset.message);
      locals.lastVisibleMessageTop = lastVisible.offsetTop - offsetTop - scrollTop;
    }
    else {
      locals.lastVisibleMessage = null;
      locals.lastVisibleMessageTop = null;
    }

    const atBottom =
      firstRenderedIndex + windowSize >= messageIds.length &&
      scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
    setIsAtBottom(atBottom);
  };

  // --- Эффект для корректировки скролла после загрузки новой порции сообщений ---
  locals.afterLoading = () => {
    const messageFeed = messageFeedRef.current;

    locals.isLoadingWindow = false;
    if (!messages.length) return;

    if (locals.pendingScrollToId) {
      // Прокрутка к заданному сообщению, если запрошено
      const targetMessageElement = messageFeed?.querySelector(`[data-message="${locals.pendingScrollToId}"]`);
      if (targetMessageElement) {
        targetMessageElement.scrollIntoView({ behavior: locals.isInitialLoading ? 'auto' : 'smooth', block: 'nearest' });
      }
      locals.pendingScrollToId = null;
      locals.isInitialLoading = false;
    }
    else if (isAtBottom) {
      locals.scrollToBottom();
    }
    else if (locals.lastVisibleMessage && messageFeed) {
      const msg = messageFeed.querySelector(`[data-message="${locals.lastVisibleMessage}"]`) as HTMLElement;
      if (msg) {
        const { offsetTop, scrollTop } = messageFeed;
        messageFeed.scrollTop = msg.offsetTop - offsetTop - (locals.lastVisibleMessageTop ?? 0);
      }
    }

    handleScrollPosition();
  }

  useLayoutEffect(() => {
    locals.afterLoading()
  }, [locals, messages]);

  // --- Обработчик скролла для подгрузки сообщений ---
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    handleScrollPosition();

    if (!messages.length || locals.isLoadingWindow) {
      return; // Игнорируем скролл, если уже идет загрузка
    }

    const el = event.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = el;

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
        locals.isLoadingWindow = true;
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
          onClick={locals.scrollToBottom}
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
