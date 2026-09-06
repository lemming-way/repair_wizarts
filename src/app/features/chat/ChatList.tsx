import { FC, useEffect, useState } from 'react';

import { useLanguage } from 'app/state/language';
import { useActiveChats, ChatData } from 'app/state/chat';
import { useOrdersByIds, Order, OrderStatus } from 'app/state/order';
import { useProducts } from 'app/state/site-data';
import { useUsersByIds, UserProfile, UserRole } from 'app/state/user';
import { UserChatGroup } from './UserChatGroup';

import styles from './Chat.module.css';

interface ChatListProps {
  currentUser: UserProfile;
  isChatOpen: boolean;
  currentOrderId: number | null;
  currentContractorId: number | null;
  onChatSelected: (orderId: number, contractorId: number) => void;
  setChatOpen: (orderId: number, contractorId: number) => void;
}

export const ChatList: FC<ChatListProps> = ({
  currentUser: user,
  isChatOpen,
  currentOrderId: orderId,
  currentContractorId: contractorId,
  onChatSelected,
  setChatOpen
}) => {
  const text = useLanguage();
  const { products } = useProducts();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
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

  useEffect(() => {
    if (isChatOpen && orderId && contractorId && chats) {
      const currentChat = chats.find(chat => chat.orderId === orderId && chat.contractorId === contractorId);
      if (!currentChat || !currentChat.isOpen) {
        setChatOpen(orderId, contractorId);
      }
    }
  }, [chats, isChatOpen, orderId, contractorId, setChatOpen]);

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

  const normalizedSearch = search.trim().toLowerCase();
  const filteredChatGroups = sortedChatGroups
    .map(([partnerId, groupChats]) => {
      const partner = partnersMap.get(partnerId);
      const partnerName = `${partner?.fullname || ''} ${partner?.name || ''}`.toLowerCase();
      const filteredChats = groupChats.filter(chat => {
        const order = ordersMap.get(chat.orderId);
        const status = order?.status;
        const matchesStatus = statusFilter === 'completed'
          ? status === OrderStatus.COMPLETED || status === OrderStatus.CLOSED
          : statusFilter === 'cancelled'
            ? status === OrderStatus.CANCELLED
            : status !== OrderStatus.COMPLETED
              && status !== OrderStatus.CLOSED
              && status !== OrderStatus.CANCELLED;
        const productName = products[order?.productId ?? 0]?.name?.toLowerCase() || '';
        const matchesSearch = !normalizedSearch
          || partnerName.includes(normalizedSearch)
          || productName.includes(normalizedSearch)
          || String(chat.orderId).includes(normalizedSearch);
        return matchesStatus && matchesSearch;
      });
      return [partnerId, filteredChats] as [number, ChatData[]];
    })
    .filter(([, groupChats]) => groupChats.length > 0);

  return (
    <div className={styles.chat_list_content}>
      <div className={styles.chat_list_controls}>
        <div className={styles.chat_search}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Поиск по чатам"
          />
        </div>
        <nav className={styles.chat_status_tabs} aria-label="Фильтр чатов">
          {[
            ['active', 'Активные'],
            ['completed', 'Выполненные'],
            ['cancelled', 'Отменённые'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`${styles.chat_status_tab} ${statusFilter === value ? styles.active : ''}`}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
      <div className={styles.big_messages__wrap}>
      {filteredChatGroups.length === 0 && (
        <p className={styles.chat_list_empty}>Чаты не найдены</p>
      )}
      {filteredChatGroups.map(([ partnerId, chats ]) => (
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
    </div>
  );
};
