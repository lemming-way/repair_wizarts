import { useEffect, useMemo } from 'react';
import '../../../scss/chat.css';
import { Link } from 'react-router-dom';

import { Order, useClientOrders, useContractorOrders } from 'app/state/order';
import { useUser, useUsersByIds, UserRole } from 'app/state/user';

// Тип для отдельного чата
type Chat = {
  chatId: string; // Например, `${clientId}_${contractorId}`
  otherUserId: number;
  orders: Order[]; // Все заказы, связанные с этим чатом
  lastMessage: {
    text: string;
    ts: string;
  };
};

// Утилита: получить последнее "сообщение" (описание заказа) из одного заказа
function getLastMessageFromOrder(order: Order): { text: string; ts: string } {
  // Используем описание заказа как заглушку для сообщений чата,
  // поскольку реальные сообщения чата еще не реализованы.
  let text = order.description || 'Нет сообщений';
  const MAX_LEN = 120;
  if (text.length > MAX_LEN) {
    text = text.slice(0, MAX_LEN).trimEnd() + '…';
  }
  // Используем order.updatedAt как временную метку последней активности в заказе
  return {
    text: text,
    ts: order.updatedAt.toISOString(),
  };
}

function FrameMessages() {
  const { user } = useUser();

  // Используем новые хуки для получения заказов
  const { orders: contractorOrders, isLoading: isLoadingContractorOrders } = useContractorOrders(true, true);
  const { orders: clientOrders, isLoading: isLoadingClientOrders } = useClientOrders(true, true);

  const isLoadingOrders = user.role === UserRole.Contractor ? isLoadingContractorOrders : isLoadingClientOrders;

  const groupedChats = useMemo(() => {
    const userOrders = 
      user.role === UserRole.Contractor ?
        contractorOrders
      :
        clientOrders.filter(order => !!order.contractorId);

    if (!userOrders.length || !user.id || !user.role) return [];

    const chatsMap = new Map<number, { orders: Order[]; otherUserId: number }>();

    for (const order of userOrders) {
        if (!order.id) continue;

        let otherUserId: number | undefined;
        // Определяем ID другого участника на основе роли текущего пользователя
        if (user.role === UserRole.Client && order.contractorId && order.contractorId !== user.id) {
            otherUserId = order.contractorId;
        } else if (user.role === UserRole.Contractor && order.clientId && order.clientId !== user.id) {
            otherUserId = order.clientId;
        }

        if (otherUserId) {
            if (!chatsMap.has(otherUserId)) {
                chatsMap.set(otherUserId, { orders: [], otherUserId });
            }
            chatsMap.get(otherUserId)!.orders.push(order);
        }
    }

    const chats: Chat[] = Array.from(chatsMap.values()).map((chatGroup) => {
        // Находим последний заказ в этой группе, чтобы получить временную метку "последнего сообщения"
        const sortedOrders = [...chatGroup.orders].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        const latestOrder = sortedOrders[0];
        const lastMsg = getLastMessageFromOrder(latestOrder); // Используем рефакторенную вспомогательную функцию

        // Создаем стабильный chatId, используя отсортированные ID обоих участников
        const currentUserId = user.id;
        const otherParticipantId = chatGroup.otherUserId;
        const chatId = user.role === UserRole.Contractor ?
          `${otherParticipantId}_${currentUserId}` :
          `${currentUserId}_${otherParticipantId}`;

        return {
            chatId,
            otherUserId: chatGroup.otherUserId,
            orders: chatGroup.orders, // Все заказы для этого чата
            lastMessage: lastMsg,
        };
    });

    // Сортируем чаты по временной метке последнего сообщения (сначала самые новые)
    chats.sort((a, b) => {
        const tsA = new Date(a.lastMessage.ts).getTime();
        const tsB = new Date(b.lastMessage.ts).getTime();
        return tsB - tsA;
    });

    return chats;
  }, [clientOrders, contractorOrders, user.id, user.role]);

  // Собираем уникальные ID других пользователей для получения их профилей
  const uniqueOtherUserIds = useMemo(() => {
    return Array.from(new Set(groupedChats.map(chat => chat.otherUserId)));
  }, [groupedChats]);

  // Получаем профили всех других участников чатов
  const { users: otherUsers, isLoading: isLoadingOtherUsers } = useUsersByIds(uniqueOtherUserIds);

  // Создаем Map для быстрого поиска профилей пользователей по ID
  const otherUsersMap = useMemo(() => {
    return new Map(otherUsers.map(u => [u.id, u]));
  }, [otherUsers]);

  useEffect(() => {
    document.title = 'Чат';
  }, []);

  if (isLoadingOrders || isLoadingOtherUsers) {
    return (
      <div className="frame_messages frame_messages__fullchat">
        <div className="block_messages font_inter">
          <div className="messages_text">
            <h2>Сообщения</h2>
          </div>
          <div className="magnafire df align">
            <div className="magnafire_img">
              <img src="/img/chat_img/лупа.png" alt="no img" />
            </div>
            <div className="magnafire_input">
              <input type="text" placeholder="Поиск..." />
            </div>
          </div>
        </div>
        <div className="big_messages__wrap">Загрузка чатов...</div>
      </div>
    );
  }

  return (
    <div className="frame_messages frame_messages__fullchat">
      <div className="block_messages font_inter">
        <div className="messages_text">
          <h2>Сообщения</h2>
        </div>
        <div className="magnafire df align">
          <div className="magnafire_img">
            <img src="/img/chat_img/лупа.png" alt="no img" />
          </div>
          <div className="magnafire_input">
            <input type="text" placeholder="Поиск..." />
          </div>
        </div>
      </div>

      <div className="big_messages__wrap">
        {groupedChats.length === 0
          ? 'Пусто'
          : groupedChats.map((chat) => {
              const otherUserInfo = otherUsersMap.get(chat.otherUserId);
              if (!otherUserInfo) return null; // Этого не должно произойти, если данные согласованы

              const displayName = otherUserInfo.fullname || otherUserInfo.name || 'Неизвестный пользователь';
              const avatarSrc = otherUserInfo.avatar || '/img/img-camera.png';

              return (
                <div className="big_messages" key={chat.chatId}>
                  <Link
                    to={
                      user.role === UserRole.Contractor
                        ? `/contractor/chat/${chat.chatId}`
                        : `/client/chat/${chat.chatId}`
                    }
                  >
                    <div className="ilya df font_inter align">
                      <div className="ilya_img">
                        <img
                          src={avatarSrc}
                          style={{ height: 65, width: 66, borderRadius: 30 }}
                          alt="chat icon"
                        />
                      </div>

                      <div className="ilya_text">
                        <h2>{displayName}</h2>

                        <h3
                          className="txt-text-small-ver"
                          style={{ color: '#555' }}
                          title={chat.lastMessage.text}
                        >
                          {chat.lastMessage.text}
                        </h3>
                      </div>

                      <div className="ilya_text-2">
                        <h2>
                          {new Date(chat.lastMessage.ts).toLocaleTimeString(
                            'ru-RU',
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </h2>
                      </div>
                    </div>
                    <div className="line_ilya"></div>
                  </Link>
                </div>
              );
            })}
      </div>
    </div>
  );
}

export default FrameMessages;
