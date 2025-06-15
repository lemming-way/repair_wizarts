import {
  useEffect,
  useRef,
  useState,
  useMemo,
  FC,
  Dispatch,
  SetStateAction,
} from 'react';
import '../../../scss/chat.css';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../slices/user.slice';
import { getAllClientRequests } from '../../../services/request.service';
import { useService } from '../../../hooks/useService';
import { selectUI } from '../../../slices/ui.slice';
import { getMasterOrders } from '../../../services/order.service';
import styles from './Chat.module.css';
import Dropdown from 'react-multilevel-dropdown';
import MiniSlider from '../../miniSlider/MiniSilder';
import BlackListModal from './BlackListModal';
import BlockUser from './BlockUser';
import DeleteChatModal from './DeleteChatModal';
import OkModal from './OkModal';
import AddOrderModal from './AddOrderModal';
import AddFeedbackModal from './AddFeedbackModal';
import FinalOrder from './FinalOrder';
import DisputeModal from './DisputeModal';
import DisputeFinalModal from './DisputeFinalModal';
import ConfirmOrder from './ConfirmOrder';
import ConfirmOrderFinal from './ConfirmOrderFinal';

import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import ModalАrbitration from './ModalАrbitration';
import CancelOrder from './CancelOrder';
import OnlineDotted from '../../onlineDotted/OnlineDotted';
import ConfirmOrderV2 from './ConfirmOrder_v2';
import ConfirmOrderFinalV2 from './ConfirmOrderFinal_v2';
import ConfirmOrderV3 from './ConfirmOrder_v3';
import ConfirmOrderFinalV3 from './ConfirmOrderFinal_v3';
import DisputeModalV2 from './DisputeModal_v2';
import DisputeFinalModalV2 from './DisputeFinalModal';
import CancelOrderV4 from './CancelOrder_v4';
import CancelOrderItemV4 from './CancelOrderItem_v4';
import ModalАrbitrationItem from './ModalАrbitrationItem';
import DisputeFinalModalV5 from './DisputeFinalModal_v5';
import DisputeFinalItemModalV5 from './DisputeFinalItemModal_v5';
import SimpleImage from './SimpleImage';
import { updateUser } from '../../../services/user.service';
import appFetch from '../../../utilities/appFetch';
import { updateRequest } from '../../../services/request.service';
import FrameMessages from './frameMessages';
import MediaQuery from 'react-responsive';

interface MasterInfo {
  u_photo?: string;
  u_name?: string;
}

interface GroupedChat {
  chatId: string;
  masterInfo: MasterInfo;
  orders: any[];
}

interface OrderDetailsBlockProps {
  order: any;
  setOrderId: Dispatch<SetStateAction<number>>;
  setIsOpenDisput: Dispatch<SetStateAction<boolean>>;
  currentUser: any;
  masterUser: any;
  setIsBalanceError: Dispatch<SetStateAction<boolean>>;
  setBalanceErrorNum: Dispatch<SetStateAction<number>>;
  refetchRequests: () => void; // Используем refetch
}

