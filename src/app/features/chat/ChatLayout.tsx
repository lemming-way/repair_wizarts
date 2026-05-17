import React, { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useLanguage } from 'app/state/language';
import {
  Order,
  OrderStatus,
  useOrdersByIds,
  useCancelOrder,
  useAcceptOffer,
  useAcceptInvoice,
  useStartOrderWork,
  useCompleteOrderByContractor,
  useVerifyOrderCompletion,
} from 'app/state/order';
import { useUser, UserRole } from 'app/state/user';
import { MessageFormat, useSetChatOpen, useSendMessage } from 'app/state/chat';
import { ChatList } from './ChatList';
import { OrderChatControl } from './OrderChatControl';
import { MessageFeed } from './MessageFeed';
import { ChatInput } from './ChatInput';
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

  // Получаем детали текущего заказа
  const { orders, isLoading: isLoadingOrder } = useOrdersByIds(
    orderId && contractorId ? [orderId] : []
  );
  const currentOrder = orders[0];

  const isChatOpen = !!orderId && !!contractorId && !!currentOrder;
  const [isChatListVisible, setIsChatListVisible] = useState(!isChatOpen); // Скрыть список по умолчанию, если чат открыт

  // Состояния для модальных окон
  const [isVisibleDisputeModal, setIsVisibleDisputeModal] = useState(false);
  const [disputeOrderId, setDisputeOrderId] = useState<number | null>(null);

  // Мутации для действий с чатом
  const { setChatOpen } = useSetChatOpen();
  const { sendMessage, isPending: isSendingMessage } = useSendMessage();

  // Мутации для действий с заказом
  const { cancelOrder } = useCancelOrder();
  const { acceptOffer } = useAcceptOffer();
  const { acceptInvoice } = useAcceptInvoice();
  const { startOrderWork } = useStartOrderWork();
  const { completeOrderByContractor } = useCompleteOrderByContractor();
  const { verifyOrderCompletion } = useVerifyOrderCompletion();

  // Колбэки для OrderChatControl
  const handleCancelOrder = useCallback(async (order: Order, reason: string) => {
    try {
      if (order.status === OrderStatus.APPOINTED) {
        await cancelOrder({ orderId: order.id, reason });
      }
      else {
        alert('(Заглушка) Запрос на отмену заказа отправлен');
      }
    } catch (error: any) {
      alert(`Failed to cancel order: ${error.message}`);
    }
  }, [cancelOrder, text]);

  const handleAcceptOffer = useCallback(async (orderId: number, contractorId: number) => {
    try {
      // Stub for payment selection
      // Here you would typically proceed to payment or confirmation
      // For now, we just show the confirmation modal
      //~ setVisibleBlockPayment(false); // Close payment selection if it was open
      await acceptOffer({ orderId, contractorId });
    } catch (error: any) {
      console.error('Failed to accept offer:', error);
      alert(error.message); // todo: сделать нормальное сообщение об ошибке
    }
  }, [acceptOffer]);

  const handleAcceptInvoice = useCallback(async (orderId: number) => {
    try {
      await acceptInvoice(orderId);
    } catch (error: any) {
      console.error('Failed to accept invoice:', error);
      alert(error.message); // todo: сделать нормальное сообщение об ошибке
    }
  }, [acceptInvoice]);

  const handleStartWork = useCallback(async (orderId: number) => {
    try {
      await startOrderWork(orderId);
    } catch (error: any) {
      alert(`Failed to start work: ${error.message}`);
    }
  }, [startOrderWork, text]);

  const handleCompleteWork = useCallback(async (orderId: number) => {
    try {
      await completeOrderByContractor(orderId);
    } catch (error: any) {
      alert(`Failed to complete work: ${error.message}`);
    }
  }, [completeOrderByContractor, text]);

  const handleVerifyCompletion = useCallback(async (orderId: number) => {
    try {
      await verifyOrderCompletion(orderId);
    } catch (error: any) {
      alert(`Failed to verify completion: ${error.message}`);
    }
  }, [verifyOrderCompletion, text]);

  const handleShowDisputeModal = useCallback((orderId: number) => {
    setDisputeOrderId(orderId);
    setIsVisibleDisputeModal(true);
  }, []);

  const handleOpenChat = useCallback(async (orderId: number, contractorId: number) => {
    try {
      await setChatOpen({ orderId, contractorId, isOpen: true });
    } catch (error: any) {
      alert(`Failed to mark chat open: ${error.message}`);
    }
  }, [setChatOpen]);

  const handleCloseChat = useCallback(async (orderId: number, contractorId: number) => {
    try {
      await setChatOpen({ orderId, contractorId, isOpen: false });
    } catch (error: any) {
      alert(`Failed to mark chat closed: ${error.message}`);
    }
    navigate('/chats');
  }, [navigate]);

  const handleSendMessage = useCallback(async (
    orderId: number,
    contractorId: number,
    message: string,
    files: File[],
  ) => {
    const payload = {
      orderId,
      contractorId,
      text: message,
      format: MessageFormat.Text
    };

    try {
      await sendMessage(payload);
    }
    catch (err: any) {
      console.error('Send message failed:', err);
    }
  }, []);


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
    <section className={user.role === UserRole.Contractor ? `${styles.container} ${styles.contractor}` : styles.container}>
      {isVisibleDisputeModal && disputeOrderId && (
        <DisputeModalV2
          id={disputeOrderId}
          setVisibleDispute={setIsVisibleDisputeModal}
          setVisibleDisputeFinal={() => {}} // Заглушка, если потребуется финальное модальное окно спора
        />
      )}

      {/* Кнопка для переключения видимости списка чатов, видна когда список свернут */}
      {isChatOpen && (
        isChatListVisible ?
          <button
            className={`${styles.chat_list_toggle_button} ${styles.close}`}
            onClick={() => setIsChatListVisible(false)}
            title={text('Close chat list')}
          >
            <img src="/img/arrowleft-white.png" alt="Close" /> {/* Корректируем иконку */}
          </button>
        :
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
          isChatOpen={isChatOpen}
          currentOrderId={orderId}
          currentContractorId={contractorId}
          onChatSelected={handleChatSelected}
          setChatOpen={handleOpenChat}
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
                onAcceptOffer={handleAcceptOffer}
                onAcceptInvoice={handleAcceptInvoice}
                onStartWork={handleStartWork}
                onCompleteWork={handleCompleteWork}
                onVerifyCompletion={handleVerifyCompletion}
                onShowDisputeModal={handleShowDisputeModal}
              />
              <MessageFeed
                order={currentOrder}
                contractorId={contractorId}
                currentUser={user}
              />
              <ChatInput
                orderId={orderId}
                clientId={currentOrder.clientId}
                contractorId={contractorId}
                currentUser={user}
                onSendMessage={handleSendMessage}
                isBusy={isSendingMessage}
              />
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
