import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from "react-router-dom"
import Dropdown from 'react-multilevel-dropdown';

import { useLanguage } from 'app/state/language';
import { Order, OrderStatus, orderStatusString } from 'app/state/order';
import { UserProfile, UserRole } from 'app/state/user';
import { Modal } from 'app/shared/ui';
import { OrderCard } from 'app/shared/ui/OrderCard';

import styles from './OrderChatControl.module.css';
import chatStyles from './Chat.module.css';

interface OrderChatControlProps {
  order: Order;
  chatContractorId: number;
  isChatUnread: boolean;
  currentUser: UserProfile;
  onSetChatRead: (orderId: number, contractorId: number) => Promise<void>;
  onCloseChat: (orderId: number, contractorId: number) => Promise<void>;
  // Колбэки для мутаций
  onCancelOrder: (order: Order, reason: string) => Promise<void>;
  onRequestCancelOrder: (order: Order) => Promise<void>;
  onRevokeCancelOrder: (order: Order) => Promise<void>;
  onAcceptOffer: (orderId: number, contractorId: number) => Promise<void>;
  onAcceptInvoice: (orderId: number) => Promise<void>;
  onRejectInvoice: (orderId: number, reason: string) => Promise<void>;
  onStartWork: (orderId: number) => Promise<void>;
  onCompleteWork: (orderId: number) => Promise<void>;
  onVerifyCompletion: (orderId: number) => Promise<void>;
  onShowDisputeModal: (orderId: number) => void;
}