const OrderDetailsBlock: FC<OrderDetailsBlockProps> = ({
  order,
  currentUser,
  masterUser,
  refetchRequests,
  setOrderId,
  setIsOpenDisput,
  setIsBalanceError,
  setBalanceErrorNum,
}) => {
  const user =
    (Object.values(useSelector(selectUser)?.data?.user || {})[0] as any) ||
    ({} as any);
  // Локальное состояние для каждого блока заказа
  const [isOpenZayavka, setOpenZayavka] = useState(false);
  const [isShowDetailsOrder, setShowDetailsOrder] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Состояния для управления UI конкретного заказа
  const [dispute__isVisibleModal, dispute__SetVisibleModal] = useState(false);
  const [isVisibleAddFeedback, setVisibleAddFeedback] = useState(false);
  const [isVisibleDispute, setVisibleDispute] = useState(false);

  // Add balance check
  useEffect(() => {
    const masterReqData =
      order.drivers?.find((d: any) => d.u_id === order.b_options.winnerMaster)
        ?.c_options || {};

    if (masterReqData?.bind_amount > user?.u_details?.balance) {
      setIsBalanceError(true);
      setBalanceErrorNum(
        Number(masterReqData.bind_amount) -
          Number(user?.u_details?.balance || 0),
      );
    } else {
      setIsBalanceError(false);
      setBalanceErrorNum(0);
    }
  }, [order, user?.u_details?.balance]);
  // --- НАЧАЛО: Логика для кнопок подтверждения и отмены ---
  const handleConfirmOrder = async () => {
    const masterReqData =
      order.drivers?.find((d: any) => d.u_id === order.b_options.winnerMaster)
        ?.c_options || {};

    // Calculate total amount with 9% commission
    const commission = Number(masterReqData.bind_amount) * 0.09;
    const totalAmount = Number(masterReqData.bind_amount) + commission;

    if (totalAmount > Number(user?.u_details?.balance || 0)) {
      console.log(masterUser);
      setIsBalanceError(true);
      setBalanceErrorNum(totalAmount - Number(user?.u_details?.balance || 0));
      return;
    }

    setIsLoading(true);
    try {
      await appFetch(`/drive/get/${order.b_id}`, {
        body: {
          u_a_role: 1,
          u_id: masterUser.u_id,
          action: 'set_performer',
        },
      });

      // Шаг 2: Завершаем заказ
      await appFetch(`/drive/get/${order.b_id}`, {
        body: {
          u_a_role: 1,
          action: 'set_complete_state',
        },
      }).then((v) => console.log(v));

      // Update master's balance (full amount)
      updateUser(
        {
          details: {
            balance:
              Number(masterReqData.bind_amount) +
              Number(masterUser.u_details.balance),
          },
        },
        masterUser.u_id,
        true,
      );

      // Update client's balance (amount + commission)
      updateUser(
        {
          details: {
            balance: Number(user.u_details?.balance || 0) - totalAmount,
          },
        },
        user.u_id,
        true,
      );

      console.log(`Заказ ${order.b_id} успешно подтвержден и завершен.`);
      refetchRequests(); // Обновляем список заказов
    } catch (error) {
      console.error('Ошибка при подтверждении заказа:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    setIsLoading(true);
    try {
      // Обновляем b_options, добавляя флаг отмены
      await updateRequest(order.b_id, {
        is_request_for_cancel_exist: true,
      });
      console.log(`Запрос на отмену заказа ${order.b_id} отправлен.`);
      refetchRequests(); // Обновляем список
    } catch (error) {
      console.error('Ошибка при отмене заказа:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleOpenDispute = () => {
    setOrderId(order.b_id);
    setIsOpenDisput(true);
  };
  // --- КОНЕЦ: Логика для кнопок ---

  function formatTimeByHours(hours: number) {
    if (Number.isNaN(hours)) return 'Готов ждать';
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const lastDigit = days % 10;
      const lastTwo = days % 100;
      let word = 'дней';
      if (lastTwo < 11 || lastTwo > 14) {
        if (lastDigit === 1) word = 'день';
        else if (lastDigit >= 2 && lastDigit <= 4) word = 'дня';
      }
      return `${days} ${word}`;
    } else {
      const lastDigit = hours % 10;
      const lastTwo = hours % 100;
      let word = 'часов';
      if (lastTwo < 11 || lastTwo > 14) {
        if (lastDigit === 1) word = 'час';
        else if (lastDigit >= 2 && lastDigit <= 4) word = 'часа';
      }
      return `${hours} ${word}`;
    }
  }

  const driverData = order.drivers?.find(
    (d: any) => d.u_id === order.b_options.winnerMaster,
  );
  const masterReqData = driverData?.c_options || {};
  const isOrderCompleted = order.b_state === '4';
  const isCancelRequested =
    !!order.b_options?.is_request_for_cancel_exist || order.b_state == '3';
  const isOwner = order.u_id === user?.u_id;
  const isMasterAgreeWithCancelRequest =
    order.b_options.is_master_agree_with_cancel || order.b_state == '3';
  const isOpenDispute = order.b_options.is_open_dispute;
  const isMasterAgreeWithDispute = order.b_options.is_master_agree_with_dispute;
  return (
    <>
      {isVisibleAddFeedback && (
        <AddFeedbackModal
          id={order.b_id}
          setVisibleAddFeedback={setVisibleAddFeedback}
          setVisibleFinalOrder={() => {}}
        />
      )}

      {/* Полный JSX блока заказа */}
      <div className="chat_technical_message">
        <div className={`${styles.message_block} ${styles.text_right}`}>
          <div className="my_chat">
            <div
              className="correspondence-active font_inter df"
              style={{ gap: '10px' }}
            >
              <div className="ciril-img" style={{ opacity: 0 }}>
                <img
                  src="/img/chat_img/2.png"
                  style={{ width: '58px', height: '58px' }}
                  alt="img absent"
                />
              </div>
              <div className="let">
                <div
                  className="letter_kiril df"
                  style={{ gap: '10px', justifyContent: 'flex-end' }}
                >
                  <div className="letter_text-2">
                    <h3>13:44</h3>
                  </div>
                  <div className="letter_text-1">
                    <h2>Вы</h2>
                  </div>
                  <img
                    src={currentUser.u_photo || '/img/img-camera.png'}
                    style={{ width: '58px', height: '58px', borderRadius: 30 }}
                    alt="img absent"
                  />
                </div>
                <div className={styles.block_bid}>
                  <p>
                    {order.b_options.orderType === 'request'
                      ? 'Выбранная модель устройства'
                      : 'Размещен на биржи заказ'}{' '}
                    <Link
                      to={'/master/requests'}
                      className={styles.block_bid__link}
                    >
                      {order?.b_options?.title}
                    </Link>
                  </p>
                  {order.b_options.orderType === 'request' && (
                    <p>
                      Перечень работ:
                      <span>{order?.b_options?.title}</span>
                    </p>
                  )}
                  <p>Описание клиента {order?.b_options?.description}</p>
                  <p>
                    Мастер откликнулся на этот заказ, сделав предложение на
                    сумму {masterReqData?.bind_amount} рублей.
                  </p>
                  <p>
                    Слова мастера из{' '}
                    {order.b_options.orderType === 'request'
                      ? 'заявки'
                      : 'заказа на бирже!'}{' '}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="chat_technical_message">
        <div className={`${styles.message_block} ${styles.text_left}`}>
          <div
            className={`correspondence df font_inter`}
            style={{ flexDirection: 'column', gap: '10px' }}
          >
            <div className="correspondence_ciril df_chat">
              <div className="ciril-img">
                <img
                  style={{ width: 58, height: 58, borderRadius: 30 }}
                  src={masterUser.u_photo || '/img/img-camera.png'}
                  alt="img absent"
                />
              </div>
              <div className="let">
                <div className="letter_kiril df" style={{ gap: '10px' }}>
                  <div className="letter_text-1">
                    <h2>{masterUser.u_name}</h2>
                  </div>
                  <div className="letter_text-2">
                    <h3>13:44</h3>
                  </div>
                  <div className="right_menu-img df align mini-gap">
                    <img
                      className="ansver"
                      src="/img/chat_img/ответ.png"
                      alt="img absent"
                    />
                    <img src="/img/chat_img/span.png" alt="img absent" />
                  </div>
                </div>
                <div
                  className={`${styles.individual_order} ${styles.individual_order2}`}
                >
                  <div className={styles.individual_order__heading}>
                    <img src="/img/icons/cil_basket.png" alt="" />
                    <p>
                      Индивидуальное предложение{' '}
                      {order.b_options.orderType === 'request'
                        ? 'заявки'
                        : 'заказа'}
                    </p>
                  </div>
                  <div className={styles.individual_order__block}>
                    <details className={styles.individual_order__details}>
                      <summary className={styles.individual_order__order}>
                        <p style={{ position: 'relative' }}>
                          {order.b_options.title}
                          <div
                            className={`miniSwiperWrap miniswiperslideInfo ${styles.miniswiperslideInfo} ${styles.miniSwiperWrap}`}
                          >
                            <MiniSlider />
                          </div>
                        </p>
                        <div className={styles.individual_order__arrow}>
                          <img src="/img/bot.png" alt="" />
                        </div>
                        <div style={{ flex: 1 }}></div>
                        <p className={styles.modile_hidden}>
                          {' '}
                          {formatTimeByHours(Number(masterReqData.time))}
                        </p>
                        <p className={styles.modile_hidden}>
                          {masterReqData.bind_amount}
                        </p>
                      </summary>
                      <div className={styles.individual_order__more}>
                        <p>
                          условия{' '}
                          {order.b_options.orderType === 'request'
                            ? 'заявки'
                            : 'заказа'}
                        </p>
                        <p>{order.b_options.description} </p>
                      </div>
                    </details>
                  </div>
                  <div className={styles.individual_order__final}>
                    <p>Итого:</p>
                    <p> {formatTimeByHours(Number(masterReqData.time))}</p>
                    <p>{masterReqData.bind_amount} ₽</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.create_order}>
              <img src="/img/icons/box.png" alt="" />
              <div>
                <p>
                  {order.b_options.orderType === 'request' ? 'заявка' : 'заказ'}{' '}
                  создан
                </p>
                <p>
                  Номер{' '}
                  {order.b_options.orderType === 'request'
                    ? 'заявки'
                    : 'заказа'}{' '}
                  <a
                    className={styles.create_order__link}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setOpenZayavka((prev) => !prev);
                    }}
                  >
                    №{order.b_id}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isOpenZayavka && (
        <div className="chat_technical_message">
          <div className={`${styles.message_block} ${styles.text_left}`}>
            <div
              className={`correspondence df font_inter ${styles.create_order__message}`}
            >
              <div className="correspondence_ciril df_chat">
                <div className="ciril-img">
                  <img
                    style={{ width: '58px', height: '58px', borderRadius: 30 }}
                    src={masterUser.u_photo || '/img/img-camera.png'}
                    alt="img absent"
                  />
                </div>
                <div className="let">
                  <div className="letter_kiril df" style={{ gap: '10px' }}>
                    <div className="letter_text-1">
                      <h2>{masterUser.u_name}</h2>
                    </div>
                    <div className="letter_text-2">
                      <h3>13:44</h3>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.create_order__heading}>
                <p>Услуги</p>
                <div style={{ flex: 1 }}></div>
                <p>Кол-во</p>
                <p>Срок</p>
                <p>Стоимость</p>
              </div>
              <div className={styles.create_order__data}>
                <div style={{ position: 'relative' }}>
                  <p style={{ position: 'relative' }}>
                    {order.b_options.title}
                  </p>
                  {!isShowDetailsOrder ? (
                    <img
                      onClick={() => setShowDetailsOrder(true)}
                      style={{ marginLeft: '10px', cursor: 'pointer' }}
                      src="/img/bot.png"
                      alt=""
                    />
                  ) : null}
                </div>
                <div style={{ flex: 1 }}></div>
                <p>1</p>
                <p style={{ whiteSpace: 'nowrap' }}>
                  {' '}
                  {formatTimeByHours(Number(masterReqData.time))}
                </p>
                <p className={styles.create_order__price}>
                  {masterReqData.bind_amount} ₽
                </p>
              </div>
              {isShowDetailsOrder && (
                <div className={styles.create_order__dataVisible}>
                  <p>
                    Условия{' '}
                    {order.b_options.orderType === 'request'
                      ? 'заявки'
                      : 'заказа'}{' '}
                    {order?.b_options?.description}
                  </p>
                  <p>
                    Свернуть
                    <img
                      style={{
                        marginLeft: '10px',
                        cursor: 'pointer',
                        rotate: '180deg',
                      }}
                      onClick={() => setShowDetailsOrder(false)}
                      src="/img/bot.png"
                      alt=""
                    />
                  </p>
                  <div className={styles.create_order__line} />
                  <div className={styles.create_order__final}>
                    <p>Итого:</p>
                    <p> {formatTimeByHours(Number(masterReqData.time))}</p>
                    <p className={styles.create_order__price}>
                      {masterReqData.bind_amount} ₽
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {!isOrderCompleted && !isCancelRequested && !isOpenDispute && (
        <div className="chat_technical_message">
          <div className={styles.confirm_block}>
            <button onClick={handleConfirmOrder} disabled={isLoading}>
              {isLoading
                ? 'Обработка...'
                : `Подтвердить ${
                    order.b_options.orderType === 'request' ? 'заявку' : 'заказ'
                  }`}
            </button>
            <button
              onClick={
                order.b_options.payType !== 'cash'
                  ? handleOpenDispute
                  : handleCancelOrder
              }
              disabled={isLoading}
            >
              {order.b_options.payType === 'cash' ? (
                <>
                  {isLoading
                    ? 'Обработка...'
                    : `Отменить ${
                        order.b_options.orderType === 'request'
                          ? 'заявку'
                          : 'заказ'
                      }`}
                </>
              ) : (
                'Открыть спор'
              )}
            </button>
          </div>
        </div>
      )}
      {isOrderCompleted && (
        <div className="chat_technical_message">
          <div>
            <div className={`${styles.cancel_block}`}>
              <img src="/img/message_green.png" alt="" />
              <p>
                {order.b_options.orderType === 'request' ? 'заявка' : 'заказ'}{' '}
                успешно подтвержден
              </p>
              <span>14:12</span>
            </div>
            <div className={styles.add_feedback}>
              <button onClick={() => setVisibleAddFeedback(true)}>
                Оставить отзыв
              </button>
            </div>
          </div>
        </div>
      )}
      {isCancelRequested &&
        !isOrderCompleted &&
        isOpenDispute &&
        (isOwner ? (
          <div className="chat_technical_message">
            <div className={styles.cancel_block}>
              <img src="/img/cansel_message.png" alt="" />
              <p>
                Вы предложили отменить{' '}
                {order.b_options.orderType === 'request' ? 'заявку' : 'заказ'}
              </p>
              <span>14:12</span>
            </div>
          </div>
        ) : (
          <div className="chat_technical_message">
            <div
              className={`${styles.message_block} ${styles.text_center} ${styles.text_center_col}`}
            >
              <div className={styles.cancel_client_block}>
                <img src="/img/cansel_message.png" alt="" />
                <div>
                  <p>В работе 17:08</p>
                  <p>
                    Клиент предлагает отменить{' '}
                    {order.b_options.orderType === 'request'
                      ? 'заявку'
                      : 'заказ'}
                  </p>
                </div>
              </div>
              {typeof isMasterAgreeWithCancelRequest === 'boolean' &&
              !isMasterAgreeWithCancelRequest ? (
                <div className={styles.cancel_client_block}>
                  <img src="/img/message_cancel.png" alt="" />
                  <div>
                    <p>В работе 17:08</p>
                    <p>
                      Вы отказались принимать отмену{' '}
                      {order.b_options.orderType === 'request'
                        ? 'заявки'
                        : 'заказа'}
                    </p>
                  </div>
                </div>
              ) : typeof isMasterAgreeWithCancelRequest === 'boolean' &&
                isMasterAgreeWithCancelRequest ? (
                <div className={styles.cancel_client_block}>
                  <img src="/img/message_green.png" alt="" />
                  <div>
                    <p>В работе 17:08</p>
                    <p>
                      Вы приняли отмену{' '}
                      {order.b_options.orderType === 'request'
                        ? 'заявки'
                        : 'заказа'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className={styles.cancel_client_confirm}>
                  <button
                    onClick={async () => {
                      await updateRequest(
                        order.b_id,
                        {
                          is_master_agree_with_cancel: true,
                        },
                        true,
                        order.u_id,
                      );
                      refetchRequests();
                    }}
                  >
                    Подтвердить отмену{' '}
                    {order.b_options.orderType === 'request'
                      ? 'заявки'
                      : 'заказа'}
                  </button>
                  <button
                    onClick={async () => {
                      await updateRequest(
                        order.b_id,
                        {
                          is_master_agree_with_cancel: false,
                        },
                        true,
                        order.u_id,
                      );
                      refetchRequests();
                    }}
                  >
                    Нет
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      {isMasterAgreeWithCancelRequest && isOwner && (
        <div className="chat_technical_message">
          <div className={`${styles.message_block} ${styles.text_center}`}>
            <div className={styles.cancel_block}>
              <img src="/img/message_green.png" alt="" />
              <p>
                Исполнитель согласился на отмену{' '}
                {order.b_options.orderType === 'request' ? 'заявки' : 'заказа'}{' '}
                5:42
              </p>
            </div>
            <div className={styles.add_feedback} style={{ maxWidth: '750px' }}>
              <button onClick={() => setVisibleAddFeedback(true)}>
                Оставить отзыв
              </button>
            </div>
          </div>
        </div>
      )}
      {isOpenDispute &&
        (isOwner ? (
          <div className="chat_technical_message">
            <div>
              <div className={`${styles.message_block} ${styles.text_center}`}>
                <div className={`${styles.cancel_block}`}>
                  <img src="/img/message_cancel.png" alt="" />
                  <p>
                    Открылся спор по{' '}
                    {order.b_options.orderType === 'request'
                      ? 'данной заявки'
                      : 'данному заказу'}{' '}
                    19:08
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="chat_technical_message">
            <div className={styles.dispute_block}>
              <p className={styles.dispute_heading}>Клиент открыл спор</p>
              <div className={styles.dispute_details}>
                <div className={styles.row_title}>
                  <p>
                    {order.b_options.orderType === 'request'
                      ? 'Размещена заявка'
                      : 'Размещен заказ'}{' '}
                  </p>
                  <Link to="#" className={styles.dispute_link}>
                    {order.b_options.title}
                  </Link>
                </div>
                <div className={styles.dispute_description}>
                  <p>{order.b_options.dispute_comment}</p>
                  <div className={`miniSwiperWrap ${styles.miniSwiperWrap}`}>
                    <div className="miniSlider">
                      <SimpleImage />
                    </div>
                  </div>
                </div>
              </div>
              {!(typeof isMasterAgreeWithDispute === 'boolean') && (
                <div className={styles.dispute_row}>
                  <button
                    className={styles.dispute_button}
                    onClick={async () => {
                      await updateRequest(
                        order.b_id,
                        {
                          is_master_agree_with_dispute: true,
                        },
                        true,
                        order.u_id,
                      );
                      refetchRequests();
                    }}
                  >
                    Подтвердить отмену{' '}
                    {order.b_options.orderType === 'request'
                      ? 'заявки'
                      : 'заказа'}
                  </button>
                  <button
                    className={styles.dispute_button}
                    onClick={async () => {
                      await updateRequest(
                        order.b_id,
                        {
                          is_master_agree_with_dispute: false,
                        },
                        true,
                        order.u_id,
                      );
                      refetchRequests();
                    }}
                  >
                    Обратиться в арбитраж
                  </button>
                </div>
              )}
              {!isMasterAgreeWithDispute ? (
                <div className="chat_technical_message">
                  <div
                    className={`${styles.message_block} ${styles.text_center}`}
                  >
                    <div className={styles.cancel_client_block}>
                      <img src="/img/message_cancel.png" alt="" />
                      <div>
                        <p>В работе 17:08</p>
                        <p>
                          Вы отказались от{' '}
                          {order.b_options.orderType === 'request'
                            ? 'заявки'
                            : 'заказа'}
                          !
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="chat_technical_message">
                  <div
                    className={`${styles.message_block} ${styles.text_center}`}
                  >
                    <div className={`${styles.cancel_block}`}>
                      <img src="/img/message_cancel.png" alt="" />
                      <p>
                        Открылся спор по{' '}
                        {order.b_options.orderType === 'request'
                          ? 'данной заявке'
                          : 'данному заказу'}{' '}
                        19:08
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
    </>
  );
};

function ChoiceOfReplenishmentMethodCard() {
  const user =
    (Object.values(useSelector(selectUser)?.data?.user || {})[0] as any) ||
    ({} as any);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [masterUser, setMasterUser] = useState<any>(null);
  const [isVisibleBlackList, setVisibleBlackList] = useState(false);
  const [isVisibleAddOrder, setVisibleAddOrder] = useState(false);
  const [isVisibleEmoji, setVisibleEmoji] = useState(false);
  const [isDeleteBlockChat, setIsDeleteChat] = useState(false);
  const [isBalanceError, setIsBalanceError] = useState(false);
  const [BalanceErrorNum, setBalanceErrorNum] = useState(0);
  const [isOkModal, setVisibleOkModal] = useState(false);
  const [isVisibleBlock, setIsVisibleBlock] = useState(false);
  const [zayavka__isVisibleDispute, zayavka__setVisibleDispute] =
    useState(false);
  const [zayavka__isVisibleDisputeFinal, zayavka__setisVisibleDisputeFinal] =
    useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<number>(0);
  const { id } = useParams<{ id: string }>();
  const ui = useSelector(selectUI);
  const userRequests = useService(
    ui.isMaster ? getMasterOrders : getAllClientRequests,
    [],
  );

  const groupedChats = useMemo(() => {
    const rawRequests =
      userRequests?.data
        ?.map((item: any) => Object.values(item?.data?.booking || {}))
        .flat()
        .filter((request: any) => request?.b_id)
        .sort(
          (a, b) =>
            new Date(a.b_created).getTime() - new Date(b.b_created).getTime(),
        ) || [];
    const filteredRequests = rawRequests.filter(
      (item: any) =>
        item.b_options?.winnerMaster && item.drivers && item.drivers.length > 0,
    );
    const chatsByMaster = filteredRequests.reduce((acc: any, request: any) => {
      const masterId = request.b_options.winnerMaster;
      if (!acc[masterId]) {
        acc[masterId] = [];
      }
      acc[masterId].push(request);
      return acc;
    }, {});

    return Object.values(chatsByMaster).map((orders: any): GroupedChat => {
      const firstOrder = orders[0];
      const winnerDriver = firstOrder.drivers.find(
        (d: any) => d.u_id === firstOrder.b_options.winnerMaster,
      );
      return {
        chatId: `${firstOrder.u_id}_${firstOrder.b_options.winnerMaster}`,
        masterInfo: winnerDriver?.c_options?.author || {},
        orders: orders,
      };
    });
  }, [userRequests.data]);

  const currentChat = useMemo(() => {
    if (!id) return null;
    return groupedChats.find((chat) => chat.chatId === id) || null;
  }, [id, groupedChats]);

  useEffect(() => {
    async function fetchChatParticipants() {
      if (!currentChat) return;
      const client_id = currentChat.chatId.split('_')[0];
      const master_id = currentChat.chatId.split('_')[1];

      appFetch(`user/${client_id}`, {}, true).then((v) =>
        setCurrentUser(Object.values(v.data.user || {})[0] as object),
      );
      appFetch(`user/${master_id}`, {}, true).then((v) =>
        setMasterUser(Object.values(v.data.user || {})[0] as object),
      );
    }
    fetchChatParticipants();
  }, [currentChat]);

  useEffect(() => {
    document.title = 'Чат';
    document.body.style.overflow = 'hidden';
  }, []);

  const [answer, Isanswer] = useState(false);
  const [edit, Isedit] = useState(false);
  const [chooseFile, IschooseFile] = useState(false);
  const [message, setMessage] = useState('');
  function addEmojiToMessage(emoji: EmojiClickData) {
    setMessage((prevMessage) => prevMessage + emoji.emoji);
  }

  function handleInputChat(event: React.ChangeEvent<HTMLInputElement>) {
    setMessage(event.target.value);
  }
  const [isAtBottom, setIsAtBottom] = useState(false);
  const chatBlockRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatBlockRef.current) {
      chatBlockRef.current.scrollTop = chatBlockRef.current.scrollHeight;
    }
  };

  const handleScroll = () => {
    if (chatBlockRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatBlockRef.current;
      const atBottom = scrollHeight - (scrollTop + clientHeight) > 200;
      setIsAtBottom(atBottom);
    }
  };

  useEffect(() => {
    const chatBlock = chatBlockRef.current;
    if (chatBlock) {
      chatBlock.addEventListener('scroll', handleScroll);
      handleScroll();
    }
    return () => {
      if (chatBlock) {
        chatBlock.removeEventListener('scroll', handleScroll);
      }
    };
  }, [id]);

  // Add function to calculate time since last online
  const getTimeSinceLastOnline = (lastTimeBeenOnline: string) => {
    const lastOnline = new Date(lastTimeBeenOnline);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - lastOnline.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return 'только что';
    if (diffInMinutes < 60)
      return `${diffInMinutes} ${getMinutesWord(diffInMinutes)}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${getHoursWord(diffInHours)}`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${getDaysWord(diffInDays)}`;
  };

  const getMinutesWord = (minutes: number) => {
    const lastDigit = minutes % 10;
    const lastTwo = minutes % 100;
    if (lastTwo < 11 || lastTwo > 14) {
      if (lastDigit === 1) return 'минуту';
      if (lastDigit >= 2 && lastDigit <= 4) return 'минуты';
    }
    return 'минут';
  };

  const getHoursWord = (hours: number) => {
    const lastDigit = hours % 10;
    const lastTwo = hours % 100;
    if (lastTwo < 11 || lastTwo > 14) {
      if (lastDigit === 1) return 'час';
      if (lastDigit >= 2 && lastDigit <= 4) return 'часа';
    }
    return 'часов';
  };

  const getDaysWord = (days: number) => {
    const lastDigit = days % 10;
    const lastTwo = days % 100;
    if (lastTwo < 11 || lastTwo > 14) {
      if (lastDigit === 1) return 'день';
      if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
    }
    return 'дней';
  };

  if ((!currentUser || !masterUser) && id) return 'Загрузка...';

  return (
    <>
      {zayavka__isVisibleDispute ? (
        <DisputeModalV2
          refetchRequests={userRequests.refetch}
          id={currentOrderId}
          setVisibleDispute={zayavka__setVisibleDispute}
          setVisibleDisputeFinal={zayavka__setisVisibleDisputeFinal}
        />
      ) : null}
      {zayavka__isVisibleDisputeFinal ? (
        <DisputeFinalModalV2
          setVisibleDisputeFinal={zayavka__setisVisibleDisputeFinal}
        />
      ) : null}
      {isOkModal ? <OkModal setVisibleBlackList={setVisibleOkModal} /> : null}
      {isDeleteBlockChat ? (
        <DeleteChatModal setVisibleBlackList={setIsDeleteChat} />
      ) : null}
      {isVisibleBlock ? (
        <BlockUser setVisibleBlackList={setIsVisibleBlock} />
      ) : null}
      {isVisibleBlackList ? (
        <BlackListModal setVisibleBlackList={setVisibleBlackList} />
      ) : null}
      {isVisibleAddOrder ? (
        <AddOrderModal
          setVisibleAddOrder={setVisibleAddOrder}
          setVisibleOkModal={setVisibleOkModal}
          currentOrder={currentChat?.orders[0] || {}}
        />
      ) : null}

      <section className={styles.container}>
        {id ? (
          <>
            {window.location.href.includes('master') ? (
              <MediaQuery query="(min-device-width: 1615px)">
                <FrameMessages />
              </MediaQuery>
            ) : (
              <MediaQuery query="(min-device-width: 1300px)">
                <FrameMessages />
              </MediaQuery>
            )}
          </>
        ) : (
          <FrameMessages />
        )}

        {id && currentChat ? (
          <div className="profil fchat__profile">
            <div
              className={`kiril_profil kiril_profil_fchat df font_inter ${styles.profile_top_row}`}
              style={{ gap: '10px' }}
            >
              <div
                onClick={scrollToBottom}
                className={`${styles.scroll_to_bottom} ${
                  isAtBottom ? styles.visible : styles.hidden
                }`}
                aria-label="Scroll down"
              >
                <img
                  src="/img/dropdownuser.png"
                  className="dropdownuser_arrow"
                  alt="Scroll Down"
                />
              </div>
              <Link to="/profile-number">
                <div className="kirill df align" style={{ gap: '10px' }}>
                  <div
                    className={`prof_img chatfgetu twerwe ${styles.profile_row}`}
                  >
                    <Link
                      to={
                        window.location.href.includes('master')
                          ? '/master/chat/'
                          : '/client/chat/'
                      }
                      className={`backtoframemessagesLink ${
                        window.location.href.includes('master')
                          ? styles.master__arrow_back
                          : null
                      }`}
                    >
                      <img src="/img/chat_back.png" alt="" />
                    </Link>
                    <div style={{ position: 'relative' }}>
                      <div className={styles.dotted_wrap}>
                        <OnlineDotted
                          isVisible={masterUser?.u_details?.isOnline}
                        />
                      </div>
                      <img
                        src={masterUser?.u_photo || '/img/img-camera.png'}
                        alt="img absent"
                        style={{ height: 65, width: 66, borderRadius: 30 }}
                      />
                    </div>
                  </div>

                  <div className="nik">
                    <h2 className="eyrqwe">{masterUser?.u_name}</h2>
                    <div className="info_nik df">
                      <div className="kiril_info">
                        <h3>
                          {masterUser?.u_details?.isOnline
                            ? 'Онлайн'
                            : `Офлайн ${getTimeSinceLastOnline(
                                masterUser?.u_details?.lastTimeBeenOnline ||
                                  new Date().toISOString(),
                              )}`}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              <div style={{ flex: 1 }}></div>

              <Dropdown
                title={
                  <>
                    <div className={styles.dotted}>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </>
                }
                buttonClassName={styles.drop_button}
                menuClassName={styles.drop_menu}
              >
                <div>
                  {window.location.pathname.includes('/master/chat') ? null : (
                    <Dropdown.Item
                      className={styles.item_modile}
                      onClick={() => setVisibleAddOrder(true)}
                    >
                      <img src="/img/icons/review.png" alt="" />
                      Заказать ещё
                    </Dropdown.Item>
                  )}
                  {window.location.pathname.includes('/master/chat') ? null : (
                    <Dropdown.Item className={styles.item}>
                      <img src="/img/icons/review.png" alt="" />
                      Оставить отзыв
                    </Dropdown.Item>
                  )}

                  <Dropdown.Item
                    className={styles.item}
                    onClick={() => {
                      // Логика блокировки
                    }}
                  >
                    <img src="/img/icons/block.png" alt="" />
                    Заблокировать
                  </Dropdown.Item>
                  <Dropdown.Item
                    className={styles.item}
                    onClick={() => setVisibleBlackList(true)}
                  >
                    <img src="/img/icons/ban.png" alt="" />
                    Чёрный список
                  </Dropdown.Item>
                  <Dropdown.Item
                    className={styles.item}
                    onClick={() => setIsDeleteChat(true)}
                  >
                    <img src="/img/icons/trash.png" alt="" />
                    Удалить чат
                  </Dropdown.Item>
                </div>
              </Dropdown>

              {window.location.pathname.includes('/master/chat') ? null : (
                <button
                  className={`ordermore inter ${styles.button_more}`}
                  onClick={() => setVisibleAddOrder(true)}
                >
                  Заказать еще
                </button>
              )}
            </div>

            <div className="chatt awqervgg chat_block__ashd" ref={chatBlockRef}>
              {currentChat.orders.map((order) => (
                <OrderDetailsBlock
                  setBalanceErrorNum={setBalanceErrorNum}
                  setIsBalanceError={setIsBalanceError}
                  setOrderId={setCurrentOrderId}
                  setIsOpenDisput={zayavka__setVisibleDispute}
                  key={order.b_id}
                  order={order}
                  currentUser={currentUser}
                  masterUser={masterUser}
                  refetchRequests={userRequests.refetch}
                />
              ))}
            </div>
            <div className="message_block" style={{ position: 'relative' }}>
              <div className="block_messages-2 font_inter">
                {isBalanceError ? (
                  <div className={styles.balance_error}>
                    <p>
                      Пожалуйста пополните баланс на {BalanceErrorNum} рублей
                    </p>
                  </div>
                ) : null}
                {answer ? (
                  <p className="answer_to_message">
                    Ответить <span>Смогу приехать через час</span>
                    <button onClick={() => Isanswer(false)}>X</button>
                  </p>
                ) : null}
                {edit ? (
                  <p className="answer_to_message">
                    Редактирование{' '}
                    <button onClick={() => Isedit(false)}>X</button>
                  </p>
                ) : null}

                {currentUser.u_details?.black_list?.find(
                  (item: any) => item.id?.toString() === user.u_id?.toString(),
                ) ? (
                  <div className={styles.chat_block_wrap}>
                    <img src="/img/icons/chat_block.png" alt="" />
                    <p>
                      Возможности для связи с пользователем нет, поскольку он
                      заблокировал диалог с вами{' '}
                    </p>
                  </div>
                ) : (
                  <div className="magnafire-2 df align">
                    <div className="magnafire_input-2">
                      <input
                        className="inp"
                        type="text"
                        placeholder="Введите сообщение..."
                        value={message}
                        onChange={handleInputChat}
                      />
                    </div>
                    <div className="nav_message df">
                      <div style={{ position: 'relative' }}>
                        {chooseFile ? (
                          <div className="frame_icon qwerewrf">
                            <div className="choice df block_file_attach__flex">
                              <div className="choice_img">
                                <img
                                  src="/img/chat_img/img.png"
                                  alt="img absent"
                                />
                              </div>
                              <div className="im_attach pull-left align">
                                <input
                                  type="file"
                                  className="im_attach_input"
                                  title="Send file"
                                  style={{ display: 'none' }}
                                />
                                <p className="block_file_attach__text">
                                  Фото или видео
                                </p>
                              </div>
                            </div>

                            <div className="folder df block_file_attach__flex">
                              <div className="choice_img">
                                <img
                                  src="/img/chat_img/folder.png"
                                  alt="img absent"
                                />
                              </div>
                              <div className="im_attach pull-left align">
                                <input
                                  type="file"
                                  className="im_attach_input"
                                  title="Send file"
                                  style={{ display: 'none' }}
                                />
                                <p className="block_file_attach__text">
                                  Документ
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        <label>
                          <img
                            onClick={(event) => {
                              IschooseFile((prev) => !prev);
                              event.preventDefault();
                            }}
                            src="/img/chat_img/clip.png"
                            alt="img absent"
                          />
                        </label>
                      </div>

                      <label htmlFor="file-input">
                        <img src="/img/icons/micro.png" alt="img absent" />
                      </label>

                      <div style={{ position: 'relative' }}>
                        {isVisibleEmoji ? (
                          <div className={styles.emoji_pos}>
                            <EmojiPicker onEmojiClick={addEmojiToMessage} />
                          </div>
                        ) : null}
                        <label
                          htmlFor="file-input"
                          onClick={() => setVisibleEmoji((prev) => !prev)}
                        >
                          <img src="/img/chat_img/emoji.png" alt="img absent" />
                        </label>
                      </div>

                      <div className="plane"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.empty_chat}>
            <img src="/img/empty_chat.png" alt="" />
            <p>Пожалуйста, выберите диалог чтобы видеть сообщение!</p>
          </div>
        )}
      </section>
    </>
  );
}

export default ChoiceOfReplenishmentMethodCard;
