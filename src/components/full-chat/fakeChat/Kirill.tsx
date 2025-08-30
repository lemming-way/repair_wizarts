import {
  useEffect,
  useRef,
  useState,
  useMemo,
  FC,
  Dispatch,
  SetStateAction,
  KeyboardEvent,
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
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';

// ====== ЧАТ: типы и утилиты ===============================================
type ChatAuthor = 'client' | 'master' | 'admin';

interface ChatMessage {
  id: string; // uuid
  ts: string; // ISO
  author: ChatAuthor;
  text: string;
  files?: string[];
}

const nowIso = () => new Date().toISOString();

const makeMsg = (
  author: ChatAuthor,
  text: string,
  files?: string[],
): ChatMessage => ({
  id:
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? (crypto as any).randomUUID()
      : String(Date.now()) + Math.random().toString(16).slice(2),
  ts: nowIso(),
  author,
  text: String(text || '').trim(),
  files: files && files.length ? files : undefined,
});
// ===========================================================================

// ====== Хронологический таймлайн событий ======
type TimelineKind =
  | 'order_created'
  | 'chat'
  | 'cancel_requested'
  | 'cancel_master_accepted'
  | 'cancel_master_rejected'
  | 'dispute_opened'
  | 'dispute_master_accepted'
  | 'dispute_master_rejected'
  | 'order_completed';

interface TimelineItemBase {
  ts: string; // ISO
  kind: TimelineKind;
}

interface TimelineChatItem extends TimelineItemBase {
  kind: 'chat';
  msg: ChatMessage;
}

interface TimelineSimpleItem extends TimelineItemBase {
  kind:
    | 'order_created'
    | 'cancel_requested'
    | 'cancel_master_accepted'
    | 'cancel_master_rejected'
    | 'dispute_opened'
    | 'dispute_master_accepted'
    | 'dispute_master_rejected'
    | 'order_completed';
}

type TimelineItem = TimelineChatItem | TimelineSimpleItem;
// =================================================

// Тип для фото-ссылки
interface PhotoUrl {
  url: string;
}

// Типизированный компонент для dropbox-фото
const DropboxImage: FC<{
  url: string;
  alt?: string;
  style?: React.CSSProperties;
}> = ({ url, alt = '', style }) => {
  const [imgUrl, setImgUrl] = useState<string | null>(
    url && url.startsWith('blob:') ? url : null,
  );
  const [error, setError] = useState(false);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    let revoked = false;
    if (!url) return;
    if (url.startsWith('blob:')) {
      setImgUrl(url);
      return;
    }
    const match = url.match(/\/dropbox\/file\/(\d+)/);
    const id = match ? match[1] : null;
    if (!id) return;
    fetch(`https://ibronevik.ru/taxi/api/v1/dropbox/file/${id}`, {
      method: 'POST',
      body: new URLSearchParams({
        token: 'bbdd06a50ddcc1a4adc91fa0f6f86444',
        u_hash:
          'VLUy4+8k6JF8ZW3qvHrDZ5UDlv7DIXhU4gEQ82iRE/zCcV5iub0p1KhbBJheMe9JB95JHAXUCWclAwfoypaVkLRXyQP29NDM0NV1l//hGXKk6O43BS3TPCMgZEC4ymtr',
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Ошибка загрузки фото');
        const blob = await res.blob();
        if (!blob.type.startsWith('image/')) throw new Error('Не картинка');
        const objectUrl = URL.createObjectURL(blob);
        urlRef.current = objectUrl;
        if (!revoked) setImgUrl(objectUrl);
      })
      .catch(() => setError(true));
    return () => {
      revoked = true;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [url]);

  if (error)
    return (
      <div
        style={{
          width: '100%',
          height: 120,
          background: '#eee',
          color: 'red',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Ошибка загрузки фото
      </div>
    );
  if (!imgUrl)
    return (
      <div
        style={{
          width: '100%',
          height: 120,
          background: '#eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Загрузка...
      </div>
    );
  return <img src={imgUrl} alt={alt} style={style || { width: '100%' }} />;
};

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

  // ===== ЧАТ: история для этого заказа =====
  const chatHistory: ChatMessage[] = useMemo(() => {
    const raw = order?.b_options?.chat_history;
    const arr = Array.isArray(raw) ? (raw as ChatMessage[]) : [];
    // сортируем сообщения по времени (старые -> новые)
    return [...arr].sort(
      (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime(),
    );
  }, [order?.b_options?.chat_history]);
  // ========================================

  // ===== Таймлайн для этого заказа (единая лента) =====
  const timeline: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];

    // 3.1 Создание заказа
    if (order?.b_created) {
      items.push({
        kind: 'order_created',
        ts: order.b_created,
      } as TimelineSimpleItem);
    }

    // 3.2 Запрос отмены (клиент)
    if (
      order?.b_options?.is_request_for_cancel_exist &&
      order?.b_options?.cancel_requested_ts
    ) {
      items.push({
        kind: 'cancel_requested',
        ts: order.b_options.cancel_requested_ts,
      } as TimelineSimpleItem);
    }

    // 3.3 Решение мастера по отмене
    if (
      typeof order?.b_options?.is_master_agree_with_cancel === 'boolean' &&
      order?.b_options?.cancel_master_decision_ts
    ) {
      items.push({
        kind: order.b_options.is_master_agree_with_cancel
          ? 'cancel_master_accepted'
          : 'cancel_master_rejected',
        ts: order.b_options.cancel_master_decision_ts,
      } as TimelineSimpleItem);
    }

    // 3.4 Открытие спора
    if (
      order?.b_options?.is_open_dispute &&
      order?.b_options?.dispute_opened_ts
    ) {
      items.push({
        kind: 'dispute_opened',
        ts: order.b_options.dispute_opened_ts,
      } as TimelineSimpleItem);
    }

    // 3.5 Решение мастера по спору
    if (
      typeof order?.b_options?.is_master_agree_with_dispute === 'boolean' &&
      order?.b_options?.dispute_master_decision_ts
    ) {
      items.push({
        kind: order.b_options.is_master_agree_with_dispute
          ? 'dispute_master_accepted'
          : 'dispute_master_rejected',
        ts: order.b_options.dispute_master_decision_ts,
      } as TimelineSimpleItem);
    }

    // 3.6 Завершение заказа
    if (order?.b_state === '4' && order?.b_options?.complete_ts) {
      items.push({
        kind: 'order_completed',
        ts: order.b_options.complete_ts,
      } as TimelineSimpleItem);
    }

    // 3.7 Сообщения чата
    for (const m of chatHistory) {
      if (m?.ts) {
        items.push({
          kind: 'chat',
          ts: m.ts,
          msg: m,
        } as TimelineChatItem);
      }
    }

    // сортировка по времени (от старых к новым)
    items.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
    return items;
  }, [
    order?.b_created,
    order?.b_state,
    order?.b_options?.is_request_for_cancel_exist,
    order?.b_options?.cancel_requested_ts,
    order?.b_options?.is_master_agree_with_cancel,
    order?.b_options?.cancel_master_decision_ts,
    order?.b_options?.is_open_dispute,
    order?.b_options?.dispute_opened_ts,
    order?.b_options?.is_master_agree_with_dispute,
    order?.b_options?.dispute_master_decision_ts,
    order?.b_options?.complete_ts,
    chatHistory,
  ]);
  // =====================================================

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

      // ====== ДОБАВИЛИ отметку времени завершения в b_options ======
      await updateRequest(
        order.b_id,
        {
          complete_ts: nowIso(),
        },
        true,
        order.u_id,
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
      // Обновляем b_options, добавляя флаг отмены + время
      await updateRequest(order.b_id, {
        is_request_for_cancel_exist: true,
        cancel_requested_ts: nowIso(), // <— отметка времени
      });
      console.log(`Запрос на отмену заказа ${order.b_id} отправлен.`);
      refetchRequests(); // Обновляем список
    } catch (error) {
      console.error('Ошибка при отмене заказа:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleOpenDispute = async () => {
    setOrderId(order.b_id);
    setIsOpenDisput(true);
    try {
      await updateRequest(order.b_id, {
        is_open_dispute: true,
        dispute_opened_ts: nowIso(), // <— отметка времени
      });
    } catch (e) {
      console.error('open dispute error', e);
    }
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
        if (lastDigit === 1) return 'час';
        else if (lastDigit >= 2 && lastDigit <= 4) return 'часа';
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
  // Получаем массив ссылок на фото
  const photoUrls: string[] =
    (order.b_options?.client_feedback_photo_urls as string[]) ||
    (order.b_options?.photoUrls as string[]) ||
    [];

  return (
    <>
      {/* ======= ЧАТ: (оставлен твой старый рендер истории; ниже будет единый таймлайн) ======= */}
      {chatHistory.length > 0 && (
        <div className="chat_technical_message">
          <div className={`${styles.message_block} ${styles.text_left}`}>
            <div
              className="correspondence df font_inter"
              style={{ flexDirection: 'column', gap: '10px' }}
            >
              {chatHistory.map((m) => {
                const isMine =
                  (m.author === 'client' &&
                    currentUser?.u_id === order?.u_id) ||
                  (m.author === 'master' &&
                    masterUser?.u_id === order?.b_options?.winnerMaster);
                const bubbleSide = isMine
                  ? styles.text_right
                  : styles.text_left;
                const avatarSrc =
                  m.author === 'admin'
                    ? '/img/img-camera.png'
                    : m.author === 'master'
                    ? masterUser?.u_photo || '/img/img-camera.png'
                    : currentUser?.u_photo || '/img/img-camera.png';
                const authorName =
                  m.author === 'admin'
                    ? 'Администратор'
                    : m.author === 'master'
                    ? masterUser?.u_name || 'Исполнитель'
                    : 'Вы';
                return (
                  <div
                    key={m.id}
                    className={`${styles.message_block} ${bubbleSide}`}
                    style={{ marginBottom: 6 }}
                  >
                    <div className="my_chat">
                      <div
                        className="correspondence-active font_inter df"
                        style={{ gap: '10px' }}
                      >
                        {!isMine && (
                          <div className="ciril-img">
                            <img
                              src={avatarSrc}
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                              }}
                              alt="user"
                            />
                          </div>
                        )}
                        <div className="let" style={{ maxWidth: 560 }}>
                          <div
                            className="letter_kiril df"
                            style={{
                              gap: '8px',
                              justifyContent: isMine
                                ? 'flex-end'
                                : 'flex-start',
                            }}
                          >
                            <div className="letter_text-1">
                              <h2 style={{ fontSize: 14, opacity: 0.8 }}>
                                {authorName}
                              </h2>
                            </div>
                            <div className="letter_text-2">
                              <h3 style={{ fontSize: 12, opacity: 0.6 }}>
                                {new Date(m.ts).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </h3>
                            </div>
                          </div>
                          <div
                            className={styles.block_bid}
                            style={{ padding: '10px 12px' }}
                          >
                            <p style={{ whiteSpace: 'pre-wrap' }}>{m.text}</p>
                            {!!m.files?.length && (
                              <div
                                style={{
                                  marginTop: 8,
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(3, 100px)',
                                  gap: 8,
                                }}
                              >
                                {m.files.map((u, i) => (
                                  <DropboxImage
                                    key={i}
                                    url={u}
                                    alt={`file-${i}`}
                                    style={{
                                      width: 100,
                                      height: 100,
                                      objectFit: 'cover',
                                      borderRadius: 8,
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* ======= КОНЕЦ: чат-история ======= */}

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
      {/* Фото заказа */}
      {photoUrls.length > 0 && (
        <div style={{ margin: '10px 0' }}>
          <Swiper
            slidesPerView={3}
            spaceBetween={10}
            navigation={true}
            modules={[Navigation]}
            style={{ width: 300, height: 120 }}
          >
            {photoUrls.map((url, idx) => (
              <SwiperSlide key={idx}>
                <DropboxImage
                  url={typeof url === 'string' ? url : (url as any).url}
                  alt={`Фото ${idx + 1}`}
                  style={{
                    width: '100%',
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 8,
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
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
                          cancel_master_decision_ts: nowIso(), // <— отметка времени
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
                          cancel_master_decision_ts: nowIso(), // <— отметка времени
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
                          dispute_master_decision_ts: nowIso(), // <— отметка времени
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
                          dispute_master_decision_ts: nowIso(), // <— отметка времени
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

      {/* ====== ЕДИНЫЙ ТАЙМЛАЙН (ВСЁ ПО ВРЕМЕНИ) ====== */}
      {timeline.length > 0 && (
        <div className="chat_technical_message">
          <div className={`${styles.message_block} ${styles.text_left}`}>
            <div
              className="correspondence df font_inter"
              style={{ flexDirection: 'column', gap: 10 }}
            >
              {timeline.map((item, idx) => {
                if (item.kind === 'chat') {
                  const m = (item as TimelineChatItem).msg;
                  const isMine =
                    (m.author === 'client' &&
                      currentUser?.u_id === order?.u_id) ||
                    (m.author === 'master' &&
                      masterUser?.u_id === order?.b_options?.winnerMaster);
                  const bubbleSide = isMine
                    ? styles.text_right
                    : styles.text_left;
                  const avatarSrc =
                    m.author === 'admin'
                      ? '/img/img-camera.png'
                      : m.author === 'master'
                      ? masterUser?.u_photo || '/img/img-camera.png'
                      : currentUser?.u_photo || '/img/img-camera.png';
                  const authorName =
                    m.author === 'admin'
                      ? masterUser?.u_name || 'Исполнитель'
                      : m.author === 'master'
                      ? masterUser?.u_name || 'Исполнитель'
                      : 'Вы';
                  return (
                    <div
                      key={m.id}
                      className={`${styles.message_block} ${bubbleSide}`}
                      style={{ marginBottom: 6 }}
                    >
                      <div className="my_chat">
                        <div
                          className="correspondence-active font_inter df"
                          style={{ gap: 10 }}
                        >
                          {!isMine && (
                            <div className="ciril-img">
                              <img
                                src={avatarSrc}
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 20,
                                }}
                                alt="user"
                              />
                            </div>
                          )}
                          <div className="let" style={{ maxWidth: 560 }}>
                            <div
                              className="letter_kiril df"
                              style={{
                                gap: 8,
                                justifyContent: isMine
                                  ? 'flex-end'
                                  : 'flex-start',
                              }}
                            >
                              <div className="letter_text-1">
                                <h2 style={{ fontSize: 14, opacity: 0.8 }}>
                                  {authorName}
                                </h2>
                              </div>
                              <div className="letter_text-2">
                                <h3 style={{ fontSize: 12, opacity: 0.6 }}>
                                  {new Date(m.ts).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </h3>
                              </div>
                            </div>
                            <div
                              className={styles.block_bid}
                              style={{ padding: '10px 12px' }}
                            >
                              <p style={{ whiteSpace: 'pre-wrap' }}>{m.text}</p>
                              {!!m.files?.length && (
                                <div
                                  style={{
                                    marginTop: 8,
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 100px)',
                                    gap: 8,
                                  }}
                                >
                                  {m.files.map((u, i) => (
                                    <DropboxImage
                                      key={i}
                                      url={u}
                                      alt={`file-${i}`}
                                      style={{
                                        width: 100,
                                        height: 100,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                      }}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // системные события — единый вид
                const timeStr = new Date(item.ts).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const sys = (txt: string, icon: string) => (
                  <div
                    className={`${styles.message_block} ${styles.text_center}`}
                  >
                    <div className={styles.cancel_block}>
                      <img src={icon} alt="" />
                      <p>{txt}</p>
                      <span>{timeStr}</span>
                    </div>
                  </div>
                );

                switch (item.kind) {
                  case 'order_created':
                    return (
                      <div
                        key={`sys-${idx}`}
                        className="chat_technical_message"
                      >
                        {sys(
                          `${
                            order.b_options.orderType === 'request'
                              ? 'Заявка'
                              : 'Заказ'
                          } создан (№${order.b_id})`,
                          '/img/icons/box.png',
                        )}
                      </div>
                    );
                  case 'cancel_requested':
                    return (
                      <div
                        key={`sys-${idx}`}
                        className="chat_technical_message"
                      >
                        {sys(
                          `Клиент предложил отмену ${
                            order.b_options.orderType === 'request'
                              ? 'заявки'
                              : 'заказа'
                          }`,
                          '/img/cansel_message.png',
                        )}
                      </div>
                    );
                  case 'cancel_master_accepted':
                    return (
                      <div
                        key={`sys-${idx}`}
                        className="chat_technical_message"
                      >
                        {sys(
                          `Исполнитель принял отмену ${
                            order.b_options.orderType === 'request'
                              ? 'заявки'
                              : 'заказа'
                          }`,
                          '/img/message_green.png',
                        )}
                      </div>
                    );
                  case 'cancel_master_rejected':
                    return (
                      <div
                        key={`sys-${idx}`}
                        className="chat_technical_message"
                      >
                        {sys(
                          `Исполнитель отказался от отмены ${
                            order.b_options.orderType === 'request'
                              ? 'заявки'
                              : 'заказа'
                          }`,
                          '/img/message_cancel.png',
                        )}
                      </div>
                    );
                  case 'dispute_opened':
                    return (
                      <div
                        key={`sys-${idx}`}
                        className="chat_technical_message"
                      >
                        {sys(
                          `Открылся спор по ${
                            order.b_options.orderType === 'request'
                              ? 'данной заявке'
                              : 'данному заказу'
                          }`,
                          '/img/message_cancel.png',
                        )}
                      </div>
                    );
                  case 'dispute_master_accepted':
                    return (
                      <div
                        key={`sys-${idx}`}
                        className="chat_technical_message"
                      >
                        {sys(
                          `Исполнитель согласился по спору (${
                            order.b_options.orderType === 'request'
                              ? 'заявка'
                              : 'заказ'
                          })`,
                          '/img/message_green.png',
                        )}
                      </div>
                    );
                  case 'dispute_master_rejected':
                    return (
                      <div
                        key={`sys-${idx}`}
                        className="chat_technical_message"
                      >
                        {sys(
                          `Исполнитель не согласен по спору (${
                            order.b_options.orderType === 'request'
                              ? 'заявка'
                              : 'заказ'
                          })`,
                          '/img/message_cancel.png',
                        )}
                      </div>
                    );
                  case 'order_completed':
                    return (
                      <div
                        key={`sys-${idx}`}
                        className="chat_technical_message"
                      >
                        {sys(
                          `${
                            order.b_options.orderType === 'request'
                              ? 'Заявка'
                              : 'Заказ'
                          } успешно подтвержден`,
                          '/img/message_green.png',
                        )}
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        </div>
      )}
      {/* ====== КОНЕЦ: ЕДИНЫЙ ТАЙМЛАЙН ====== */}
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
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  function addEmojiToMessage(emoji: EmojiClickData) {
    setMessage((prevMessage) => prevMessage + emoji.emoji);
  }

  function handleInputChat(event: React.ChangeEvent<HTMLInputElement>) {
    setMessage(event.target.value);
  }
  const [isAtBottom, setIsAtBottom] = useState(false);
  const chatBlockRef = useRef<HTMLDivElement>(null);

  // ===== ЧАТ: отправка сообщения =====
  async function sendChatMessage(
    order: any,
    who: 'client' | 'master',
    text: string,
    files?: string[],
  ) {
    const author: ChatAuthor = who === 'client' ? 'client' : 'admin';
    const msg = makeMsg(author, text, files);
    const prev: ChatMessage[] = Array.isArray(order?.b_options?.chat_history)
      ? (order.b_options.chat_history as ChatMessage[])
      : [];
    const next = [...prev, msg];
    try {
      if (who === 'client') {
        await updateRequest(order.b_id, { chat_history: next });
      } else {
        await updateRequest(
          order.b_id,
          { chat_history: next },
          true,
          order.u_id,
        );
      }
    } catch (e) {
      console.error('sendChatMessage error', e);
    }
  }

  const handleSend = async () => {
    const text = message.trim();
    if (!text) return;
    if (!currentChat?.orders?.length) return;
    const order = currentChat.orders[currentChat.orders.length - 1];
    const role: 'client' | 'master' = ui.isMaster ? 'master' : 'client';
    await sendChatMessage(
      order,
      role,
      text,
      attachedFiles.length ? attachedFiles : undefined,
    );
    setMessage('');
    setAttachedFiles([]);
    userRequests.refetch();
    scrollToBottom();
  };

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

  // отправка по Enter
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

  // ===== Псевдо-вебсокет: опрос каждые 30 секунд =====
  useEffect(() => {
    const t = setInterval(() => {
      userRequests.refetch();
    }, 30000);
    return () => clearInterval(t);
  }, [userRequests]);
  // ====================================

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
                        onKeyDown={handleInputKeyDown}
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

                      <div
                        className="plane"
                        onClick={handleSend}
                        role="button"
                        aria-label="Отправить сообщение"
                      ></div>
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