export const OrderChatControl: FC<OrderChatControlProps> = ({
  order,
  chatContractorId,
  isChatUnread,
  currentUser,
  onSetChatRead,
  onCloseChat,
  onCancelOrder,
  onRequestCancelOrder,
  onRevokeCancelOrder,
  onAcceptOffer,
  onAcceptInvoice,
  onRejectInvoice,
  onStartWork,
  onCompleteWork,
  onVerifyCompletion,
  onShowDisputeModal,
}) => {
  const navigate = useNavigate();
  const text = useLanguage();
  const [visibleOrderCard, setVisibleOrderCard] = useState(false);

  const isClient = currentUser.role === UserRole.Client;
  const isContractor = currentUser.role === UserRole.Contractor;
  const effectiveOrderStatus =
    order.status === OrderStatus.PUBLISHED || chatContractorId === order.contractorId
    ? order.status
    : OrderStatus.CANCELED;

  const orderDescription = order.description.length > 100
    ? order.description.slice(0, 100) + '...'
    : order.description;

  const handleCreateOffer = () => {
    navigate(`/contractor/requests/offer/${order.id}`);
  }

  const handleCancelClick = () => {
    const reason = prompt(text('Please enter the reason for cancellation:'));
    if (reason) {
      onCancelOrder(order, reason);
    }
  };

  const handleRequestCancel = () => {
    onRequestCancelOrder(order);
  };

  const handleRevokeCancel = () => {
    onRevokeCancelOrder(order);
  };

  const handleAcceptOffer = () => {
    onAcceptOffer(order.id, chatContractorId);
  };

  const handleAcceptInvoice = () => {
    onAcceptInvoice(order.id);
  };

  const handleRejectInvoice = () => {
    onRejectInvoice(order.id, '');  // todo: Добавить ввод причины отказа
  };

  const handleStartWorkClick = () => {
    onStartWork(order.id);
  };

  const handleCompleteWorkClick = () => {
    onCompleteWork(order.id);
  };

  const handleVerifyCompletionClick = () => {
    onVerifyCompletion(order.id);
  };

  const handleOpenDisputeClick = () => {
    onShowDisputeModal(order.id);
  };

  // Рендеринг кнопок в зависимости от статуса заказа и роли пользователя
  const renderActionButtons = () => {
    switch (effectiveOrderStatus) {
      case OrderStatus.PUBLISHED:
        if (isClient) {
          return (
            <>
              {order.contractorOffers.some(offer => offer.contractorId === chatContractorId) &&
                <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleAcceptOffer}>
                  {text('Select contractor')}
                </button>
              }
              <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleCancelClick}>
                {text('Cancel Order')}
              </button>
            </>
          );
        }
        else if (isContractor && !order.contractorOffers.some(offer => offer.contractorId === currentUser.id)) {
          return (
            <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleCreateOffer}>
              {text('Offer a service')}
            </button>
          );
        }
        break;
      case OrderStatus.REQUESTED:
        if (isClient) {
          return (
            <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleCancelClick}>
              {text('Cancel Order')}
            </button>
          );
        }
        else if (isContractor) {
          return (
            <>
              <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleAcceptInvoice}>
                {text('Accept invoice')}
              </button>
              <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleRejectInvoice}>
                {text('Reject invoice')}
              </button>
            </>
          );
        }
        break;
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
              {!order.wantCancel &&
                <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleRequestCancel}>
                  {text('Request Order Cancellation')}
                </button>
              }
              {order.wantCancel === 'client' &&
                <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleRevokeCancel}>
                  {text('Revoke Order Cancellation Request')}
                </button>
              }
              {order.wantCancel === 'contractor' &&
                <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleCancelClick}>
                  {text('Confirm Order Cancellation')}
                </button>
              }
              <button className={`${chatStyles.orderButton} ${styles.disputeButton}`} onClick={handleOpenDisputeClick}>
                {text('Open Dispute')}
              </button>
            </>
          );
        } else if (isContractor) {
          return (
            <>
              {!order.wantCancel &&
                <>
                  <button className={chatStyles.orderButton} onClick={handleCompleteWorkClick}>
                    {text('Complete Work')}
                  </button>
                  <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleRequestCancel}>
                    {text('Request Order Cancellation')}
                  </button>
                </>
              }
              {order.wantCancel === 'contractor' &&
                <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleRevokeCancel}>
                  {text('Revoke Order Cancellation Request')}
                </button>
              }
              {order.wantCancel === 'client' &&
                <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleCancelClick}>
                  {text('Confirm Order Cancellation')}
                </button>
              }
              <button className={`${chatStyles.orderButton} ${styles.disputeButton}`} onClick={handleOpenDisputeClick}>
                {text('Open Dispute')}
              </button>
            </>
          );
        }
        break;
      case OrderStatus.FINISHED:
        if (isClient) {
          return (
            <>
              {!order.wantCancel &&
                <>
                  <button className={chatStyles.orderButton} onClick={handleVerifyCompletionClick}>
                    {text('Confirm Work Completion')}
                  </button>
                  <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleRequestCancel}>
                    {text('Request Order Cancellation')}
                  </button>
                </>
              }
              {order.wantCancel === 'client' &&
                <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleRevokeCancel}>
                  {text('Revoke Order Cancellation Request')}
                </button>
              }
              {order.wantCancel === 'contractor' &&
                <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleCancelClick}>
                  {text('Confirm Order Cancellation')}
                </button>
              }
              <button className={`${chatStyles.orderButton} ${styles.disputeButton}`} onClick={handleOpenDisputeClick}>
                {text('Open Dispute')}
              </button>
            </>
          );
        } else if (isContractor) {
          return (
            <>
              {order.wantCancel === 'client' &&
                <button className={`${chatStyles.orderButton} ${styles.cancelButton}`} onClick={handleCancelClick}>
                  {text('Confirm Order Cancellation')}
                </button>
              }
              <button className={`${chatStyles.orderButton} ${styles.disputeButton}`} onClick={handleOpenDisputeClick}>
                {text('Open Dispute')}
              </button>
            </>
          );
        }
        break;
      case OrderStatus.CLOSED:
      case OrderStatus.CANCELED:
      case OrderStatus.DISPUTE:
        return null; // Нет кнопок для завершённых или отменённых заказов
      //~ case OrderStatus.DISPUTE:
        //~ return (
          //~ <button className={`${chatStyles.orderButton} ${styles.disputeButton}`} onClick={handleOpenDisputeClick}>
            //~ {text('View Dispute')}
          //~ </button>
        //~ );
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
      <Modal open={!!order && visibleOrderCard} onClose={()=>setVisibleOrderCard(false)} closeButton={true} size="xs" className={styles.info_modals}>
        <OrderCard order={order} />
      </Modal>
      <div className={styles.order_info}>
        <p className={styles.order_title} onClick={() => setVisibleOrderCard(true)}>
          {text('Order No.')} {order.id}: {orderDescription}
        </p>
        <p className={styles.order_status_text}>
          <span>{text('Status')}: {text(orderStatusString[effectiveOrderStatus] || 'Unknown status')}</span>
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
      {isChatUnread ?
        <Dropdown.Item
          className={styles.dropdown_item}
          onClick={() => onSetChatRead(order.id, chatContractorId)}
        >
          <img src="/img/icons/ok.png" alt="" />
          {text('Mark all read')}
        </Dropdown.Item>
        :
        <Dropdown.Item
          className={styles.dropdown_item}
          onClick={() => onCloseChat(order.id, chatContractorId)}
        >
          <img src="/img/icons/trash.png" alt="" />
          {text('Close chat')}
        </Dropdown.Item>
      }
      </Dropdown>
    </div>
  );
};
