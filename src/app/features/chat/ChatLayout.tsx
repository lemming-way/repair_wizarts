import React, { FC, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useLanguage } from 'app/state/language';
import {
  Order,
  OrderStatus,
  useOrdersByIds,
  useCancelOrder,
  useStartOrderWork,
  useCompleteOrderByContractor,
  useVerifyOrderCompletion,
} from 'app/state/order';
import { useUser } from 'app/state/user';
import { ChatList } from './ChatList';
import { OrderChatControl } from './OrderChatControl';
import DisputeModalV2 from 'app/components/full-chat/fakeChat/DisputeModal_v2'; // Для визуальной ссылки, будет использоваться для действий по спору
import styles from './Chat.module.css';

export const ChatLayout: FC = () => {
  const navigate = useNavigate();
  const text = useLanguage();
  const { user } = useUser();

  const { orderId, contractorId } = (params => {
    const orderNum = Number(params.orderId ?? 0);
    const orderId = Number.isInteger(orderNum) && orderNum > 0 ? orderNum : null;
    const contractorNum = Number(params.contractorId ?? 0);
    const contractorId = Number.isInteger(contractorNum) && contractorNum > 0 ? contractorNum : null;
    return { orderId, contractorId };
  })(useParams<{ orderId: string, contractorId: string }>());

  const isChatOpen = !!orderId && !!contractorId;
  const [isChatListVisible, setIsChatListVisible] = useState(!isChatOpen); // Скрыть список по умолчанию, если чат открыт

  // Состояния для модальных окон
  const [isVisibleDisputeModal, setIsVisibleDisputeModal] = useState(false);
  const [disputeOrderId, setDisputeOrderId] = useState<number | null>(null);

  // Получаем детали текущего заказа
  const { orders, isLoading: isLoadingOrder } = useOrdersByIds(
    orderId && contractorId ? [orderId] : []
  );
  const currentOrder = orders[0];

  // Мутации для действий с заказом
  const { cancelOrder } = useCancelOrder();
  const { startOrderWork } = useStartOrderWork();
  const { completeOrderByContractor } = useCompleteOrderByContractor();
  const { verifyOrderCompletion } = useVerifyOrderCompletion();

  // Колбэки для OrderChatControl
  const handleCancelOrder = useCallback(async (order: Order, reason: string) => {
    try {
      if (order.status === OrderStatus.CONTRACTOR_CONFIRMED) {
        await cancelOrder({ orderId: order.id, reason });
      }
      else {
        alert('(Заглушка) Запрос на отмену заказа отправлен');
      }
    } catch (error: any) {
      alert(text(`Failed to cancel order: ${error.message}`));
    }
  }, [cancelOrder, text]);

  const handleStartWork = useCallback(async (orderId: number) => {
    try {
      await startOrderWork(orderId);
    } catch (error: any) {
      alert(text(`Failed to start work: ${error.message}`));
    }
  }, [startOrderWork, text]);

  const handleCompleteWork = useCallback(async (orderId: number) => {
    try {
      await completeOrderByContractor(orderId);
    } catch (error: any) {
      alert(text(`Failed to complete work: ${error.message}`));
    }
  }, [completeOrderByContractor, text]);

  const handleVerifyCompletion = useCallback(async (orderId: number) => {
    try {
      await verifyOrderCompletion(orderId);
    } catch (error: any) {
      alert(text(`Failed to verify completion: ${error.message}`));
    }
  }, [verifyOrderCompletion, text]);

  const handleShowDisputeModal = useCallback((orderId: number) => {
    setDisputeOrderId(orderId);
    setIsVisibleDisputeModal(true);
  }, []);

  const handleCloseChat = useCallback(async (orderId: number, contractorId: number) => {
    console.log('Chat closed');
    navigate('/chats');
  }, [navigate]);

  // Обновление видимости списка чатов при изменении URL
  useEffect(() => {
    setIsChatListVisible(!isChatOpen);
  }, [isChatOpen]);

  const handleChatSelected = (orderId: number, contractorId: number) => {
    if (window.innerWidth <= 768) {
      setIsChatListVisible(false);
    }
    navigate(`/order/${orderId}/chat/${contractorId}`);
  };

  if (!user.id) {
    return (
      <section className={styles.container}>
        <div className={styles.empty_chat}>
          <img src="/img/empty_chat.png" alt="" />
          <p>{text('Please log in to view chats.')}</p>
        </div>
      </section>
    );
  }

  const isLoadingChatDetails = isLoadingOrder;

  return (
    <section className={styles.container}>
      {isVisibleDisputeModal && disputeOrderId && (
        <DisputeModalV2
          id={disputeOrderId}
          setVisibleDispute={setIsVisibleDisputeModal}
          setVisibleDisputeFinal={() => {}} // Заглушка, если потребуется финальное модальное окно спора
        />
      )}

      {/* Кнопка для переключения видимости списка чатов, видна когда список свернут */}
      {!isChatListVisible && (
        <button
          className={`${styles.chat_list_toggle_button}`}
          onClick={() => setIsChatListVisible(true)}
          title={text('Open chat list')}
        >
          <img src="/img/arrowleft-white.png" alt="Open" style={{ transform: 'rotate(180deg)' }}/> {/* Корректируем иконку */}
        </button>
      )}

      <div className={`${styles.frame_messages} ${!isChatListVisible ? styles.collapsed : ''}`}>
        <ChatList
          currentUser={user}
          currentOrderId={orderId}
          currentContractorId={contractorId}
          onChatSelected={handleChatSelected}
        />
      </div>

      <div className={styles.chat_window_area}>
        {isChatOpen ? (
          isLoadingChatDetails ? (
            <div className={styles.empty_chat}>
              <p>{text('Loading chat details...')}</p>
            </div>
          ) : currentOrder ? (
            <>
              <OrderChatControl
                order={currentOrder}
                chatContractorId={contractorId}
                currentUser={user}
                onCloseChat={handleCloseChat}
                onCancelOrder={handleCancelOrder}
                onStartWork={handleStartWork}
                onCompleteWork={handleCompleteWork}
                onVerifyCompletion={handleVerifyCompletion}
                onShowDisputeModal={handleShowDisputeModal}
              />
              <div className="chat_messages_feed">
                {/* TODO: Здесь будет компонент ленты сообщений */}
                <h2 style={{ textAlign: 'center', padding: '20px' }}>
                  {text('Message feed for Order')} №{currentOrder.id}
                </h2>
                <p style={{ textAlign: 'center', color: '#515151' }}>
                  {text('Actual message feed and input area will be here.')}
                </p>
              </div>
            </>
          ) : (
            <div className={styles.empty_chat}>
              <p>{text('Chat not found or invalid parameters.')}</p>
            </div>
          )
        ) : (
          <div className={styles.empty_chat}>
            <img src="/img/empty_chat.png" alt="" />
            <p>{text('Please select a conversation to view messages!')}</p>
          </div>
        )}
      </div>
    </section>
  );
};
