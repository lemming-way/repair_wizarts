import type { FC } from 'react';
import React from 'react';
import Dropdown from 'react-multilevel-dropdown';

import { useLanguage } from 'app/state/language';
import { Order, OrderStatus, orderStatusString } from 'app/state/order';
import { UserProfile, UserRole } from 'app/state/user';

import styles from './OrderChatControl.module.css';
import chatStyles from './Chat.module.css';

interface OrderChatControlProps {
  order: Order;
  chatContractorId: number;
  currentUser: UserProfile;
  onCloseChat: (orderId: number, contractorId: number) => Promise<void>;
  // Колбэки для мутаций (или заглушек действий)
  onCancelOrder: (order: Order, reason: string) => Promise<void>;
  onStartWork: (orderId: number) => Promise<void>;
  onCompleteWork: (orderId: number) => Promise<void>;
  onVerifyCompletion: (orderId: number) => Promise<void>;
  onShowDisputeModal: (orderId: number) => void;
}

export const OrderChatControl: FC<OrderChatControlProps> = ({
  order,
  chatContractorId,
  currentUser,
  onCloseChat,
  onCancelOrder,
  onStartWork,
  onCompleteWork,
  onVerifyCompletion,
  onShowDisputeModal,
}) => {
  const text = useLanguage();

  const isClient = currentUser.role === UserRole.Client;
  const isContractor = currentUser.role === UserRole.Contractor;
  const effectiveOrderStatus =
    order.status === OrderStatus.PUBLISHED || chatContractorId === order.contractorId
    ? order.status
    : OrderStatus.CANCELLED;

  const orderDescription = order.description.length > 100
    ? order.description.slice(0, 100) + '...'
    : order.description;

  const handleCancelClick = async () => {
    const reason = prompt(text('Please enter the reason for cancellation:'));
    if (reason) {
      await onCancelOrder(order, reason);
    }
  };

  const handleStartWorkClick = async () => {
    await onStartWork(order.id);
  };

  const handleCompleteWorkClick = async () => {
    await onCompleteWork(order.id);
  };

  const handleVerifyCompletionClick = async () => {
    await onVerifyCompletion(order.id);
  };

  const handleOpenDisputeClick = async () => {
    onShowDisputeModal(order.id);
  };

  // Рендеринг кнопок в зависимости от статуса заказа и роли пользователя
  const renderActionButtons = () => {
    switch (effectiveOrderStatus) {
      case OrderStatus.APPOINTED:
        if (isClient) {
          return (
            <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleCancelClick}>
              {text('Cancel Order')}
            </button>
          );
        } else if (isContractor) {
          return (
            <>
              <button className={chatStyles.orderButton} onClick={handleStartWorkClick}>
                {text('Start Work')}
              </button>
              <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleCancelClick}>
                {text('Cancel Order')}
              </button>
            </>
          );
        }
        break;
      case OrderStatus.IN_PROGRESS:
        if (isClient) {
          return (
            <>
              <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleCancelClick}>
                {text('Request Order Cancellation')}
              </button>
              <button className={`${chatStyles.orderButton} ${styles.disputeButton}`} onClick={handleOpenDisputeClick}>
                {text('Open Dispute')}
              </button>
            </>
          );
        } else if (isContractor) {
          return (
            <>
              <button className={chatStyles.orderButton} onClick={handleCompleteWorkClick}>
                {text('Complete Work')}
              </button>
              <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleCancelClick}>
                {text('Request Order Cancellation')}
              </button>
              <button className={`${chatStyles.orderButton} ${styles.disputeButton}`} onClick={handleOpenDisputeClick}>
                {text('Open Dispute')}
              </button>
            </>
          );
        }
        break;
      case OrderStatus.COMPLETED:
        if (isClient) {
          return (
            <>
              <button className={chatStyles.orderButton} onClick={handleVerifyCompletionClick}>
                {text('Confirm Work Completion')}
              </button>
              <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleCancelClick}>
                {text('Request Order Cancellation')}
              </button>
              <button className={`${chatStyles.orderButton} ${styles.disputeButton}`} onClick={handleOpenDisputeClick}>
                {text('Open Dispute')}
              </button>
            </>
          );
        } else if (isContractor) {
          return (
            <>
              <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleCancelClick}>
                {text('Request Order Cancellation')}
              </button>
              <button className={`${chatStyles.orderButton} ${styles.disputeButton}`} onClick={handleOpenDisputeClick}>
                {text('Open Dispute')}
              </button>
            </>
          );
        }
        break;
      case OrderStatus.CLOSED:
      case OrderStatus.CANCELLED:
        return null; // Нет кнопок для завершённых или отменённых заказов
      case OrderStatus.DISPUTE:
        return (
          <button className={`${chatStyles.orderButton} ${styles.disputeButton}`} onClick={handleOpenDisputeClick}>
            {text('View Dispute')}
          </button>
        );
      case OrderStatus.AWAITING_PAYMENT:
      case OrderStatus.PAID:
        // Эти статусы обычно управляются другими частями UI (предложениями и т.д.)
        return null;
      default:
        return null;
    }
    return null;
  };

  return (
    <div className={styles.order_control_block}>
      <div className={styles.order_info}>
        <p className={styles.order_title}>
          {text('Order')} №{order.id}: {orderDescription}
        </p>
        <p className={styles.order_status_text}>
          {text('Status')}: {text(orderStatusString[effectiveOrderStatus])}
        </p>
        {order.agreedPrice && (
          <p className={styles.order_price}>
            {text('Agreed Price')}: {order.agreedPrice} ₽
          </p>
        )}
      </div>
      <div className={styles.action_buttons}>
        {renderActionButtons()}
      </div>
      <Dropdown
        title={
          <>
            <div className={styles.button_dotted}>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </>
        }
        buttonClassName={styles.dropdown_button}
        menuClassName={styles.dropdown_menu}
      >
          <Dropdown.Item
            className={styles.dropdown_item}
            onClick={() => onCloseChat(order.id, chatContractorId)}
          >
            <img src="/img/icons/trash.png" alt="" />
            {text('Close chat')}
          </Dropdown.Item>
      </Dropdown>
    </div>
  );
};
