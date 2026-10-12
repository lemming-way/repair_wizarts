import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useLanguage } from 'app/state/language';
import {
  Order,
  useOrdersByIds,
  useCancelOrder,
  useRequestCancelOrder,
  useRevokeOrderCancellation,
  useAcceptOffer,
  useAcceptInvoice,
  useRejectInvoice,
  useStartOrderWork,
  useFinishOrderWork,
  useConfirmOrderCompletion,
  useOpenOrderDispute,
} from 'app/state/order';
import { UserRole, useUser, useUsersByIds, useUpdateUser } from 'app/state/user';
import { MessageFormat, useChatsByIds, useSetChatRead, useSetChatOpen, useSendMessage, useUpdateMessage, useDeleteMessage } from 'app/state/chat';
import { ChatList } from './ChatList';
import { OrderChatControl } from './OrderChatControl';
import { MessageFeed } from './MessageFeed';
import { ChatInput } from './ChatInput';
import { DisputeModal } from './DisputeModal';
import { BlockUserModal } from './BlockUserModal';
import { BlackListModal } from './BlackListModal';
import styles from './Chat.module.css';

export function ChatLayout() {
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
  const { orders: [currentOrder], isLoading: isLoadingOrder } = useOrdersByIds(
    orderId && contractorId ? [orderId] : []
  );

  const isChatOpen = !!orderId && !!contractorId && !!currentOrder;
  const [isChatListVisible, setIsChatListVisible] = useState(!isChatOpen); // Скрыть список по умолчанию, если чат открыт

  const chatPartnerId = user.role === UserRole.Client ? contractorId : currentOrder?.clientId;
  const { users: [chatPartner] } = useUsersByIds(chatPartnerId ? [chatPartnerId] : []);
  const isBlacklisted = user.blackList?.includes(chatPartner?.id ?? 0) || chatPartner?.blackList?.includes(user.id);

  const chatList = isChatOpen ? [ `${orderId}:${contractorId}`] : [];
  const { chats: [currentChat] } = useChatsByIds(chatList);

  // Состояния для модальных окон
  const [isVisibleDisputeModal, setIsVisibleDisputeModal] = useState(false);
  const [disputeOrderId, setDisputeOrderId] = useState<number | null>(null);
  const [isBlockUserVisible, setIsBlockUserVisible] = useState(false);
  const [blockUserId, setBlockUserId] = useState<number | null>(null);
  const [isBlackListVisible, setIsBlackListVisible] = useState(false);

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

  const { saveUser } = useUpdateUser();

  // Мутации для действий с заказом
  const { cancelOrder } = useCancelOrder();
  const { requestCancelOrder } = useRequestCancelOrder();
  const { revokeOrderCancellation } = useRevokeOrderCancellation();
  const { acceptOffer } = useAcceptOffer();
  const { acceptInvoice } = useAcceptInvoice();
  const { rejectInvoice } = useRejectInvoice();
  const { startOrderWork } = useStartOrderWork();
  const { finishOrderWork } = useFinishOrderWork();
  const { confirmOrderCompletion } = useConfirmOrderCompletion();
  const { openOrderDispute } = useOpenOrderDispute();

  // Колбэки для чёрного списка
  const handleBlockUser = async () => {
    if (!user.blackList || !blockUserId || user.blackList.includes(blockUserId)) return true;
    try {
      const newBl = [...user.blackList, blockUserId];
      await saveUser({ blackList: newBl });
      setBlockUserId(null);
      return true;
    }
    catch (e) {
      console.log('Не удалось сохранить чёрный список');
    }
    return false;
  };

  const handleUnblockUser = async (id: number) => {
    if (!user.blackList || !id || !user.blackList.includes(id)) return true;
    try {
      const newBl = user.blackList.filter(uid => uid !== id);
      await saveUser({ blackList: newBl });
      return true;
    }
    catch (e) {
      console.log('Не удалось сохранить чёрный список');
    }
    return false;
  };

  // Колбэки для OrderChatControl
  const handleBlockUserClick = (userId: number) => {
    setBlockUserId(userId);
    setIsBlockUserVisible(true);
  }

  const handleBlackListOpen = () => {
    setIsBlackListVisible(true);
  }

  const handleCancelOrder = useCallback(async (order: Order, reason: string) => {
    try {
      await cancelOrder({ orderId: order.id, reason });
    } catch (error: any) {
      alert(`Failed to cancel order: ${error.message}`);
    }
  }, [cancelOrder]);

  const handleRequestCancelOrder = useCallback(async (order: Order) => {
    try {
      await requestCancelOrder(order.id);
    } catch (error: any) {
      alert(`Failed to request order cancellation: ${error.message}`);
    }
  }, [requestCancelOrder]);

  const handleRevokeCancelOrder = useCallback(async (order: Order) => {
    try {
      await revokeOrderCancellation(order.id);
    } catch (error: any) {
      alert(`Failed to revoke order cancellation: ${error.message}`);
    }
  }, [revokeOrderCancellation]);

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
  }, [startOrderWork]);

  const handleCompleteWork = useCallback(async (orderId: number) => {
    try {
      await finishOrderWork(orderId);
    } catch (error: any) {
      alert(`Failed to complete work: ${error.message}`);
    }
  }, [finishOrderWork]);

  const handleVerifyCompletion = useCallback(async (orderId: number) => {
    try {
      await confirmOrderCompletion(orderId);
    } catch (error: any) {
      alert(`Failed to verify completion: ${error.message}`);
    }
  }, [confirmOrderCompletion]);

  const handleDisputeOpen = useCallback(async (claim: string) => {
    if (disputeOrderId && claim) {
      try {
        await openOrderDispute({ orderId: disputeOrderId, claim });
        setIsVisibleDisputeModal(false);
      } catch (error: any) {
        alert(`Failed to open dispute: ${error.message}`);
      }
    }
  }, [openOrderDispute, disputeOrderId]);

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
  const handleSendMessage = useCallback((
    orderId: number,
    contractorId: number,
    message: string,
    files: File[],
    replyToMessage?: number,
  ) => {
    if (message || replyToMessage) {
      const file = files.shift();
      const format = file ? MessageFormat.File : MessageFormat.Text;
      sendMessage({ orderId, contractorId, text: message, format, file, replyToMessage })
      .catch(() => {});
    }
    for (const file of files) {
      sendMessage({ orderId, contractorId, file, format: MessageFormat.File })
      .catch(() => {});
    }
    setReplyTo(undefined);
  }, [sendMessage]);

  const handleUpdateMessage = useCallback((
    messageId: number,
    message: string,
  ) => {
    if (messageId) {
      updateMessage({ messageId, text: message })
      .catch((err: any) => {
        console.error('Update message failed:', err);
      });
      setEditMessageID(undefined);
    }
  }, [updateMessage]);

  const handleSendAudio = useCallback((
    orderId: number,
    contractorId: number,
    audio: File,
    replyToMessage?: number,
  ) => {
    if (audio) {
      sendMessage({
        orderId,
        contractorId,
        format: MessageFormat.Audio,
        audio,
        replyToMessage
      })
      .catch(() => {});
      setReplyTo(undefined);
    }
  }, [sendMessage]);

  const handleReplyTo = (id: number) => {
    if (!isBlacklisted) setReplyTo(id);
  };

  const handleEditMessage = (id: number) => {
    if (!isBlacklisted) setEditMessageID(id);
  };

  const cancelEditMessage = () => {
    setEditMessageID(undefined);
  };

  const handleDeleteMessage = async (id: number) => {
    if (isBlacklisted) return;
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
      {blockUserId && isBlockUserVisible &&
        <BlockUserModal
          currentUser={user}
          targetUserId={blockUserId}
          setModalVisible={setIsBlockUserVisible}
          onUserBlocked={handleBlockUser}
        />
      }
      {isBlackListVisible &&
        <BlackListModal
          currentUser={user}
          onUnblock={handleUnblockUser}
          setModalVisible={setIsBlackListVisible}
        />
      }

      {isVisibleDisputeModal && disputeOrderId && (
        <DisputeModal
          id={disputeOrderId}
          onDisputeOpen={handleDisputeOpen}
          setVisibleDispute={setIsVisibleDisputeModal}
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
                chatPartner={chatPartner}
                isBlacklisted={isBlacklisted}
                onSetChatRead={handleReadChat}
                onCloseChat={handleCloseChat}
                onBlockUser={handleBlockUserClick}
                onBlackList={handleBlackListOpen}
                onCancelOrder={handleCancelOrder}
                onRequestCancelOrder={handleRequestCancelOrder}
                onRevokeCancelOrder={handleRevokeCancelOrder}
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
                isBlacklisted={isBlacklisted}
                onReply={handleReplyTo}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
              />
              <ChatInput
                orderId={orderId}
                clientId={currentOrder.clientId}
                contractorId={contractorId}
                currentUser={user}
                isBlacklisted={isBlacklisted}
                onSendMessage={handleSendMessage}
                onSendAudio={handleSendAudio}
                onUpdateMessage={handleUpdateMessage}
                isBusy={isSendingMessage || isUpdatingMessage || isDeletingMessage}
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
