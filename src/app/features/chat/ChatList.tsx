import type { FC } from 'react';

import { useLanguage } from 'app/state/language';
import { useActiveChats, ChatData } from 'app/state/chat';
import { useOrdersByIds, Order } from 'app/state/order';
import { useUsersByIds, UserProfile, UserRole } from 'app/state/user';
import { UserChatGroup } from './UserChatGroup';

import styles from './Chat.module.css';

interface ChatListProps {
  currentUser: UserProfile;
  currentOrderId: number | null;
  currentContractorId: number | null;
  onChatSelected: (orderId: number, contractorId: number) => void;
}

export const ChatList: FC<ChatListProps> = ({
  currentUser: user,
  currentOrderId: orderId,
  currentContractorId: contractorId,
  onChatSelected
}) => {
  const text = useLanguage();
  const { chats, isLoading: isLoadingChats, isError: isErrorChats } = useActiveChats();

  // Group chats by the chat partner
  const allUserIds = new Set<number>();
  const allOrderIds = new Set<number>();
  const chatGroups = new Map<number, ChatData[]>();
  
  if (user.id) {
    for (const chat of chats) {
      const otherUserId = user.role === UserRole.Client ? chat.contractorId : chat.clientId;
      if (!chatGroups.has(otherUserId)) chatGroups.set(otherUserId, [] as ChatData[]);
      chatGroups.get(otherUserId)!.push(chat);
      allUserIds.add(otherUserId);
      allOrderIds.add(chat.orderId);
    }
  }

  // Fetch full order details for all relevant orders
  const { orders, isLoading: isLoadingOrders, isError: isErrorOrders } = useOrdersByIds([...allOrderIds]);

  // Fetch user profiles
  const { users, isLoading: isLoadingPartners, isError: isErrorPartners } = useUsersByIds([...allUserIds]);

  // Ранний выход из функции, если данные не готовы
  if (isLoadingChats || isLoadingOrders || isLoadingPartners) {
    return (
      <div className={styles.big_messages__wrap}>
        <p>{text('Loading chats...')}</p>
      </div>
    );
  }

  if (isErrorChats || isErrorOrders || isErrorPartners) {
    return (
      <div className={styles.big_messages__wrap}>
        <p>{text('Error loading chats. Please try again.')}</p>
      </div>
    );
  }

  if (!user.id || chatGroups.size === 0) {
    return (
      <div className={styles.big_messages__wrap}>
        <p>{text('No active chats.')}</p>
      </div>
    );
  }

  const ordersMap = new Map<number, Order>(orders.map(order => [ order.id, order ]));
  const partnersMap = new Map<number, UserProfile>(users.map(partner => [ partner.id, partner ]));

  const sortedChatGroups = [...chatGroups].sort((a, b) => {
    const lastUpdateA = Math.max(...a[1].map(chat => chat.lastUpdate?.getTime() ?? 0));
    const lastUpdateB = Math.max(...b[1].map(chat => chat.lastUpdate?.getTime() ?? 0));
    return (lastUpdateA - lastUpdateB) ||
      (partnersMap.get(a[0])?.fullname ?? '').localeCompare((partnersMap.get(b[0])?.fullname ?? '')) ||
      a[0] - b[0];
  });

  return (
    <div className={styles.big_messages__wrap}>
      {sortedChatGroups.map(([ partnerId, chats ]) => (
        <UserChatGroup
          key={partnerId}
          partnerId={partnerId}
          partner={partnersMap.get(partnerId)}
          chats={chats}
          orders={ordersMap}
          currentUserId={user.id}
          userRole={user.role}
          activeChatOrder={orderId}
          activeChatContractor={contractorId}
          onChatSelected={onChatSelected}
        />
      ))}
    </div>
  );
};
