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
  useRejectInvoice,
  useStartOrderWork,
  useFinishOrderWork,
  useConfirmOrderCompletion,
} from 'app/state/order';
import { useUser, UserRole } from 'app/state/user';
import { MessageFormat, useChatsByIds, useSetChatRead, useSetChatOpen, useSendMessage, useUpdateMessage, useDeleteMessage } from 'app/state/chat';
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

  const chatList = isChatOpen ? [ `${orderId}:${contractorId}`] : [];
  const { chats } = useChatsByIds(chatList);
  const currentChat = chats[0];

  // Состояния для модальных окон
  const [isVisibleDisputeModal, setIsVisibleDisputeModal] = useState(false);
  const [disputeOrderId, setDisputeOrderId] = useState<number | null>(null);

  // Мутации для действий с чатом
  const { setChatRead } = useSetChatRead();
  const { setChatOpen } = useSetChatOpen();
  const { sendMessage, isPending: isSendingMessage } = useSendMessage();
  const { updateMessage, isPending: isUpdatingMessage } = useUpdateMessage();
  const { deleteMessage, isPending: isDeletingMessage } = useDeleteMessage();

  const [replyTo, setReplyTo] = useState<number | undefined>(undefined);
  const [editMessageID, setEditMessageID] = useState<number | undefined>(undefined);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  // Мутации для действий с заказом
  const { cancelOrder } = useCancelOrder();
  const { acceptOffer } = useAcceptOffer();
  const { acceptInvoice } = useAcceptInvoice();
  const { rejectInvoice } = useRejectInvoice();
  const { startOrderWork } = useStartOrderWork();
  const { finishOrderWork } = useFinishOrderWork();
  const { confirmOrderCompletion } = useConfirmOrderCompletion();

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

  const handleRejectInvoice = useCallback(async (orderId: number, reason: string) => {
    try {
      await rejectInvoice({ orderId, reason });
    } catch (error: any) {
      console.error('Failed to reject invoice:', error);
      alert(error.message); // todo: сделать нормальное сообщение об ошибке
    }
  }, [rejectInvoice]);

  const handleStartWork = useCallback(async (orderId: number) => {
    try {
      await startOrderWork(orderId);
    } catch (error: any) {
      alert(`Failed to start work: ${error.message}`);
    }
  }, [startOrderWork, text]);

  const handleCompleteWork = useCallback(async (orderId: number) => {
    try {
      await finishOrderWork(orderId);
    } catch (error: any) {
      alert(`Failed to complete work: ${error.message}`);
    }
  }, [finishOrderWork, text]);

  const handleVerifyCompletion = useCallback(async (orderId: number) => {
    try {
      await confirmOrderCompletion(orderId);
    } catch (error: any) {
      alert(`Failed to verify completion: ${error.message}`);
    }
  }, [confirmOrderCompletion, text]);

  const handleShowDisputeModal = useCallback((orderId: number) => {
    setDisputeOrderId(orderId);
    setIsVisibleDisputeModal(true);
  }, []);

  const handleReadChat = useCallback(async (orderId: number, contractorId: number) => {
    try {
      await setChatRead({ orderId, contractorId });
    } catch (error: any) {
      alert(`Failed to mark chat read: ${error.message}`);
    }
  }, [setChatRead]);

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
  }, [navigate, setChatOpen]);

  // Мутации для действий с сообщениями
  const handleSendMessage = useCallback(async (
    orderId: number,
    contractorId: number,
    message: string,
    files: File[],
    replyToMessage?: number,
  ) => {
    try {
      if (message || replyToMessage) {
        const file = files.shift();
        const format = file ? MessageFormat.File : MessageFormat.Text;
        await sendMessage({ orderId, contractorId, text: message, format, file, replyToMessage });
      }
      for (const file of files) {
        await sendMessage({ orderId, contractorId, file, format: MessageFormat.File });
      }
      setReplyTo(undefined);
    }
    catch (err: any) {
      console.error('Send message failed:', err);
    }
  }, [sendMessage]);

  const handleUpdateMessage = useCallback(async (
    messageId: number,
    message: string,
  ) => {
    try {
      if (messageId) {
        await updateMessage({ messageId, text: message });
        setEditMessageID(undefined);
      }
    }
    catch (err: any) {
      console.error('Update message failed:', err);
    }
  }, [updateMessage]);

  const handleSendAudio = useCallback(async (
    orderId: number,
    contractorId: number,
    audio: File,
    replyToMessage?: number,
  ) => {
    try {
      if (audio) {
        await sendMessage({
          orderId,
          contractorId,
          format: MessageFormat.Audio,
          audio,
          replyToMessage
        });
        setReplyTo(undefined);
      }
    }
    catch (err: any) {
      console.error('Send message failed:', err);
    }
  }, [sendMessage]);

  const handleEditMessage = (id: number) => {
    setEditMessageID(id);
  };

  const cancelEditMessage = () => {
    setEditMessageID(undefined);
  };

  const handleDeleteMessage = async (id: number) => {
    // todo: сделать здесь нормальный UI
    if (!window.confirm(text('Delete message for everyone?'))) return;
    try {
      await deleteMessage(id);
    } catch (error) {
      console.error('Failed to delete message:', error);
      window.alert(text('Failed to delete message. Please try again.'));
    }
  };

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
            <img src="/img/arrowleft-white.png" alt="Open" />
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
                isChatUnread={currentChat?.unreadCount > 0}
                currentUser={user}
                onSetChatRead={handleReadChat}
                onCloseChat={handleCloseChat}
                onCancelOrder={handleCancelOrder}
                onAcceptOffer={handleAcceptOffer}
                onAcceptInvoice={handleAcceptInvoice}
                onRejectInvoice={handleRejectInvoice}
                onStartWork={handleStartWork}
                onCompleteWork={handleCompleteWork}
                onVerifyCompletion={handleVerifyCompletion}
                onShowDisputeModal={handleShowDisputeModal}
              />
              <MessageFeed
                currentUserId={user.id}
                chat={currentChat}
                onReply={setReplyTo}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
              />
              <ChatInput
                orderId={orderId}
                clientId={currentOrder.clientId}
                contractorId={contractorId}
                currentUser={user}
                onSendMessage={handleSendMessage}
                onSendAudio={handleSendAudio}
                onUpdateMessage={handleUpdateMessage}
                isBusy={isSendingMessage}
                replyTo={replyTo}
                editMessage={editMessageID}
                onCancelEdit={cancelEditMessage}
                onCancelReply={() => setReplyTo(undefined)}
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
