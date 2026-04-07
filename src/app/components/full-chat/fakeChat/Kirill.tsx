import type { Dispatch, SetStateAction, FC } from 'react';
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  Suspense,
} from 'react';
import '../../../scss/chat.css';
import Dropdown from 'react-multilevel-dropdown';
import MediaQuery from 'react-responsive';
import { Link, useParams } from 'react-router-dom';

import AddFeedbackModal from './AddFeedbackModal';
import AddOrderModal from './AddOrderModal';
import BlackListModal from './BlackListModal';
import styles from './Chat.module.css';
import BlockUser from './BlockUser';
import DeleteChatModal from './DeleteChatModal';
import OkModal from './OkModal';
import { UserProfile, useUser, UserRole, useUsersByIds } from '../../../state/user';
import {
  Order,
  OrderStatus,
  useClientOrders,
  useContractorOrders,
} from '../../../state/order';

import type { EmojiClickData } from 'emoji-picker-react';

import OnlineDotted from '../../onlineDotted/OnlineDotted';
import DisputeModalV2 from './DisputeModal_v2';
import DisputeFinalModalV2 from './DisputeFinalModal';
import FrameMessages from './frameMessages';
import { useLanguage } from '../../../state/language';
import { AnyMedia, getKeyFor } from '../../../shared/ui';

const LazySwiper = React.lazy(() =>
  import('../../../shared/ui/SwiperWrapper').then((m) => ({
    default: m.SwiperWithModules,
  })),
);
const LazySwiperSlide = React.lazy(() =>
  import('../../../shared/ui/SwiperWrapper').then((m) => ({
    default: m.SwiperSlide,
  })),
);
const EmojiPickerLazy = React.lazy(() => import('emoji-picker-react'));

// TODO: Модуль не функционален, надо всё переделать

// ====== ЧАТ: типы и утилиты ===============================================
type ChatAuthor = 'client' | 'contractor' | 'admin';

interface ChatMessage {
  id: string; // uuid
  ts: string; // ISO
  author: ChatAuthor;
  text: string;
  files?: number[]; // Теперь файлы представлены числовыми ID
}

const nowIso = () => new Date().toISOString();

const makeMsg = (
  author: ChatAuthor,
  text: string,
  files?: number[], // Принимаем массив ID файлов
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
  | 'cancel_contractor_accepted'
  | 'cancel_contractor_rejected'
  | 'dispute_opened' // Заглушка
  | 'dispute_contractor_accepted' // Заглушка
  | 'dispute_contractor_rejected' // Заглушка
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
    | 'cancel_contractor_accepted'
    | 'cancel_contractor_rejected'
    | 'dispute_opened'
    | 'dispute_contractor_accepted'
    | 'dispute_contractor_rejected'
    | 'order_completed';
}

type TimelineItem = TimelineChatItem | TimelineSimpleItem;
// =================================================

interface OrderDetailsBlockProps {
  order: Order;
  setOrderId: Dispatch<SetStateAction<number>>;
  setIsOpenDisput: Dispatch<SetStateAction<boolean>>;
  currentUser: UserProfile;
  partnerUser: UserProfile;
  setIsBalanceError: Dispatch<SetStateAction<boolean>>;
  setBalanceErrorNum: Dispatch<SetStateAction<number>>;
  viewerIsContractor: boolean;
}

