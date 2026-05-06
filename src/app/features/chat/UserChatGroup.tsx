import React, { FC, useState, useMemo } from 'react';

import { useLanguage } from 'app/state/language';
import { useProducts } from 'app/state/site-data';
import { Order, OrderStatus, orderStatusString } from 'app/state/order';
import { UserProfile, UserRole } from 'app/state/user';
import type { ChatData } from 'app/state/chat';
import OnlineDotted from 'app/components/onlineDotted/OnlineDotted';

import styles from './Chat.module.css';

interface UserChatGroupProps {
  partnerId: number;
  partner?: UserProfile;
  chats: ChatData[];
  orders: Map<number, Order>;
  currentUserId: number;
  userRole: UserRole;
  activeChatOrder?: number | null;
  activeChatContractor?: number | null;
  onChatSelected: (orderId: number, contractorId: number) => void;
  // TODO: Add handlers for showing user/order info cards
}

const getOrderStatusColorClass = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.CONTRACTOR_CONFIRMED: return styles.order_status_contractor_confirmed;
    case OrderStatus.IN_PROGRESS: return styles.order_status_in_progress;
    case OrderStatus.COMPLETED: return styles.order_status_completed;
    case OrderStatus.CLOSED: return styles.order_status_closed;
    case OrderStatus.CANCELLED: return styles.order_status_cancelled;
    case OrderStatus.DISPUTE: return styles.order_status_dispute;
    default: return '';
  }
};

export const UserChatGroup: FC<UserChatGroupProps> = ({
  partnerId,
  partner,
  chats,
  orders,
  currentUserId,
  userRole,
  activeChatOrder,
  activeChatContractor,
  onChatSelected,
}) => {
  const text = useLanguage();
  const { products } = useProducts();
  const [isExpanded, setIsExpanded] = useState(false);

  const displayName = partner?.fullname || partner?.name || text('Unknown user');
  const avatarSrc = partner?.avatar || '/img/user_avatar.png';

  const totalUnreadCount = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  const handleChatClick = (orderId: number, contractorId: number) => {
    onChatSelected(orderId, contractorId);
  };

  const getTimeSinceLastOnline = (lastOnline: Date) => {
    if (!lastOnline || !Number.isFinite(lastOnline.getTime()) || lastOnline.getTime() === 0) return text('never');

    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - lastOnline.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return text('just now');
    if (diffInMinutes < 60)
      return `${diffInMinutes} ${text('minute(s)')}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${text('hour(s)')}`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${text('day(s)')}`;
  };

  const getLastUpdateString = (lastUpdate?: Date) => {
    if (!lastUpdate || !Number.isFinite(lastUpdate.getTime())) return '';

    const dayUpdate = new Date(lastUpdate);
    dayUpdate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffInDays = Math.round((today.getTime() - dayUpdate.getTime()) / 86400000);
    if (diffInDays === 0) {
      return lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    else if (diffInDays === 1) {
      return text('Yesterday');
    }
    else if (diffInDays > 1 && diffInDays < 365) {
      return `${diffInDays} ${text('day(s) ago')}`
    }
    else if (diffInDays >= 365) {
      return `${Math.floor(diffInDays / 365)} ${text('year(s) ago')}`
    }
    else return '';
  };

  return (
    <div className={styles.big_messages}>
      <div
        className={`${styles.chat_group_header} ${isExpanded ? styles.expanded : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div
          className={styles.avatar_wrap}
          // onClick={() => showUserInfoCard(partner)}  // TODO: Implement user info card
        >
          <img src={avatarSrc} alt={displayName} className={styles.avatar} />
          <OnlineDotted isVisible={partner?.isOnline} /* className={styles.online_indicator_dot} */ />
        </div>
        <div className={styles.user_name}>{displayName}</div>
        {/* todo: Добавить время, когда был на сайте */}
        {!isExpanded && totalUnreadCount > 0 && (
          <span className={styles.chat_group_unread_badge}>{totalUnreadCount}</span>
        )}
        <img
          src="/img/arrowleft-white.png"
          alt="toggle"
          className={styles.arrow_icon}
        />
      </div>
      <div className={`${styles.chat_group_content} ${isExpanded ? styles.expanded : ''}`}>
        {chats.map(chat => {
            const isActive = chat.orderId === activeChatOrder && chat.contractorId === activeChatContractor;
            const order = orders.get(chat.orderId);
            const displayStatus =
              !order || chat.contractorId !== order.contractorId
              ? OrderStatus.CANCELLED
              : order.status;

            return (
              <div
                key={chat.orderId}
                className={`${styles.chat_item} ${isActive ? styles.active : ''}`}
                onClick={() => handleChatClick(chat.orderId, chat.contractorId)}
              >
                <span className={styles.order_number}>№{chat.orderId}</span>
                <span className={styles.product_name}>{products[order?.productId ?? '']?.name ?? text('Unknown service')}</span>
                <div
                  className={`${styles.order_status} ${getOrderStatusColorClass(displayStatus)}`}
                  title={text(orderStatusString[displayStatus])}
                  // onClick={() => showOrderInfoCard(order)}  // TODO: Implement order info card
                />
                {chat.unreadCount > 0 && (
                    <span className={styles.chat_item_unread_badge}>{chat.unreadCount}</span>
                )}
                <span className={styles.last_message_time}>
                  {getLastUpdateString(chat.lastUpdate)}
                </span>
              </div>
            );
          })}
      </div>
      <div className={styles.line_ilya}></div> {/* Separator */}
    </div>
  );
};
