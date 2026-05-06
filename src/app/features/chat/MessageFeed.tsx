import type { FC } from 'react';
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useLanguage } from 'app/state/language';
import { Order } from 'app/state/order';
import { UserProfile, UserRole, useUsersByIds } from 'app/state/user';
import { ChatMessage } from './ChatMessage';
import { MessageType, MessageFormat } from 'app/state/chat';

import styles from './Chat.module.css';

interface MessageFeedProps {
  order: Order;
  contractorId: number;
  currentUser: UserProfile;
}

// Mock messages for UI demonstration
const MOCK_MESSAGES = (currentUserId: number, partnerId: number, userRole: UserRole) => [
  {
    id: 1,
    created: new Date(Date.now() - 3600000), // 1 hour ago
    type: MessageType.System,
    format: MessageFormat.Text,
    text: 'Заказ №1234 был создан. Ожидайте предложений от мастеров.',
    unread: false,
  },
  {
    id: 2,
    from: userRole === UserRole.Client ? currentUserId : partnerId,
    created: new Date(Date.now() - 3500000),
    authorId: userRole === UserRole.Client ? currentUserId : partnerId,
    type: MessageType.User,
    format: MessageFormat.Text,
    text: 'Привет! Мне нужен ремонт iPhone 13. Экран разбит, но сенсор работает. Сколько будет стоить замена?',
    unread: false,
  },
  {
    id: 3,
    from: userRole === UserRole.Contractor ? currentUserId : partnerId,
    created: new Date(Date.now() - 3000000),
    authorId: userRole === UserRole.Contractor ? currentUserId : partnerId,
    type: MessageType.User,
    format: MessageFormat.Text,
    text: 'Здравствуйте! Замена экрана на iPhone 13 будет стоить 8000 рублей. Могу приехать завтра к 14:00.',
    unread: false,
  },
  {
    id: 4,
    from: userRole === UserRole.Client ? currentUserId : partnerId,
    created: new Date(Date.now() - 2800000),
    authorId: userRole === UserRole.Client ? currentUserId : partnerId,
    type: MessageType.User,
    format: MessageFormat.Text,
    text: 'Отлично! Завтра в 14:00 подходит. Адрес: ул. Пушкина, 10.',
    unread: false,
  },
  {
    id: 5,
    from: userRole === UserRole.Contractor ? currentUserId : partnerId,
    created: new Date(Date.now() - 2700000),
    authorId: userRole === UserRole.Contractor ? currentUserId : partnerId,
    type: MessageType.User,
    text: 'Подтверждаю. Буду на месте.',
    format: MessageFormat.Text,
    modified: new Date(Date.now() - 500000), // Example of modified message
    editorId: userRole === UserRole.Contractor ? currentUserId : partnerId,
    unread: true,
  },
  {
    id: 6,
    created: new Date(Date.now() - 2000000),
    type: MessageType.System,
    format: MessageFormat.Text,
    text: 'Исполнитель подтвердил принятие заказа.',
    unread: false,
  },
  {
    id: 7,
    from: userRole === UserRole.Client ? currentUserId : partnerId,
    created: new Date(Date.now() - 1500000),
    authorId: userRole === UserRole.Client ? currentUserId : partnerId,
    type: MessageType.User,
    format: MessageFormat.Text,
    text: 'Мастер, вы уже выехали?',
    unread: false,
  },
  {
    id: 8,
    created: new Date(Date.now() - 1000000),
    type: MessageType.System,
    format: MessageFormat.Text,
    text: 'Работа над заказом началась.',
    unread: true,
  },
  {
    id: 9,
    created: new Date(Date.now() - 750000),
    authorId: 2,
    type: MessageType.Admin,
    format: MessageFormat.Text,
    text: 'Мы будем отслеживать выполнение заказа в рамках проекта по повышению качества услуг.',
    unread: true,
  },
  {
    id: 10,
    from: userRole === UserRole.Contractor ? currentUserId : partnerId,
    created: new Date(Date.now() - 500000),
    authorId: userRole === UserRole.Contractor ? currentUserId : partnerId,
    type: MessageType.User,
    format: MessageFormat.Text,
    text: 'Ремонт завершен, все работает отлично!',
    unread: true,
  },
  {
    id: 11,
    created: new Date(Date.now() - 100000),
    type: MessageType.System,
    format: MessageFormat.Text,
    text: 'Заказ успешно завершен.',
    unread: true,
  },
];


export const MessageFeed: FC<MessageFeedProps> = ({
  order,
  contractorId,
  currentUser,
}) => {
  const text = useLanguage();
  const messageFeedRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true); // Track if user is at the bottom

  const chatPartnerId = (currentUser.role === UserRole.Client ? contractorId : order.clientId);

  // Generate mock messages based on current user's role
  const messages = MOCK_MESSAGES(currentUser.id, chatPartnerId, currentUser.role);

  const allUserIds = messages.reduce((ids, message) => {
    if (message.type === MessageType.User && message.from && message.from !== currentUser.id) {
      ids.add(message.from);
    }
    else if (message.type === MessageType.Admin && message.authorId) {
      ids.add(message.authorId);
    }
    return ids;
  }, new Set<number>());
  const { users, isLoading: isLoadingPartner } = useUsersByIds([...allUserIds]);
  const usersMap = new Map(users.map(user => [user.id, user]));

  const scrollToBottom = useCallback(() => {
    if (messageFeedRef.current) {
      messageFeedRef.current.scrollTop = messageFeedRef.current.scrollHeight;
      setIsAtBottom(true);
    }
  }, []);

  const handleScroll = (event) => {
    const el = event.target;
    if (el) {
      const { scrollTop, scrollHeight, clientHeight } = el;
      // Consider "at bottom" if within 100px of the bottom
      setIsAtBottom(scrollHeight - (scrollTop + clientHeight) < 100);
    }
  };

  useEffect(() => {
    // Scroll to bottom on initial load
    scrollToBottom();
  }, [order.id, contractorId, currentUser.id, !!messages]);

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

      <div className={styles.message_feed_view} ref={messageFeedRef} onScroll={handleScroll}>
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
      </div>
    </div>
  );
};