const OrderDetailsBlock: FC<OrderDetailsBlockProps> = ({
  order,
  currentUser,
  partnerUser,
  setOrderId,
  setIsOpenDisput,
  setIsBalanceError,
  setBalanceErrorNum,
  viewerIsContractor,
}) => {
  const text = useLanguage();
  // isRequestType - заглушка, т.к. orderType не в новой структуре Order
  const isRequestType = false; // order?.b_options?.orderType === 'request';

  // ===== ЧАТ: история для этого заказа =====
  // chat_history не в новой структуре Order, используем заглушку
  const chatHistory: ChatMessage[] = useMemo(() => {
    // const raw = order?.b_options?.chat_history; // STUB
    // const arr = Array.isArray(raw) ? (raw as ChatMessage[]) : [];
    // // сортируем сообщения по времени (старые -> новые)
    // return [...arr].sort(
    //   (a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime(),
    // );
    return []; // Заглушка
  }, [
    /* order?.b_options?.chat_history */
  ]);
  // ========================================

  // ===== Таймлайн для этого заказа (единая лента) =====
  const timeline: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];

    // 3.1 Создание заказа
    if (order.createdAt) {
      items.push({
        kind: 'order_created',
        ts: order.createdAt.toISOString(),
      } as TimelineSimpleItem);
    }

    // 3.2 Запрос отмены (клиент) - заглушка, т.к. флаги отмены не в новой структуре
    if (order.status === OrderStatus.CANCELLED /* && order?.b_options?.cancel_requested_ts */) {
      items.push({
        kind: 'cancel_requested',
        ts: order.updatedAt.toISOString(), // Используем updatedAt как заглушку для времени запроса отмены
      } as TimelineSimpleItem);
    }

    // 3.3 Решение мастера по отмене - заглушка
    // if (
    //   typeof order?.b_options?.is_contractor_agree_with_cancel === 'boolean' &&
    //   order?.b_options?.cancel_contractor_decision_ts
    // ) {
    //   items.push({
    //     kind: order.b_options.is_contractor_agree_with_cancel
    //       ? 'cancel_contractor_accepted'
    //       : 'cancel_contractor_rejected',
    //     ts: order.b_options.cancel_contractor_decision_ts,
    //   } as TimelineSimpleItem);
    // }

    // 3.4 Открытие спора - заглушка
    if (order.status === OrderStatus.DISPUTE /* && order?.b_options?.dispute_opened_ts */) {
      items.push({
        kind: 'dispute_opened',
        ts: order.updatedAt.toISOString(), // Используем updatedAt как заглушку для времени открытия спора
      } as TimelineSimpleItem);
    }

    // 3.5 Решение мастера по спору - заглушка
    // if (
    //   typeof order?.b_options?.is_contractor_agree_with_dispute === 'boolean' &&
    //   order?.b_options?.dispute_contractor_decision_ts
    // ) {
    //   items.push({
    //     kind: order.b_options.is_contractor_agree_with_dispute
    //       ? 'dispute_contractor_accepted'
    //       : 'dispute_contractor_rejected',
    //     ts: order.b_options.dispute_contractor_decision_ts,
    //   } as TimelineSimpleItem);
    // }

    // 3.6 Завершение заказа
    if (order.status === OrderStatus.CLOSED /* && order?.b_options?.complete_ts */) {
      items.push({
        kind: 'order_completed',
        ts: order.updatedAt.toISOString(), // Используем updatedAt как заглушку для времени завершения
      } as TimelineSimpleItem);
    }

    // 3.7 Сообщения чата
    for (const m of chatHistory) {
      // Chat history is a stub, so this loop will not add anything.
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
    order.createdAt,
    order.status,
    order.updatedAt,
    chatHistory,
  ]);
  // =====================================================

  // Состояния для модального окна изображения
  const [modalImageID, setModalImage] = useState<number|null>(null);

  // Состояния для управления UI конкретного заказа
  const [isVisibleAddFeedback, setVisibleAddFeedback] = useState(false);

  // Add balance check - заглушка
  // TODO: Implement actual balance check using current user's balance
  useEffect(() => {
    setIsBalanceError(false); // Всегда false для заглушки
    setBalanceErrorNum(0); // Всегда 0 для заглушки
  }, [order, currentUser.id, setIsBalanceError, setBalanceErrorNum]); // currentUser.id is sufficient dependency
  // --- НАЧАЛО: Логика для кнопок подтверждения и отмены ---
  // Логика кнопок была закомментирована и теперь будет удалена, заменена заглушками
  // --- КОНЕЦ: Логика для кнопок ---

  // driverData и contractorReqData - заглушки
  const driverData = order.contractorOffers.find(
    (offer) => offer.contractorId === order.contractorId,
  );
  const contractorReqData = { bind_amount: driverData?.price || 0 }; // Заглушка

  // photoUrls теперь массив ID файлов из attachments
  const photoUrls: number[] = order.attachments || [];

  return (
    <>
      {isVisibleAddFeedback && (
        <AddFeedbackModal
          id={order.id}
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
                    <h2>{text('You')}</h2>
                  </div>
                  <img
                    src={currentUser.avatar || '/img/img-camera.png'}
                    style={{ width: '58px', height: '58px', borderRadius: 30 }}
                    alt="img absent"
                  />
                </div>
                <div className={styles.block_bid}>
                  <p>
                    {isRequestType
                      ? text('Selected device model')
                      : text('Order published on the exchange')}{' '}
                    <Link
                      to={'/contractor/requests'}
                      className={styles.block_bid__link}
                    >
                      {order.description} {/* Используем description как title */}
                    </Link>
                  </p>
                  {isRequestType && (
                    <p>
                      {text('Scope of work:')}
                      <span>{order.description}</span>
                    </p>
                  )}
                  <p>
                    {text('Client description:')} {order.description}
                  </p>
                  <p>
                    {text('Contractor responded with an offer of')}{' '}
                    {contractorReqData?.bind_amount} {text('rubles')}.
                  </p>
                  <p>
                    {text('Contractor message from')}{' '}
                    {isRequestType
                      ? text('the request')
                      : text('the marketplace order!')}{' '}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Фото заказа (если есть массив ссылок в заказе) */}
      {photoUrls.length > 0 && (
        <div style={{ margin: '10px 0' }}>
          <Suspense fallback={<div className="swiper-loading" />}>
            <LazySwiper
              slidesPerView={3}
              spaceBetween={10}
              navigation={true}
              style={{ width: 300, height: 120 }}
            >
              {photoUrls.map((fileId, idx) => (
                <LazySwiperSlide key={idx}>
                  <AnyMedia
                    src={fileId}
                    mediaType='image' // Указываем тип медиа как изображение
                    imageProps={{alt: `${text('Photo')} ${idx + 1}`}}
                    style={{
                      width: '100%',
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: 8,
                    }}
                  />
                </LazySwiperSlide>
              ))}
            </LazySwiper>
          </Suspense>
        </div>
      )}

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
                  // кто сейчас смотрит чат: мастер или клиент
                  // Используем роль пользователя из хука useUser
                  const viewerIsContractor = currentUser.role === UserRole.Contractor;

                  // у нас в истории авторы: 'client' и иногда 'contractor'
                  // считаем "моё" по роли зрителя
                  const isMine = viewerIsContractor
                    ? m.author === 'contractor'
                    : m.author === 'client';
                  const bubbleSide = isMine
                    ? styles.text_right
                    : styles.text_left;

                  const renderFiles = (files?: number[]) => { // Теперь файлы представлены числовыми ID
                    if (!files || !files.length) return null;
                    return (
                      <div
                        style={{
                          marginTop: 8,
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        {files.map(fileId => (
                          <div
                            key={getKeyFor(fileId)}
                            style={{ width: 200, maxWidth: '100%' }}
                          >
                            <AnyMedia
                              src={fileId}
                              style={{ width: '100%' }}
                              imageProps={{
                                style: {
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 8,
                                  cursor: 'pointer',
                                },
                                alt: 'file'  // todo: подумать как получить сюда имя файла
                              }}
                              videoProps={{
                                style: {
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 8,
                                }
                              }}
                              iframeProps={{
                                style: {
                                  height: 300,
                                  border: 'none',
                                  borderRadius: 8,
                                },
                                title: text('Document')  // todo: подумать как получить сюда имя файла
                              }}
                              onClick={event => {
                                if (event.currentTarget.tagName === 'IMG') {
                                  setModalImage(fileId);
                                }
                              }}
                            />
                          </div>
                        ))}
                        {/* Модалка полноэкранного просмотра */}
                        {modalImageID && (
                          <div
                            onClick={() => setModalImage(null)}
                            style={{
                              position: 'fixed',
                              inset: 0,
                              background: 'rgba(0,0,0,0.85)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 9999,
                              cursor: 'zoom-out',
                            }}
                          >
                            <AnyMedia
                              src={modalImageID}
                              mediaType='image'
                              imageProps={{
                                alt: text('File')  // todo: подумать как получить сюда имя файла
                              }}
                              style={{
                                maxWidth: '95vw',
                                maxHeight: '95vh',
                                borderRadius: 10,
                                boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                              }}
                              onClick={(e) => e.stopPropagation()} // чтобы клик по самой картинке не закрывал
                            />
                            {/* Кнопка закрытия (опционально) */}
                            <button
                              onClick={() => setModalImage(null)}
                              aria-label={text('Close')}
                              style={{
                                position: 'fixed',
                                top: 16,
                                right: 16,
                                background: 'rgba(0,0,0,0.6)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '8px 10px',
                                fontSize: 14,
                                cursor: 'pointer',
                              }}
                            >
                              {text('Close')}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  };

                  // показываем "Вы" только на своих сообщениях
                  const authorName = isMine
                    ? text('You')
                    : partnerUser?.name || text(viewerIsContractor ? 'Client' : 'Contractor');

                  // аватар показываем у собеседника (слева), у своих можно не показывать
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
                                src={partnerUser?.avatar || '/img/img-camera.png'}
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
                              {renderFiles(m.files)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

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
                            isRequestType
                              ? text('Request created')
                              : text('Order created')
                          } (№${order.id})`, // Используем order.id
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
                          isRequestType
                            ? text('Client requested cancellation of the request')
                            : text('Client requested cancellation of the order'),
                          '/img/cansel_message.png',
                        )}
                      </div>
                    );
                  case 'cancel_contractor_accepted':
                    // Заглушка, т.к. нет в OrderStatus
                    return (
                      <div
                        key={`sys-${idx}`}
                        className="chat_technical_message"
                      >
                        {sys(
                          isRequestType
                            ? text('Contractor accepted cancellation of the request')
                            : text('Contractor accepted cancellation of the order'),
                          '/img/message_green.png',
                        )}
                      </div>
                    );
                  case 'cancel_contractor_rejected':
                    // Заглушка, т.к. нет в OrderStatus
                    return (
                      <div
                        key={`sys-${idx}`}
                        className="chat_technical_message"
                      >
                        {sys(
                          isRequestType
                            ? text('Contractor declined cancellation of the request')
                            : text('Contractor declined cancellation of the order'),
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
                          isRequestType
                            ? text('Dispute opened for this request')
                            : text('Dispute opened for this order'),
                          '/img/message_cancel.png',
                        )}
                      </div>
                    );
                  case 'dispute_contractor_accepted':
                    // Заглушка, т.к. нет в OrderStatus
                    return (
                      <div
                        key={`sys-${idx}`}
                        className="chat_technical_message"
                      >
                        {sys(
                          isRequestType
                            ? text('Contractor accepted the dispute for the request')
                            : text('Contractor accepted the dispute for the order'),
                          '/img/message_green.png',
                        )}
                      </div>
                    );
                  case 'dispute_contractor_rejected':
                    // Заглушка, т.к. нет в OrderStatus
                    return (
                      <div
                        key={`sys-${idx}`}
                        className="chat_technical_message"
                      >
                        {sys(
                          isRequestType
                            ? text('Contractor rejected the dispute for the request')
                            : text('Contractor rejected the dispute for the order'),
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
                          isRequestType
                            ? text('Request confirmed successfully')
                            : text('Order confirmed successfully'),
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
  const text = useLanguage();
  const { user: currentUser } = useUser();
  const isUserAuthorized = 'id' in currentUser && !!currentUser.id;
  const [isVisibleBlackList, setVisibleBlackList] = useState(false);
  const [isVisibleAddOrder, setVisibleAddOrder] = useState(false);
  const [isVisibleEmoji, setIsVisibleEmoji] = useState(false);
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

  const [chatClientIdStr, chatContractorIdStr] = id?.split('_') ?? [];
  const chatClientId = Number(chatClientIdStr);
  const chatContractorId = Number(chatContractorIdStr);

  // Проверяем, является ли текущий пользователь участником чата
  const isCurrentUserClient = currentUser.id === chatClientId;
  const isCurrentUserContractor = currentUser.id === chatContractorId;

  const chatPartnerId = isCurrentUserClient ? chatContractorId : isCurrentUserContractor ? chatClientId : null;

  // Загружаем данные второго участника чата
  const { users: chatPartners } = useUsersByIds(chatPartnerId ? [chatPartnerId] : []);
  const chatPartner = chatPartners[0]; // Может быть undefined или {} если не найден

  // Получаем заказы в зависимости от роли текущего пользователя
  const { orders: clientOrders, isLoading: clientOrdersLoading } = useClientOrders(true, true);
  const { orders: contractorOrders, isLoading: contractorOrdersLoading } = useContractorOrders(true, true);

  // Фильтруем заказы для текущего чата
  const currentChatOrders = useMemo(() => {
    const userOrders = currentUser.role === UserRole.Contractor ? contractorOrders : clientOrders;
    return userOrders.filter(
      order =>
        order.clientId === chatClientId &&
        order.contractorId === chatContractorId
    );
  }, [currentUser.role, clientOrders, contractorOrders, chatClientId, chatContractorId]);

  // Проверяем загрузку заказов
  const isLoadingOrders = (currentUser.role === UserRole.Client && clientOrdersLoading) ||
                         (currentUser.role === UserRole.Contractor && contractorOrdersLoading);

  // Set document title and body overflow once relevant data is loaded
  useEffect(() => {
    document.title = text('Chat');
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto'; // Reset overflow on unmount
    };
  }, [text]);

  const [answer, Isanswer] = useState(false);
  const [edit, Isedit] = useState(false);
  const [chooseFile, IschooseFile] = useState(false);
  const [message, setMessage] = useState('');

  // === предпросмотр выбранных файлов до отправки ===
  const [previewFiles, setPreviewFiles] = useState<
    { file: File }[] // Теперь файлы хранятся как объекты File, без URL
  >([]);

  function addEmojiToMessage(emoji: EmojiClickData) {
    setMessage((prevMessage) => prevMessage + emoji.emoji);
  }

  function handleInputChat(event: React.ChangeEvent<HTMLInputElement>) {
    setMessage(event.target.value);
  }

  const [isAtBottom, setIsAtBottom] = useState(false);
  const chatBlockRef = useRef<HTMLDivElement>(null);

  // ===== измеряем высоту футера, чтобы лента не перекрывалась закреплённой панелью
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState<number>(0);

  const measureFooter = useCallback(() => {
    const nextHeight = footerRef.current?.offsetHeight ?? 0;
    setFooterHeight((prevHeight) =>
      prevHeight === nextHeight ? prevHeight : nextHeight,
    );
  }, []);

  useEffect(() => {
    measureFooter();
    const ro = new ResizeObserver(() => measureFooter());
    if (footerRef.current) ro.observe(footerRef.current);
    const onResize = () => measureFooter();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
  }, [measureFooter]);

  // Помощники автоскролла
  const scrollToBottom = useCallback(() => {
    if (chatBlockRef.current) {
      chatBlockRef.current.scrollTop = chatBlockRef.current.scrollHeight;
    }
  }, [chatBlockRef]);
  const scrollToBottomSoon = useCallback(() => {
    setTimeout(scrollToBottom, 50);
    setTimeout(scrollToBottom, 200);
    setTimeout(scrollToBottom, 600);
  }, [scrollToBottom]);

  const handleScroll = () => {
    if (chatBlockRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatBlockRef.current;
      const atBottom = scrollHeight - (scrollTop + clientHeight) > 200;
      setIsAtBottom(atBottom);
    }
  };

  useEffect(() => {
    // при открытии emoji/добавлении превью — переизмеряем и скроллим вниз
    measureFooter();
    scrollToBottomSoon();
  }, [isVisibleEmoji, previewFiles.length, measureFooter, scrollToBottomSoon]);

  // ===== выбор файлов (фото/видео/доки) — только предпросмотр, загрузка при отправке
  async function handlePickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const previews = files.map((f) => ({
      file: f,
    }));
    setPreviewFiles((prev) => [...prev, ...previews]);

    e.target.value = '';
  }
  function removePreview(fileToRemove: File) {
    setPreviewFiles((prev) => prev.filter((p) => p.file !== fileToRemove));
  }

  // ===== Микрофон (MediaRecorder) — формируем файл
  const [recState, setRecState] = useState<'idle' | 'recording' | 'saving'>(
    'idle',
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recChunksRef = useRef<BlobPart[]>([]);

  const canRecordAudio =
    typeof window !== 'undefined' &&
    !!(navigator.mediaDevices && (window as any).MediaRecorder);

  async function handleMicClick() {
    if (!canRecordAudio) return;

    if (recState === 'idle') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mr = new MediaRecorder(stream);
        mediaRecorderRef.current = mr;
        recChunksRef.current = [];
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) recChunksRef.current.push(e.data);
        };
        mr.onstop = async () => {
          setRecState('saving');
          try {
            const blob = new Blob(recChunksRef.current, {
              type: mr.mimeType || 'audio/webm',
            });
            const file = new File([blob], `audio_${Date.now()}.webm`, {
              type: blob.type || 'audio/webm',
            });
            setPreviewFiles((prev) => [...prev, { file }]);
          } catch (e) {
            console.error('audio save error', e);
            alert(text('Failed to save audio.'));
          } finally {
            setRecState('idle');
            stream.getTracks().forEach((t) => t.stop());
          }
        };
        mr.start();
        setRecState('recording');
      } catch (e) {
        console.error('mic error', e);
        alert(text('Microphone access is denied.'));
      }
    } else if (recState === 'recording') {
      mediaRecorderRef.current?.stop();
    }
  }

  // Заглушка для отправки сообщения чата
  // В будущем эта функция будет использовать мутацию для обновления поля chat_history в заказе.
  async function sendChatMessage(
    order: Order, // Используем тип Order
    who: 'client' | 'contractor',
    messageText: string,
    files?: File[], // Теперь принимаем File[]
  ): Promise<number[]> { // Возвращаем массив ID файлов
    console.warn('STUB: sendChatMessage is a stub. No actual message is sent or saved.');

    // 1) Имитация загрузки файлов и получение их ID
    const uploadedFileIds: number[] = [];
    if (files) {
      for (const file of files) {
        // Заглушка для получения ID файла
        // В реальной реализации здесь будет API-запрос на загрузку файла,
        // который вернет его ID.
        const fileId = Math.floor(Math.random() * 100000) + 1; // Просто случайный ID
        uploadedFileIds.push(fileId);
        console.log(`STUB: Uploaded file ${file.name} (type: ${file.type}) to ID: ${fileId}`);
      }
    }

    // 2) Создание сообщения с использованием полученных ID файлов
    const author: ChatAuthor = who === 'client' ? 'client' : 'admin';
    const msg = makeMsg(author, messageText, uploadedFileIds.length ? uploadedFileIds : undefined);

    // Пример логирования, имитирующий отправку
    console.log(`STUB: Sent message for order ${order.id}:`, msg);
    // Предполагается, что в будущем здесь будет мутация, которая также будет инвалидировать кэш
    // Например: mutation.mutate({ orderId: order.id, chat_history: newChatHistory });
    return uploadedFileIds;
  }

  const handleSend = async () => {
    const messageText = message.trim();
    const hasFiles = previewFiles.length > 0;
    if (!messageText && !hasFiles) return;
    if (!currentChatOrders?.length) return; // Use the new currentChatOrders

    const order = currentChatOrders[currentChatOrders.length - 1]; // Use the new currentChatOrders
    const role: 'client' | 'contractor' = isUserAuthorized && currentUser.role === UserRole.Contractor ? 'contractor' : 'client';

    // 1) Отправляем сообщение, передавая File объекты напрямую
    await sendChatMessage(
      order,
      role,
      messageText,
      previewFiles.map(({ file }) => file), // Передаем File объекты
    );

    // 2) очистка и перерисовка
    setMessage('');
    setPreviewFiles([]);
    scrollToBottomSoon();
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

  useEffect(() => {
    scrollToBottomSoon();
  }, [currentChatOrders, id, scrollToBottomSoon]); // Зависимость от currentChatOrders

  // Псевдо-вебсокет — опрос каждые 30 секунд
  useEffect(() => {
    const t = setInterval(() => {
      // refetchMessages(); пока не реализовано
      scrollToBottomSoon();
    }, 30000);
    return () => clearInterval(t);
  }, [scrollToBottomSoon]);

  // Helpers last online
  const getTimeSinceLastOnline = (lastTimeBeenOnline: string) => {
    const lastOnline = new Date(lastTimeBeenOnline);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - lastOnline.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return text('just now');
    if (diffInMinutes < 60)
      return `${diffInMinutes} ${getMinutesWord(diffInMinutes)}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${getHoursWord(diffInHours)}`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${getDaysWord(diffInDays)}`;
  };

  // todo: Плюрализацию слов следует перенести в language
  const getMinutesWord = (minutes: number) => {
    const lastDigit = minutes % 10;
    const lastTwo = minutes % 100;
    if (lastTwo < 11 || lastTwo > 14) {
      if (lastDigit === 1) return text('minute (accusative)');
      if (lastDigit >= 2 && lastDigit <= 4) return text('minutes (few)');
    }
    return text('minutes');
  };

  const getHoursWord = (hours: number) => {
    const lastDigit = hours % 10;
    const lastTwo = hours % 100;
    if (lastTwo < 11 || lastTwo > 14) {
      if (lastDigit === 1) return text('hour (singular)');
      if (lastDigit >= 2 && lastDigit <= 4) return text('hours (few)');
    }
    return text('hours');
  };

  const getDaysWord = (days: number) => {
    const lastDigit = days % 10;
    const lastTwo = days % 100;
    if (lastTwo < 11 || lastTwo > 14) {
      if (lastDigit === 1) return text('day (singular)');
      if (lastDigit >= 2 && lastDigit <= 4) return text('days (few)');
    }
    return text('days');
  };

  // Early return for no chat ID
  if (!id) {
    return (
      <section className={styles.container}>
        <FrameMessages />
        <div className={styles.empty_chat}>
          <img src="/img/empty_chat.png" alt="" />
          <p>{text('Please select a conversation to view messages!')}</p>
        </div>
      </section>
    );
  }

  if (!isCurrentUserClient && !isCurrentUserContractor) {
    return null; // Не рендерим компонент, если пользователь не участник чата
  }

  // Если данные второго участника еще не загружены
  if (!chatPartner?.id && chatPartnerId) {
    return (
      <section className={styles.container}>
        <FrameMessages />
        <div className={styles.empty_chat}>
          <img src="/img/empty_chat.png" alt="" />
          <p>{text('Loading chat partner data...')}</p>
        </div>
      </section>
    );
  }

  if (isLoadingOrders || currentChatOrders.length === 0) {
    return (
      <section className={styles.container}>
        <FrameMessages />
        <div className={styles.empty_chat}>
          <img src="/img/empty_chat.png" alt="" />
          <p>{text('Loading orders or no messages in this conversation.')}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      {zayavka__isVisibleDispute ? (
        <DisputeModalV2
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
      {isOkModal ? <OkModal setModalVisible={setVisibleOkModal} /> : null}
      {isDeleteBlockChat ? (
        <DeleteChatModal setModalVisible={setIsDeleteChat} />
      ) : null}
      {isVisibleBlock ? (
        <BlockUser setModalVisible={setIsVisibleBlock} />
      ) : null}
      {isVisibleBlackList ? (
        <BlackListModal setModalVisible={setVisibleBlackList} />
      ) : null}
      {isVisibleAddOrder ? (
        <AddOrderModal
          setVisibleAddOrder={setVisibleAddOrder}
          setVisibleOkModal={setVisibleOkModal}
          currentOrder={currentChatOrders[0]}
        />
      ) : null}

      <section className={styles.container}>
        {id ? (
          <>
            {window.location.href.includes('contractor') ? (
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

        {id ? (
          <div className={`profil fchat__profile ${styles.profil}`}>
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
                style={
                  {
                    // подвинем кнопку выше футера на лету
                    bottom: Math.max(120, footerHeight + 40),
                  } as any
                }
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
                        window.location.href.includes('contractor')
                          ? '/contractor/chat/'
                          : '/client/chat/'
                      }
                      className={`backtoframemessagesLink ${
                        window.location.href.includes('contractor')
                          ? styles.contractor__arrow_back
                          : ''
                      }`}
                    >
                      <img src="/img/chat_back.png" alt="" />
                    </Link>
                    <div style={{ position: 'relative' }}>
                      <div className={styles.dotted_wrap}>
                        <OnlineDotted
                          isVisible={chatPartner?.isOnline}
                        />
                      </div>
                      <img
                        src={chatPartner?.avatar || '/img/img-camera.png'}
                        alt="img absent"
                        style={{ height: 65, width: 66, borderRadius: 30 }}
                      />
                    </div>
                  </div>

                  <div className="nik">
                    <h2 className="eyrqwe">{chatPartner?.name}</h2>
                    <div className="info_nik df">
                      <div className="kiril_info">
                        <h3>
                          {chatPartner?.isOnline
                            ? text('Online')
                            : `${text('Offline')} ${getTimeSinceLastOnline(
                                chatPartner?.lastTimeBeenOnline ||
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
                  {window.location.pathname.includes('/contractor/chat') ? null : (
                    <Dropdown.Item
                      className={styles.item_modile}
                      onClick={() => setVisibleAddOrder(true)}
                    >
                      <img src="/img/icons/review.png" alt="" />
                      {text('Order again')}
                    </Dropdown.Item>
                  )}
                  {window.location.pathname.includes('/contractor/chat') ? null : (
                    <Dropdown.Item className={styles.item}>
                      <img src="/img/icons/review.png" alt="" />
                      {text('Leave a review')}
                    </Dropdown.Item>
                  )}

                  <Dropdown.Item
                    className={styles.item}
                    onClick={() => {
                      // Логика блокировки
                    }}
                  >
                    <img src="/img/icons/block.png" alt="" />
                    {text('Block user')}
                  </Dropdown.Item>
                  <Dropdown.Item
                    className={styles.item}
                    onClick={() => setVisibleBlackList(true)}
                  >
                    <img src="/img/icons/ban.png" alt="" />
                    {text('Blacklist')}
                  </Dropdown.Item>
                  <Dropdown.Item
                    className={styles.item}
                    onClick={() => setIsDeleteChat(true)}
                  >
                    <img src="/img/icons/trash.png" alt="" />
                    {text('Delete chat')}
                  </Dropdown.Item>
                </div>
              </Dropdown>

              {window.location.pathname.includes('/contractor/chat') ? null : (
                <button
                  className={`ordermore inter ${styles.button_more}`}
                  onClick={() => setVisibleAddOrder(true)}
                >
                  {text('Order again')}
                </button>
              )}
            </div>

            <div
              className={`awqervgg chat_block__ashd ${styles.chatt}`}
              ref={chatBlockRef}
            >
              {currentChatOrders.map((order) => (
                <OrderDetailsBlock
                  setBalanceErrorNum={setBalanceErrorNum}
                  setIsBalanceError={setIsBalanceError}
                  setOrderId={setCurrentOrderId}
                  setIsOpenDisput={zayavka__setVisibleDispute}
                  key={order.id}
                  order={order}
                  currentUser={currentUser}
                  partnerUser={chatPartner}
                  viewerIsContractor={isUserAuthorized && currentUser.role === UserRole.Contractor}
                />
              ))}
            </div>

            {/* НИЖНИЙ ФИКСИРОВАННЫЙ ФУТЕР ВВОДА */}
            <div className={styles.message_block} ref={footerRef}>
              <div
                className="block_messages-2 font_inter"
                style={{ paddingTop: 8 }}
              >
                {isBalanceError ? (
                  <div className={styles.balance_error}>
                    <p>
                      {text('Please top up your balance by')} {BalanceErrorNum}{' '}
                      {text('rubles')}
                    </p>
                  </div>
                ) : null}
                {answer ? (
                  <p className="answer_to_message">
                    {text('Reply')}{' '}
                    <span>{text('I can arrive in an hour')}</span>
                    <button onClick={() => Isanswer(false)}>X</button>
                  </p>
                ) : null}
                {edit ? (
                  <p className="answer_to_message">
                    {text('Editing')}{' '}
                    <button onClick={() => Isedit(false)}>X</button>
                  </p>
                ) : null}

                {/* Заглушка для проверки черного списка.
                    Проверяем, заблокировал ли текущий пользователь собеседника. */}
                {isUserAuthorized && currentUser.blackList && currentUser.blackList.includes(chatPartner?.id) ? (
                  <div className={styles.chat_block_wrap}>
                    <img src="/img/icons/chat_block.png" alt="" />
                    <p>
                      {text('You cannot contact this user because you have blocked them')}{' '}
                    </p>
                  </div>
                ) : (
                  // Проверяем, заблокировал ли собеседник текущего пользователя.
                  isUserAuthorized && chatPartner?.blackList && chatPartner.blackList.includes(currentUser.id) ? (
                    <div className={styles.chat_block_wrap}>
                      <img src="/img/icons/chat_block.png" alt="" />
                      <p>
                        {text('You cannot contact this user because they blocked the conversation with you')}{' '}
                      </p>
                    </div>
                  ) : (
                  <>
                    {/* Превью прикреплённых файлов перед отправкой */}
                    {previewFiles.length > 0 && (
                      <div
                        style={{
                          marginTop: 10,
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fill, minmax(120px,1fr))',
                          gap: 10,
                        }}
                      >
                        {previewFiles.map(p => (
                          <div
                            key={getKeyFor(p.file)}
                            style={{
                              position: 'relative',
                              borderRadius: 8,
                              overflow: 'hidden',
                              background: '#f2f2f2',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => removePreview(p.file)}
                              title={text('Remove')}
                              style={{
                                position: 'absolute',
                                right: 6,
                                top: 6,
                                zIndex: 2,
                                border: 0,
                                background: 'rgba(0,0,0,0.55)',
                                color: '#fff',
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                cursor: 'pointer',
                                lineHeight: '24px',
                                textAlign: 'center',
                                fontWeight: 700,
                              }}
                            >
                              ×
                            </button>
                            <AnyMedia
                              src={p.file}
                              style={{
                                width: '100%',
                                height: 120,
                                objectFit: 'cover',
                              }}
                              imageProps={{ alt: p.file.name }}
                              loadingElement={
                                <div
                                  style={{
                                    width: '100%',
                                    height: 120,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 8,
                                    textAlign: 'center',
                                    background: '#f2f2f2',
                                    borderRadius: 8,
                                  }}
                                >
                                  {text('Loading...')}
                                </div>
                              }
                              errorElement={
                                <div
                                  style={{
                                    width: '100%',
                                    height: 120,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: 8,
                                    textAlign: 'center',
                                    background: '#f2f2f2',
                                    borderRadius: 8,
                                    color: 'red',
                                  }}
                                >
                                  {text('Error loading file')}
                                </div>
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className="magnafire-2 df align"
                      style={{ marginTop: 8 }}
                    >
                      <div className="magnafire_input-2" style={{ flex: 1 }}>
                        <input
                          className="inp"
                          type="text"
                          placeholder={text('Enter a message...')}
                          value={message}
                          onChange={handleInputChat}
                          onKeyDown={handleInputKeyDown}
                        />
                      </div>
                      <div className="nav_message df">
                        <div style={{ position: 'relative' }}>
                          {chooseFile ? (
                            <div className="frame_icon qwerewrf">
                              <label className="choice df block_file_attach__flex">
                                <div className="choice_img">
                                  <img
                                    src="/img/chat_img/img.png"
                                    alt="img absent"
                                  />
                                </div>
                                <div className="im_attach pull-left align">
                                  <input
                                    type="file"
                                    accept="image/*,video/*"
                                    className="im_attach_input"
                                    title={text('Photo/Video')}
                                    style={{ display: 'none' }}
                                    onChange={handlePickFiles}
                                  />
                                  <p className="block_file_attach__text">
                                    {text('Photo or video')}
                                  </p>
                                </div>
                              </label>

                              <label className="folder df block_file_attach__flex">
                                <div className="choice_img">
                                  <img
                                    src="/img/chat_img/folder.png"
                                    alt="img absent"
                                  />
                                </div>
                                <div className="im_attach pull-left align">
                                  <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.csv,application/*,text/*"
                                    className="im_attach_input"
                                    title={text('Document')}
                                    style={{ display: 'none' }}
                                    onChange={handlePickFiles}
                                  />
                                  <p className="block_file_attach__text">
                                    {text('Document')}
                                  </p>
                                </div>
                              </label>
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

                        {/* Микрофон */}
                        <button
                          type="button"
                          className={styles.mic_btn}
                          onClick={handleMicClick}
                          disabled={!canRecordAudio || recState === 'saving'}
                          title={
                            !canRecordAudio
                              ? text('Microphone is unavailable in this browser')
                              : recState === 'recording'
                              ? text('Click to stop recording')
                              : text('Record a voice message')
                          }
                          style={{
                            background: 'transparent',
                            border: 0,
                            padding: 0,
                            margin: 0,
                            cursor: !canRecordAudio ? 'not-allowed' : 'pointer',
                            opacity: !canRecordAudio ? 0.4 : 1,
                          }}
                        >
                          <img
                            src="/img/icons/micro.png"
                            alt="mic"
                            style={{
                              filter:
                                recState === 'recording'
                                  ? 'drop-shadow(0 0 6px #d00)'
                                  : 'none',
                            }}
                          />
                        </button>

                        <div style={{ position: 'relative' }}>
                          {isVisibleEmoji ? (
                            <div
                              className={styles.emoji_pos}
                              style={{
                                bottom: Math.max(110, footerHeight + 30),
                              }}
                            >
                              <Suspense fallback={<div className="emoji-loading" />}>
                                <EmojiPickerLazy onEmojiClick={addEmojiToMessage} />
                              </Suspense>
                            </div>
                          ) : null}
                          <label
                            htmlFor="file-input"
                            onClick={() => setIsVisibleEmoji((prev) => !prev)}
                          >
                            <img
                              src="/img/chat_img/emoji.png"
                              alt="img absent"
                            />
                          </label>
                        </div>

                        <div
                          className="plane"
                          onClick={handleSend}
                          role="button"
                          aria-label={text('Send message')}
                        ></div>
                      </div>
                    </div>
                  </>
                  )
                )}
              </div>
            </div>
            {/* /НИЖНИЙ ФИКСИРОВАННЫЙ ФУТЕР ВВОДА */}
          </div>
        ) : (
          <div className={styles.empty_chat}>
            <img src="/img/empty_chat.png" alt="" />
            <p>{text('Please select a conversation to view messages!')}</p>
          </div>
        )}
      </section>
    </>
  );
}

export default ChoiceOfReplenishmentMethodCard;
