import { useEffect, useRef } from 'react';
import '../../../scss/chat.css';
import { useState } from 'react';
import FrameMessages from './frameMessages';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
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
import { useSelector } from 'react-redux';
import { selectUser } from '../../../slices/user.slice';
import appFetch from '../../../utilities/appFetch';
function ChoiceOfReplenishmentMethodCard() {
  const user =
    (Object.values(useSelector(selectUser)?.data?.user || {})[0] as any) ||
    ({} as any);
  const [currentOrder, setCurrentOrder] = useState(null as any);
  const [currentUser, setCurrentUser] = useState(null as any);
  const [masterUser, setMasterUser] = useState(null as any);
  const [visibleTestCancel, setVisibleTestCancel] = useState(false);
  const [visibleTestAcceptItem, setVisibleTestAcceptItem] = useState(false);
  const [visibleTestCancel2, setVisibleTestCancel2] = useState('');
  const [visibleTestCancelOrder2, setVisibleTestCancelOrder2] = useState('');

  const [visibleTestCancel3, setVisibleTestCancel3] = useState('');

  const [isVisibleBlackList, setVisibleBlackList] = useState(false);
  const [isVisibleAddOrder, setVisibleAddOrder] = useState(false);
  const [isVisibleEmoji, setVisibleEmoji] = useState(false);
  const [isVisibleAddFeedback, setVisibleAddFeedback] = useState(false);
  const [isVisibleFinalOrder, setVisibleFinalOrder] = useState(false);
  const [isVisibleDispute, setVisibleDispute] = useState(false);
  const [isVisibleDisputeFinal, setVisibleDisputeFinal] = useState(false);
  const [isVisibleConfirmOrder, setVisibleConfirmOrder] = useState(false);
  const [isVisibleConfirmOrderFinal, setVisibleConfirmOrderFinal] =
    useState(false);
  const [isVisibleModalArbitation, setVisibleModalArbitation] = useState(false);
  const [isVisibleCancelOrder, setVisibleCancelOrder] = useState(false);
  const [isVisibleCancelOrderFinal, setVisibleCancelOrderFinal] =
    useState(false);

  const [isOpenOrder, setOpenOrder] = useState(false);
  const [isOpenPovtor, setOpenPovtor] = useState(false);
  const [isOpenZayavka, setOpenZayavka] = useState(false);
  const [isShowDetailsOrder, setShowDetailsOrder] = useState(false);

  const { id } = useParams();
  useEffect(() => {
    async function fetchOrder() {
      const currentOrder = await appFetch(`/drive/get/${id}`);
      const order = Object.values(currentOrder.data.booking || {})[0] as any;

      await appFetch(`user/${order.u_id}`, {}, true).then((v) =>
        setCurrentUser(Object.values(v.data.user || {})[0] as object),
      );

      await appFetch(`user/${order.b_options.winnerMaster}`, {}, true).then(
        (v) => {
          const currentWinner =
            order.drivers.find(
              (item) =>
                String(item.u_id) === String(order.b_options.winnerMaster),
            ) || {};
          setMasterUser({
            ...(Object.values(v.data.user || {})[0] as object),
            master_req_data: { ...currentWinner.c_options },
          });
        },
      );
      setCurrentOrder(
        Object.values(currentOrder.data.booking || {})[0] as object,
      );
    }
    if (id) fetchOrder();
  }, [id]);
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

  function handleInputChat(event) {
    setMessage(event.target.value);
  }
  const [isVisibleDeleteMessage, setVisibleDeleteMessage] = useState(false);
  const [isOpenDispute, setOpenDispute] = useState(false);
  const [isConfirmOrder, setConfirmOrder] = useState(false);

  const [dispute__isVisibleModal, dispute__SetVisibleModal] = useState(false);
  const [dispute__isVisibleModalFinal, dispute__SetVisibleModalFinal] =
    useState(false);
  const [dispute__isVConfirmOrder, dispute__SetConfirmOrder] = useState(false);

  const [order__isDenyOrder, order__setDenyOrder] = useState(false);

  // const [zayavka__isVisibleDispute, zayavka__SetVisibleDispute] = useState(false)
  const [zayavka__isVisibleModal, zayavka__SetVisibleModal] = useState(false);
  const [zayavka__isVisibleModalFinal, zayavka__SetVisibleModalFinal] =
    useState(false);
  const [zayavka__isConfirmOrder, zayavka__SetConfirmOrder] = useState(false);
  const [zayavka__isOpenDispute, zayavka__setOpenDispute] = useState(false);

  const [zayavka__isVisibleDispute, zayavka__setVisibleDispute] =
    useState(false);
  const [zayavka__isVisibleDisputeFinal, zayavka__setisVisibleDisputeFinal] =
    useState(false);

  const [visibleTestCancelV2, setVisibleTestCancelV3] = useState(false);
  const [visibleTestAcceptV2, setVisibleTestAcceptV2] = useState(false);

  const [isCancelOrderV4, setCancelOrderV4] = useState(false);
  const [isCancelOrderItemV4, setCancelOrderItemV4] = useState(false);

  const [isVisibleCancelOrderV4, setVisibleCancelOrderV4] = useState(false);
  const [isVisibleCancelOrderItemV4, setVisibleCancelOrderItemV4] =
    useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const chatBlockRef = useRef<HTMLDivElement>(null);

  // Функция для прокрутки вниз
  const scrollToBottom = () => {
    if (chatBlockRef.current) {
      chatBlockRef.current.scrollTop = chatBlockRef.current.scrollHeight;
    }
  };

  // Проверка, находимся ли мы внизу страницы
  const handleScroll = () => {
    if (chatBlockRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatBlockRef.current;
      const atBottom = scrollHeight - (scrollTop + clientHeight) > 200;
      setIsAtBottom(atBottom);
    }
  };

  // Добавляем и удаляем слушатель события прокрутки
  useEffect(() => {
    const chatBlock = chatBlockRef.current;

    if (chatBlock) {
      chatBlock.addEventListener('scroll', handleScroll);
      handleScroll(); // Проверяем положение скролла при загрузке
    }

    return () => {
      if (chatBlock) {
        chatBlock.removeEventListener('scroll', handleScroll);
      }
    };
  }, [id]); // Теперь обработчик обновляется при смене чата

  // Стили для кнопки
  // const behaiveStyles: React.CSSProperties = {
  //     position: 'fixed',
  //     bottom: '120px',
  //     borderRadius: '50%',
  //     right: '20px',
  //     width: '40px',
  //     height: '40px',
  //     display: isAtBottom ? 'flex' : 'none', // Показать кнопку, если прокрутили больше чем 200px от низа
  //     justifyContent: 'center',
  //     alignItems: 'center',
  //     background: 'rgb(185, 185, 185)', // Сделаем фон кнопки прозрачным
  //     border: 'none',
  //     cursor: 'pointer',
  //     padding: '0',
  //     boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  //     zIndex: 9999, // Чтобы кнопка была поверх другого контента
  // };

  const imageStyles: React.CSSProperties = {};
  const [isVisibleModalArbitationV5, setVisibleModalArbitationV5] =
    useState(false);
  const [isVisibleModalArbitationItemV5, setVisibleModalArbitationItemV5] =
    useState(false);
  const [isVisibleModalArbitationFinalV5, setVisibleModalArbitationFinalV5] =
    useState(false);
  const [
    isVisibleModalArbitationFinalItemV5,
    setVisibleModalArbitationFinalItemV5,
  ] = useState(false);
  const [isDisputeArbitr, setDisputeArbitr] = useState(false);
  const [isDisputeArbitrItem, setDisputeArbitrItem] = useState(false);

  const [isVisibleBlock, setIsVisibleBlock] = useState(false);
  const [isDeleteBlockChat, setIsDeleteChat] = useState(false);
  const [isOkModal, setVisibleOkModal] = useState(false);
  function formatTimeByHours(hours) {
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

  if ((!currentUser || !currentOrder || !masterUser) && id)
    return 'Загрузка...';
  return (
    <>
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
      {/* `/drive/get/${id}`, {
      token: token,
      u_hash: hash,
      u_a_role: type === 'owner' ? 1 : 2,
      action: 'set_rate',
      value: rate,
    } */}
      {isVisibleAddOrder ? (
        <AddOrderModal
          setVisibleAddOrder={setVisibleAddOrder}
          setVisibleOkModal={setVisibleOkModal}
          currentOrder={currentOrder || {}}
        />
      ) : null}
      {isVisibleAddFeedback ? (
        <AddFeedbackModal
          id={currentOrder.b_id}
          setVisibleAddFeedback={setVisibleAddFeedback}
          setVisibleFinalOrder={setVisibleFinalOrder}
        />
      ) : null}
      {isVisibleFinalOrder ? (
        <FinalOrder setVisibleFinalOrder={setVisibleFinalOrder} />
      ) : null}
      {isVisibleDispute ? (
        <DisputeModal
          setVisibleDispute={setVisibleDispute}
          setVisibleDisputeFinal={setVisibleDisputeFinal}
        />
      ) : null}
      {isVisibleDisputeFinal ? (
        <DisputeFinalModal
          setVisibleDisputeFinal={setVisibleDisputeFinal}
          setOpenDispute={setOpenDispute}
        />
      ) : null}
      {isVisibleConfirmOrder ? (
        <ConfirmOrder
          setVisibleConfirmOrder={setVisibleConfirmOrder}
          setVisibleConfirmOrderFinal={setVisibleConfirmOrderFinal}
        />
      ) : null}
      {isVisibleConfirmOrderFinal ? (
        <ConfirmOrderFinal
          setVisibleConfirmOrderFinal={setVisibleConfirmOrderFinal}
          setConfirmOrder={setConfirmOrder}
        />
      ) : null}
      {isVisibleModalArbitation ? (
        <ModalАrbitration
          setVisibleModalArbitation={setVisibleModalArbitation}
          setVisibleDisputeFinal={setVisibleDisputeFinal}
        />
      ) : null}
      {isVisibleCancelOrder ? (
        <CancelOrder
          setVisibleCancelOrder={setVisibleCancelOrder}
          setVisibleCancelOrderFinal={setVisibleCancelOrderFinal}
        />
      ) : null}

      {dispute__isVisibleModal ? (
        <ConfirmOrderV2
          setVisibleConfirmOrder={dispute__SetVisibleModal}
          setVisibleConfirmOrderFinal={dispute__SetVisibleModalFinal}
        />
      ) : null}
      {dispute__isVisibleModalFinal ? (
        <ConfirmOrderFinalV2
          setVisibleConfirmOrderFinal={dispute__SetVisibleModalFinal}
          setConfirmOrder={dispute__SetConfirmOrder}
        />
      ) : null}

      {zayavka__isVisibleModal ? (
        <ConfirmOrderV3
          setVisibleConfirmOrder={zayavka__SetVisibleModal}
          setVisibleConfirmOrderFinal={zayavka__SetVisibleModalFinal}
        />
      ) : null}
      {zayavka__isVisibleModalFinal ? (
        <ConfirmOrderFinalV3
          setVisibleConfirmOrderFinal={zayavka__SetVisibleModalFinal}
          setConfirmOrder={zayavka__SetConfirmOrder}
        />
      ) : null}
      {zayavka__isVisibleDispute ? (
        <DisputeModalV2
          setVisibleDispute={zayavka__setVisibleDispute}
          setVisibleDisputeFinal={zayavka__setisVisibleDisputeFinal}
        />
      ) : null}
      {zayavka__isVisibleDisputeFinal ? (
        <DisputeFinalModalV2
          setVisibleDisputeFinal={zayavka__setisVisibleDisputeFinal}
          setOpenDispute={zayavka__setOpenDispute}
        />
      ) : null}

      {isVisibleCancelOrderV4 ? (
        <CancelOrderV4
          setVisibleCancelOrder={setVisibleCancelOrderV4}
          setVisibleCancelOrderFinal={setCancelOrderV4}
        />
      ) : null}
      {isVisibleCancelOrderItemV4 ? (
        <CancelOrderItemV4
          setVisibleCancelOrder={setVisibleCancelOrderItemV4}
          setVisibleCancelOrderFinal={setCancelOrderItemV4}
        />
      ) : null}

      {isVisibleModalArbitationV5 ? (
        <ModalАrbitration
          setVisibleModalArbitation={setVisibleModalArbitationV5}
          setVisibleDisputeFinal={setVisibleModalArbitationFinalV5}
        />
      ) : null}
      {isVisibleModalArbitationItemV5 ? (
        <ModalАrbitrationItem
          setVisibleModalArbitation={setVisibleModalArbitationItemV5}
          setVisibleDisputeFinal={setVisibleModalArbitationFinalItemV5}
        />
      ) : null}

      {isVisibleModalArbitationFinalV5 ? (
        <DisputeFinalModalV5
          setVisibleDisputeFinal={setVisibleModalArbitationFinalV5}
          setOpenDispute={setDisputeArbitr}
        />
      ) : null}
      {isVisibleModalArbitationFinalItemV5 ? (
        <DisputeFinalItemModalV5
          setVisibleDisputeFinal={setVisibleModalArbitationFinalItemV5}
          setOpenDispute={setDisputeArbitrItem}
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

        {id ? (
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
                  style={imageStyles}
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
                        <OnlineDotted isVisible={true} />
                      </div>
                      <img
                        src={masterUser.u_photo || '/img/img-camera.png'}
                        alt="img absent"
                        style={{ height: 65, width: 66, borderRadius: 30 }}
                      />
                    </div>
                  </div>

                  <div className="nik">
                    <h2 className="eyrqwe">{masterUser.u_name}</h2>

                    <div className="info_nik df">
                      <div className="kiril_info">
                        <h3>Офлайн 31 минута</h3>
                      </div>
                    </div>

                    {/* <div className="info_nik df">
                                                <div className="kiril_info">
                                                    <h3>
                                                        Информация с настроек
                                                    </h3>
                                                </div>
                                            </div> */}
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
                    <Dropdown.Item
                      className={styles.item}
                      onClick={() => setVisibleAddFeedback(true)}
                    >
                      <img src="/img/icons/review.png" alt="" />
                      Оставить отзыв
                    </Dropdown.Item>
                  )}

                  <Dropdown.Item
                    className={styles.item}
                    onClick={() => {
                      if (
                        currentUser.u_details?.black_list?.find(
                          (item) =>
                            item.id?.toString() ===
                            currentOrder.b_options.winnerMaster.toString(),
                        )
                      )
                        return;

                      updateUser({
                        details: {
                          black_list: [
                            ...(Array.isArray(user?.u_details?.black_list)
                              ? user?.u_details?.black_list
                              : []),
                            {
                              id: currentOrder.b_options.winnerMaster,
                              date: new Date().toISOString(),
                            },
                          ],
                        },
                      });
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
              <div className="right_menu">
                <div className="call_date font_inter chat_date_hover">
                  <div
                    className="cal_date-text df align"
                    style={{ margin: 'auto', justifyContent: 'center' }}
                  >
                    <div className="date_line-left"></div>
                    <div className="date1">
                      <h2>21 АВГ</h2>
                    </div>
                    <div className="date_line-right"></div>
                  </div>
                </div>
              </div>
              <div className="chat_technical_message">
                <div className={`${styles.message_block} ${styles.text_right}`}>
                  <div className="my_chat">
                    <div
                      className="correspondence-active font_inter df"
                      style={{ gap: '10px' }}
                    >
                      <div className="ciril-img">
                        <img
                          src="/img/chat_img/2.png"
                          style={{
                            width: '58px',
                            height: '58px',
                            opacity: '0',
                          }}
                          alt="img absent"
                        />
                      </div>
                      <div className="let">
                        <div
                          className="letter_kiril df"
                          style={{ gap: '10px', justifyContent: 'flex-end' }}
                        >
                          <div
                            className={`viewed_img-2 buttons_edit_message ${styles.btn_row}`}
                          >
                            <img
                              src="/img/chat_img/edid.png"
                              onClick={() => Isedit(true)}
                              alt="img absent"
                            />
                            <div style={{ position: 'relative' }}>
                              {isVisibleDeleteMessage && (
                                <div
                                  className={styles.modal_delete_message}
                                  onClick={() => setVisibleDeleteMessage(false)}
                                >
                                  <img
                                    className="delete_message"
                                    src="/img/icons/delete.png"
                                    alt=""
                                  />
                                  <span>удалить сообщение</span>
                                </div>
                              )}
                              <img
                                className="delete_message"
                                onClick={() => setVisibleDeleteMessage(true)}
                                src="/img/icons/delete.png"
                                alt=""
                              />
                            </div>

                            {/* <img src="/img/chat_img/просмотрено.png" alt="img absent" /> */}
                          </div>
                          <div className="letter_text-2">
                            <h3>13:44</h3>
                          </div>
                          <div className="letter_text-1">
                            <h2>Вы</h2>
                          </div>
                          <img
                            src={user.u_photo || '/img/img-camera.png'}
                            style={{
                              width: '58px',
                              height: '58px',
                              borderRadius: 30,
                            }}
                            alt="img absent"
                          />
                        </div>
                        <div className={styles.block_bid}>
                          <p>
                            Размещен на биржи заказ{' '}
                            <Link
                              to={'/master/requests'}
                              className={styles.block_bid__link}
                            >
                              {currentOrder?.b_options?.title}
                            </Link>
                          </p>
                          <p>
                            Описание клиента{' '}
                            {currentOrder?.b_options?.description}
                          </p>
                          <p>
                            Мастер откликнулся на этот заказ, сделав предложение
                            на сумму {masterUser?.master_req_data?.bind_amount}{' '}
                            рублей.
                          </p>
                          <p>Слова мастера из заказа на бирже! </p>
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
                        <div
                          className="letter_kiril df"
                          style={{ gap: '10px' }}
                        >
                          <div className="letter_text-1">
                            <h2>{masterUser.u_name}</h2>
                          </div>
                          <div className="letter_text-2">
                            <h3>13:44</h3>
                          </div>
                          <div className="right_menu-img df align mini-gap">
                            <img
                              className="ansver"
                              onClick={() => Isanswer(true)}
                              src="/img/chat_img/ответ.png"
                              alt="img absent"
                            />
                            <img
                              src="/img/chat_img/span.png"
                              alt="img absent"
                            />
                            {/* <img className="delete_message" src="/img/icons/delete.png" alt="" /> */}
                          </div>
                        </div>

                        <div
                          className={`${styles.individual_order} ${styles.individual_order2}`}
                        >
                          <div className={styles.individual_order__heading}>
                            <img src="/img/icons/cil_basket.png" alt="" />
                            <p>Индивидуальное предложение заказа</p>
                          </div>

                          <div className={styles.individual_order__block}>
                            <details
                              className={styles.individual_order__details}
                            >
                              <summary
                                className={styles.individual_order__order}
                              >
                                <p style={{ position: 'relative' }}>
                                  Замена экрана на iphone 15 pro
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
                                  {formatTimeByHours(
                                    Number(masterUser.master_req_data.time),
                                  )}
                                </p>
                                <p className={styles.modile_hidden}>
                                  {masterUser.master_req_data.bind_amout}
                                </p>
                              </summary>
                              <div className={styles.individual_order__more}>
                                <p>условия заказа</p>
                                <p>{currentOrder.b_options.title} </p>
                              </div>
                            </details>
                          </div>
                          <div className={styles.individual_order__final}>
                            <p>Итого:</p>
                            <p>
                              {formatTimeByHours(
                                Number(masterUser.master_req_data.time),
                              )}
                            </p>
                            <p>{masterUser.master_req_data.bind_amout} ₽</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* заказ создан */}
                    <div className={styles.create_order}>
                      <img src="/img/icons/box.png" alt="" />
                      <div>
                        <p>Заказ создан</p>
                        <p>
                          Номер заказа{' '}
                          <a
                            className={styles.create_order__link}
                            href="#"
                            onClick={() => setOpenZayavka((prev) => !prev)}
                          >
                            №{currentOrder.b_id}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {isOpenZayavka ? (
                <div className="chat_technical_message">
                  <div
                    className={`${styles.message_block} ${styles.text_left}`}
                  >
                    <div
                      className={`correspondence df font_inter ${styles.create_order__message}`}
                    >
                      <div className="correspondence_ciril df_chat">
                        <div className="ciril-img">
                          <img
                            style={{
                              width: '58px',
                              height: '58px',
                              borderRadius: 30,
                            }}
                            src={masterUser.u_photo || '/img/img-camera.png'}
                            alt="img absent"
                          />
                        </div>
                        <div className="let">
                          <div
                            className="letter_kiril df"
                            style={{ gap: '10px' }}
                          >
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
                            {currentOrder.b_options.title}
                          </p>
                          {/* мини слайдер */}
                          {isShowDetailsOrder ? (
                            <div
                              className={`miniSwiperWrap ${styles.miniSwiperWrap}`}
                            >
                              <MiniSlider />
                            </div>
                          ) : null}
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
                          {formatTimeByHours(
                            Number(masterUser.master_req_data.time),
                          )}
                        </p>
                        <p className={styles.create_order__price}>
                          {masterUser.master_req_data.bind_amount} ₽
                        </p>
                      </div>
                      {isShowDetailsOrder ? (
                        <div className={styles.create_order__dataVisible}>
                          <p>
                            Условия заказа{' '}
                            {currentOrder?.b_options?.description}
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
                            <p>
                              {' '}
                              {formatTimeByHours(
                                Number(masterUser.master_req_data.time),
                              )}
                            </p>
                            <p className={styles.create_order__price}>
                              {masterUser.master_req_data.bind_amount} ₽
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
              {currentOrder?.b_options?.pay_type === 'cash' ||
              !currentOrder?.b_options?.pay_type ? (
                <>
                  {isConfirmOrder || order__isDenyOrder ? null : (
                    <div className="chat_technical_message">
                      <div className={styles.confirm_block}>
                        <button
                          onClick={() => {
                            appFetch(`/drive/get/${currentOrder.b_id}`, {
                              body: {
                                u_a_role: 1,
                                u_id: masterUser.u_id,
                                action: 'set_performer',
                              },
                            }).then((v) => console.log(v));
                            appFetch(`/drive/get/${currentOrder.b_id}`, {
                              body: {
                                u_a_role: 1,
                                action: 'set_complete_state',
                              },
                            }).then((v) => console.log(v));
                            setVisibleConfirmOrderFinal(true);
                          }}
                        >
                          Подтвердить заказ
                        </button>
                        <button onClick={() => order__setDenyOrder(true)}>
                          Отменить заказ
                        </button>
                      </div>
                    </div>
                  )}

                  {isConfirmOrder && (
                    <div className="chat_technical_message">
                      <div>
                        <div className={`${styles.cancel_block}`}>
                          <img src="/img/message_green.png" alt="" />
                          <p>Заказ успешно подтвержден 5:42</p>
                        </div>
                        <div className={styles.add_feedback}>
                          <button onClick={() => setVisibleAddFeedback(true)}>
                            Оставить отзыв
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {order__isDenyOrder && (
                    <div className="chat_technical_message">
                      <div className={styles.cancel_block}>
                        <img src="/img/cansel_message.png" alt="" />
                        <p>Вы предложили отменить заказ 5:42</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {dispute__isVConfirmOrder || isOpenDispute ? null : (
                    <div className="chat_technical_message">
                      <div className={styles.confirm_block}>
                        <button onClick={() => dispute__SetVisibleModal(true)}>
                          Подтвердить заказ
                        </button>
                        <button onClick={() => setVisibleDispute(true)}>
                          Открыть спор
                        </button>
                      </div>
                    </div>
                  )}
                  {isOpenDispute && (
                    <div className="chat_technical_message">
                      <div>
                        <div
                          className={`${styles.message_block} ${styles.text_center}`}
                        >
                          <div className={`${styles.cancel_block}`}>
                            <img src="/img/message_cancel.png" alt="" />
                            <p>Открылся спор по данному заказу 19:08</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {dispute__isVConfirmOrder && (
                <div className="chat_technical_message">
                  <div>
                    <div className={`${styles.cancel_block}`}>
                      <img src="/img/message_green.png" alt="" />
                      <p>Заказ успешно подтвержден 5:42</p>
                    </div>
                    <div className={styles.add_feedback}>
                      <button onClick={() => setVisibleAddFeedback(true)}>
                        Оставить отзыв
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {currentOrder?.b_options?.extra_orders &&
              Array.isArray(currentOrder?.b_options?.extra_orders)
                ? currentOrder?.b_options?.extra_orders
                    .slice(0, 1)
                    .map((item) => (
                      <>
                        {' '}
                        {/* повторая заявка */}
                        <div className="chat_technical_message">
                          <div
                            className={`${styles.message_block} ${styles.text_right}`}
                          >
                            <div className="my_chat">
                              <div
                                className="correspondence-active font_inter df"
                                style={{ gap: '10px' }}
                              >
                                <div className="ciril-img">
                                  <img
                                    src="/img/chat_img/2.png"
                                    style={{
                                      width: '58px',
                                      height: '58px',
                                      opacity: '0',
                                    }}
                                    alt="img absent"
                                  />
                                </div>
                                <div className="let">
                                  <div
                                    className="letter_kiril df"
                                    style={{
                                      gap: '10px',
                                      justifyContent: 'flex-end',
                                    }}
                                  >
                                    <div
                                      className={`viewed_img-2 buttons_edit_message ${styles.btn_row}`}
                                    >
                                      <img
                                        src="/img/chat_img/edid.png"
                                        onClick={() => Isedit(true)}
                                        alt="img absent"
                                      />
                                      <div style={{ position: 'relative' }}>
                                        {isVisibleDeleteMessage && (
                                          <div
                                            className={
                                              styles.modal_delete_message
                                            }
                                            onClick={() =>
                                              setVisibleDeleteMessage(false)
                                            }
                                          >
                                            <img
                                              className="delete_message"
                                              src="/img/icons/delete.png"
                                              alt=""
                                            />
                                            <span>удалить сообщение</span>
                                          </div>
                                        )}
                                        <img
                                          className="delete_message"
                                          onClick={() =>
                                            setVisibleDeleteMessage(true)
                                          }
                                          src="/img/icons/delete.png"
                                          alt=""
                                        />
                                      </div>

                                      {/* <img src="/img/chat_img/просмотрено.png" alt="img absent" /> */}
                                    </div>
                                    <div className="letter_text-2">
                                      <h3>13:44</h3>
                                    </div>
                                    <div className="letter_text-1">
                                      <h2>Вы</h2>
                                    </div>
                                    <img
                                      src={
                                        user.u_photo || '/img/img-camera.png'
                                      }
                                      style={{
                                        width: '58px',
                                        height: '58px',
                                        borderRadius: 30,
                                      }}
                                      alt="img absent"
                                    />
                                  </div>
                                  <div className={styles.block_bid}>
                                    <p>
                                      Размещена повторная заявка{' '}
                                      <a
                                        href="./"
                                        className={styles.block_bid__link}
                                      >
                                        {item.title}
                                      </a>
                                    </p>
                                    <p>Описание клиента {item.description}</p>
                                    <p>
                                      Мастер откликнулся на этот заказ, сделав
                                      предложение на сумму {item.client_price}{' '}
                                      рублей.
                                    </p>
                                    <p>Слова мастера из лк</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* повтор - индивидуальное предложение заявки */}
                        <div className="chat_technical_message">
                          <div
                            className={`${styles.message_block} ${styles.text_left}`}
                          >
                            <div
                              className={`correspondence df font_inter`}
                              style={{ flexDirection: 'column', gap: '10px' }}
                            >
                              <div className="correspondence_ciril df_chat">
                                <div className="ciril-img">
                                  <img
                                    style={{
                                      width: 58,
                                      height: 58,
                                      borderRadius: 30,
                                    }}
                                    src={
                                      masterUser.u_photo ||
                                      '/img/img-camera.png'
                                    }
                                    alt="img absent"
                                  />
                                </div>
                                <div className="let">
                                  <div
                                    className="letter_kiril df"
                                    style={{ gap: '10px' }}
                                  >
                                    <div className="letter_text-1">
                                      <h2>{masterUser.u_name}</h2>
                                    </div>
                                    <div className="letter_text-2">
                                      <h3>13:44</h3>
                                    </div>
                                    <div className="right_menu-img df align mini-gap">
                                      <img
                                        className="ansver"
                                        onClick={() => Isanswer(true)}
                                        src="/img/chat_img/ответ.png"
                                        alt="img absent"
                                      />
                                      <img
                                        src="/img/chat_img/span.png"
                                        alt="img absent"
                                      />
                                      {/* <img className="delete_message" src="/img/icons/delete.png" alt="" /> */}
                                    </div>
                                  </div>

                                  <div
                                    className={`${styles.individual_order} ${styles.individual_order2}`}
                                  >
                                    <div
                                      className={
                                        styles.individual_order__heading
                                      }
                                    >
                                      <img
                                        src="/img/icons/cil_basket.png"
                                        alt=""
                                      />
                                      <p>Индивидуальное предложение заявки</p>
                                    </div>

                                    <div
                                      className={styles.individual_order__block}
                                    >
                                      <details
                                        className={
                                          styles.individual_order__details
                                        }
                                      >
                                        <summary
                                          className={
                                            styles.individual_order__order
                                          }
                                        >
                                          <p style={{ position: 'relative' }}>
                                            {item.title}
                                            {/* мини слайдер */}
                                            <div
                                              className={`miniSwiperWrap miniswiperslideInfo ${styles.miniswiperslideInfo}  ${styles.miniSwiperWrap}`}
                                            >
                                              <MiniSlider />
                                            </div>
                                          </p>
                                          <div
                                            className={
                                              styles.individual_order__arrow
                                            }
                                          >
                                            <img src="/img/bot.png" alt="" />
                                          </div>
                                          <div style={{ flex: 1 }}></div>
                                          <p className={styles.modile_hidden}>
                                            {formatTimeByHours(
                                              Number(item.time),
                                            )}
                                          </p>
                                          <p className={styles.modile_hidden}>
                                            {item.price}
                                          </p>
                                        </summary>
                                        <div
                                          className={
                                            styles.individual_order__more
                                          }
                                        >
                                          <p>условия заказа</p>
                                          <p>{item.description} </p>
                                        </div>
                                      </details>
                                    </div>
                                    <div
                                      className={styles.individual_order__final}
                                    >
                                      <p>Итого:</p>
                                      <p>
                                        {formatTimeByHours(Number(item.time))}
                                      </p>
                                      <p>{item.price} ₽</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* заказ создан */}
                              <div className={styles.create_order}>
                                <img src="/img/icons/box.png" alt="" />
                                <div>
                                  <p>Заявка создана</p>
                                  <p>
                                    Номер заявки{' '}
                                    <a
                                      className={styles.create_order__link}
                                      href="#"
                                      onClick={() =>
                                        setOpenPovtor((prev) => !prev)
                                      }
                                    >
                                      №{item.id || 122}
                                    </a>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {currentOrder?.b_options?.pay_type === 'cash' ||
                        !currentOrder?.b_options?.pay_type ? (
                          <>
                            <div className="chat_technical_message">
                              <div
                                className={`${styles.message_block} ${styles.text_center} ${styles.text_center_col}`}
                              >
                                <div
                                  className={`${styles.cancel_block} ${
                                    visibleTestCancel2 !== 'access'
                                      ? styles.display_none
                                      : null
                                  }`}
                                >
                                  <img src="/img/message_green.png" alt="" />
                                  <p>заявка успешно подтверждена 5:42</p>
                                </div>

                                <div
                                  className={`${styles.cancel_client_confirm} ${
                                    visibleTestCancel2 !== ''
                                      ? styles.display_none
                                      : null
                                  }`}
                                >
                                  <button
                                    onClick={() =>
                                      setVisibleTestCancel2('access')
                                    }
                                  >
                                    Подтвердить заявку
                                  </button>
                                  <button
                                    onClick={() =>
                                      setVisibleTestCancel2('deny')
                                    }
                                  >
                                    Отменить заявку
                                  </button>
                                </div>

                                <div
                                  className={`${styles.cancel_block} ${
                                    visibleTestCancel2 !== 'deny'
                                      ? styles.display_none
                                      : null
                                  }`}
                                >
                                  <img src="/img/cansel_message.png" alt="" />
                                  <p>Вы предложили отменить заявку 5:42</p>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {zayavka__isConfirmOrder ||
                            zayavka__isOpenDispute ? null : (
                              <div className="chat_technical_message">
                                <div className={styles.confirm_block}>
                                  <button
                                    onClick={() =>
                                      zayavka__SetVisibleModal(true)
                                    }
                                  >
                                    Подтвердить заявку
                                  </button>
                                  <button
                                    onClick={() =>
                                      zayavka__setVisibleDispute(true)
                                    }
                                  >
                                    Открыть спор
                                  </button>
                                </div>
                              </div>
                            )}
                            {zayavka__isOpenDispute && (
                              <div className="chat_technical_message">
                                <div>
                                  <div
                                    className={`${styles.message_block} ${styles.text_center}`}
                                  >
                                    <div className={`${styles.cancel_block}`}>
                                      <img
                                        src="/img/message_cancel.png"
                                        alt=""
                                      />
                                      <p>
                                        Открылся спор по данному заказу 19:08
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {zayavka__isConfirmOrder && (
                              <div className="chat_technical_message">
                                <div>
                                  <div className={`${styles.cancel_block}`}>
                                    <img src="/img/message_green.png" alt="" />
                                    <p>Заявка успешно подтверждена 5:42</p>
                                  </div>
                                  <div className={styles.add_feedback}>
                                    <button
                                      onClick={() =>
                                        setVisibleAddFeedback(true)
                                      }
                                    >
                                      Оставить отзыв
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ))
                : null}
              <div className="chat_technical_message">
                <div className={`${styles.message_block} ${styles.text_right}`}>
                  <div className="my_chat">
                    <div
                      className="correspondence-active font_inter df"
                      style={{ gap: '10px' }}
                    >
                      <div className="ciril-img">
                        <img
                          src="/img/chat_img/2.png"
                          style={{
                            width: '58px',
                            height: '58px',
                            opacity: '0',
                          }}
                          alt="img absent"
                        />
                      </div>
                      <div className="let">
                        <div
                          className="letter_kiril df"
                          style={{ gap: '10px', justifyContent: 'flex-end' }}
                        >
                          <div
                            className={`viewed_img-2 buttons_edit_message ${styles.btn_row}`}
                          >
                            <img
                              src="/img/chat_img/edid.png"
                              onClick={() => Isedit(true)}
                              alt="img absent"
                            />
                            <div style={{ position: 'relative' }}>
                              {isVisibleDeleteMessage && (
                                <div
                                  className={styles.modal_delete_message}
                                  onClick={() => setVisibleDeleteMessage(false)}
                                >
                                  <img
                                    className="delete_message"
                                    src="/img/icons/delete.png"
                                    alt=""
                                  />
                                  <span>удалить сообщение</span>
                                </div>
                              )}
                              <img
                                className="delete_message"
                                onClick={() => setVisibleDeleteMessage(true)}
                                src="/img/icons/delete.png"
                                alt=""
                              />
                            </div>

                            {/* <img src="/img/chat_img/просмотрено.png" alt="img absent" /> */}
                          </div>
                          <div className="letter_text-2">
                            <h3>13:44</h3>
                          </div>
                          <div className="letter_text-1">
                            <h2>Вы</h2>
                          </div>
                          <img
                            src="/img/chat_img/2.png"
                            style={{ width: '58px', height: '58px' }}
                            alt="img absent"
                          />
                        </div>
                        <div className={styles.block_bid}>
                          <p>
                            Выбранная модель устройства{' '}
                            <a href="./" className={styles.block_bid__link}>
                              iPhone 15 pro{' '}
                            </a>
                          </p>
                          <p>Перечень работ:</p>
                          <p>Описание клиента ...</p>
                          <p>
                            Мастер откликнулся на этот заказ, сделав предложение
                            на сумму 35 000 рублей.
                          </p>
                          <p>Слова мастера из заявки! </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* индивидуальное предложение заявки */}
              <div className="chat_technical_message">
                <div className={`${styles.message_block} ${styles.text_left}`}>
                  <div
                    className={`correspondence df font_inter`}
                    style={{ flexDirection: 'column', gap: '10px' }}
                  >
                    <div className="correspondence_ciril df_chat">
                      <div className="ciril-img">
                        <img src="/img/chat_img/кирил.png" alt="img absent" />
                      </div>
                      <div className="let">
                        <div
                          className="letter_kiril df"
                          style={{ gap: '10px' }}
                        >
                          <div className="letter_text-1">
                            <h2>Кирилл Воронов</h2>
                          </div>
                          <div className="letter_text-2">
                            <h3>13:44</h3>
                          </div>
                          <div className="right_menu-img df align mini-gap">
                            <img
                              className="ansver"
                              onClick={() => Isanswer(true)}
                              src="/img/chat_img/ответ.png"
                              alt="img absent"
                            />
                            <img
                              src="/img/chat_img/span.png"
                              alt="img absent"
                            />
                            {/* <img className="delete_message" src="/img/icons/delete.png" alt="" /> */}
                          </div>
                        </div>

                        <div
                          className={`${styles.individual_order} ${styles.individual_order2}`}
                        >
                          <div className={styles.individual_order__heading}>
                            <img src="/img/icons/cil_basket.png" alt="" />
                            <p>Индивидуальное предложение заявки</p>
                          </div>

                          <div className={styles.individual_order__block}>
                            <details
                              className={styles.individual_order__details}
                            >
                              <summary
                                className={styles.individual_order__order}
                              >
                                <p style={{ position: 'relative' }}>
                                  Замена экрана на iphone 15 pro
                                  {/* мини слайдер */}
                                  <div
                                    className={`miniSwiperWrap ${styles.miniSwiperWrap}`}
                                  >
                                    {/* <MiniSlider /> */}
                                  </div>
                                </p>
                                <div className={styles.individual_order__arrow}>
                                  <img src="/img/bot.png" alt="" />
                                </div>
                                <div style={{ flex: 1 }}></div>
                                <p className={styles.modile_hidden}>1 день</p>
                                <p className={styles.modile_hidden}>35000</p>
                              </summary>
                              <div className={styles.individual_order__more}>
                                <p>условия заказа</p>
                                <p>
                                  Заменить экран на iphone 15 pro и прописать
                                  трутон и поменять чип{' '}
                                </p>
                              </div>
                            </details>
                          </div>
                          <div className={styles.individual_order__final}>
                            <p>Итого:</p>
                            <p>1 день</p>
                            <p>35000 ₽</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* заказ создан */}
                    <div className={styles.create_order}>
                      <img src="/img/icons/box.png" alt="" />
                      <div>
                        <p>Заявка создана</p>
                        <p>
                          Номер заявки{' '}
                          <a
                            className={styles.create_order__link}
                            href="./"
                            onClick={() => setOpenOrder((prev) => !prev)}
                          >
                            №243
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* заявка создана */}
              {/* <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_center}`}>
                                    <div className={`${styles.create_order} ${styles.create_order_fix}`}>
                                        <img src="/img/icons/box.png" alt="" />
                                        <div>
                                            <p>Заявка создана</p>
                                            <p>Номер заявки <a className={styles.create_order__link} href="./" onClick={() => setOpenOrder(prev => !prev)}>№243</a></p>
                                        </div>
                                    </div>
                                </div>
                            </div> */}

              {/* заявка создана  */}
              {isOpenOrder ? (
                <div className="chat_technical_message">
                  <div
                    className={`${styles.message_block} ${styles.text_left}`}
                  >
                    <div
                      className={`correspondence df font_inter ${styles.create_order__message}`}
                    >
                      <div className="correspondence_ciril df_chat">
                        <div className="ciril-img">
                          <img src="/img/chat_img/кирил.png" alt="img absent" />
                        </div>
                        <div className="let">
                          <div
                            className="letter_kiril df"
                            style={{ gap: '10px' }}
                          >
                            <div className="letter_text-1">
                              <h2>Кирилл Воронов</h2>
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
                            Замена экрана на{' '}
                            <span style={{ color: '#2E9BD9' }}>
                              iPhone 15 pro
                            </span>
                          </p>
                          {/* мини слайдер */}
                          {/* {isShowDetailsOrder ?
                                                        <div className={`miniSwiperWrap ${styles.miniSwiperWrap}`}>
                                                            <MiniSlider />
                                                        </div>
                                                        : null} */}
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
                        <p style={{ whiteSpace: 'nowrap' }}>2 дня</p>
                        <p className={styles.create_order__price}>35000 ₽</p>
                      </div>
                      {isShowDetailsOrder ? (
                        <div className={styles.create_order__dataVisible}>
                          <p>Условия заказа </p>
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
                            <p>2 дня</p>
                            <p className={styles.create_order__price}>
                              35000 ₽
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
              {/* повтор - заявка создана  */}
              {isOpenPovtor ? (
                <div className="chat_technical_message">
                  <div
                    className={`${styles.message_block} ${styles.text_left}`}
                  >
                    <div
                      className={`correspondence df font_inter ${styles.create_order__message}`}
                    >
                      <div className="correspondence_ciril df_chat">
                        <div className="ciril-img">
                          <img src="/img/chat_img/кирил.png" alt="img absent" />
                        </div>
                        <div className="let">
                          <div
                            className="letter_kiril df"
                            style={{ gap: '10px' }}
                          >
                            <div className="letter_text-1">
                              <h2>Кирилл Воронов</h2>
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
                            Замена экрана на{' '}
                            <span style={{ color: '#2E9BD9' }}>
                              iPhone 15 pro
                            </span>
                          </p>
                          {/* мини слайдер */}
                          {isShowDetailsOrder ? (
                            <div
                              className={`miniSwiperWrap ${styles.miniSwiperWrap}`}
                            >
                              <MiniSlider />
                            </div>
                          ) : null}
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
                        <p style={{ whiteSpace: 'nowrap' }}>2 дня</p>
                        <p className={styles.create_order__price}>35000 ₽</p>
                      </div>
                      {isShowDetailsOrder ? (
                        <div className={styles.create_order__dataVisible}>
                          <p>Условия заказа </p>
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
                            <p>2 дня</p>
                            <p className={styles.create_order__price}>
                              35000 ₽
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* предложение повторной заявки */}
              {false && (
                <div className="chat_technical_message">
                  <div
                    className={`${styles.message_block} ${styles.text_left}`}
                  >
                    <div className="correspondence df font_inter">
                      <div className="correspondence_ciril df_chat">
                        <div className="ciril-img">
                          <img src="/img/chat_img/кирил.png" alt="img absent" />
                        </div>
                        <div className="let">
                          <div
                            className="letter_kiril df"
                            style={{ gap: '10px' }}
                          >
                            <div className="letter_text-1">
                              <h2>Кирилл Воронов</h2>
                            </div>
                            <div className="letter_text-2">
                              <h3>13:44</h3>
                            </div>
                            <div className="right_menu-img df align mini-gap">
                              <img
                                className="ansver"
                                onClick={() => Isanswer(true)}
                                src="/img/chat_img/ответ.png"
                                alt="img absent"
                              />
                              <img
                                src="/img/chat_img/span.png"
                                alt="img absent"
                              />
                              {/* <img className="delete_message" src="/img/icons/delete.png" alt="" /> */}
                            </div>
                          </div>

                          <div className={styles.individual_order}>
                            <div className={styles.individual_order__heading}>
                              <img src="/img/icons/cil_basket.png" alt="" />
                              <p>Предложение повторной заявки</p>
                            </div>

                            <div className={styles.individual_order__block}>
                              <details
                                className={styles.individual_order__details}
                              >
                                <summary
                                  className={styles.individual_order__order}
                                >
                                  <p>Замена экрана на iphone 15 pro</p>
                                  <div
                                    className={styles.individual_order__arrow}
                                  >
                                    <img src="/img/bot.png" alt="" />
                                  </div>
                                  <div style={{ flex: 1 }}></div>
                                  <p>1 день</p>
                                  <p>35000</p>
                                </summary>
                                <div className={styles.individual_order__more}>
                                  <p>условия заказа</p>
                                  <p>
                                    Заменить экран на iphone 15 pro и прописать
                                    трутон и поменять чип{' '}
                                  </p>
                                </div>
                              </details>
                            </div>
                            <div className={styles.individual_order__final}>
                              <p>Итого:</p>
                              <p>1 день</p>
                              <p>35000 ₽</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="chat_technical_message">
                <div className={styles.dispute_block}>
                  <p className={styles.dispute_heading}>Клиент открыл спор</p>
                  <div className={styles.dispute_details}>
                    <div className={styles.row_title}>
                      <p>Размещена заявка</p>
                      <Link to="#" className={styles.dispute_link}>
                        Замена экрана на iphone 15 pro
                      </Link>
                    </div>
                    <div className={styles.dispute_description}>
                      <p>Вы наклеили стекло криво! очень плохая работа</p>
                      <div
                        className={`miniSwiperWrap ${styles.miniSwiperWrap}`}
                      >
                        <div className="miniSlider">
                          <SimpleImage />
                        </div>
                      </div>
                    </div>
                  </div>
                  {isCancelOrderItemV4 || isDisputeArbitrItem ? null : (
                    <div className={styles.dispute_row}>
                      <button
                        className={styles.dispute_button}
                        onClick={() => setVisibleCancelOrderItemV4(true)}
                      >
                        Подтвердить отмену заявки
                      </button>
                      <button
                        className={styles.dispute_button}
                        onClick={() => setVisibleModalArbitationItemV5(true)}
                      >
                        Обратиться в арбитраж
                      </button>
                    </div>
                  )}

                  {isCancelOrderItemV4 && (
                    <div className="chat_technical_message">
                      <div
                        className={`${styles.message_block} ${styles.text_center}`}
                      >
                        <div className={styles.cancel_client_block}>
                          <img src="/img/message_cancel.png" alt="" />
                          <div>
                            <p>В работе 17:08</p>
                            <p>Вы отказались от заявки!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isDisputeArbitrItem && (
                    <div className="chat_technical_message">
                      <div
                        className={`${styles.message_block} ${styles.text_center}`}
                      >
                        <div className={`${styles.cancel_block}`}>
                          <img src="/img/message_cancel.png" alt="" />
                          <p>Открылся спор по данному заявки 19:08</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Клиент открыл спор */}
              <div className="chat_technical_message">
                <div className={styles.dispute_block}>
                  <p className={styles.dispute_heading}>Клиент открыл спор</p>
                  <div className={styles.dispute_details}>
                    <div className={styles.row_title}>
                      <p>Размещен на биржи заказ</p>
                      <Link to="#" className={styles.dispute_link}>
                        Замена экрана на iphone 15 pro
                      </Link>
                    </div>
                    <div className={styles.dispute_description}>
                      <p>Вы наклеили стекло криво! очень плохая работа</p>
                      <div
                        className={`miniSwiperWrap ${styles.miniSwiperWrap}`}
                      >
                        <MiniSlider />
                      </div>
                    </div>
                  </div>
                  {isCancelOrderV4 || isDisputeArbitr ? null : (
                    <div className={styles.dispute_row}>
                      <button
                        className={styles.dispute_button}
                        onClick={() => setVisibleCancelOrderV4(true)}
                      >
                        Подтвердить отмену заказа
                      </button>
                      <button
                        className={styles.dispute_button}
                        onClick={() => setVisibleModalArbitationV5(true)}
                      >
                        Обратиться в арбитраж
                      </button>
                    </div>
                  )}

                  {isCancelOrderV4 && (
                    <div className="chat_technical_message">
                      <div
                        className={`${styles.message_block} ${styles.text_center}`}
                      >
                        <div className={styles.cancel_client_block}>
                          <img src="/img/message_cancel.png" alt="" />
                          <div>
                            <p>В работе 17:08</p>
                            <p>Вы отказались от заказа!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isDisputeArbitr && (
                    <div className="chat_technical_message">
                      <div
                        className={`${styles.message_block} ${styles.text_center}`}
                      >
                        <div className={`${styles.cancel_block}`}>
                          <img src="/img/message_cancel.png" alt="" />
                          <p>Открылся спор по данному заказу 19:08</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="chat_technical_message">
                <div className={`${styles.message_block} ${styles.text_left}`}>
                  <div className="correspondence df font_inter">
                    <div className="correspondence_ciril df_chat">
                      <div className="ciril-img">
                        <img src="/img/chat_img/кирил.png" alt="img absent" />
                      </div>
                      <div className="let">
                        <div
                          className="letter_kiril df"
                          style={{ gap: '10px' }}
                        >
                          <div className="letter_text-1">
                            <h2>Кирилл Воронов</h2>
                          </div>
                          <div className="letter_text-2">
                            <h3>13:44</h3>
                          </div>
                          <div className="right_menu-img df align mini-gap">
                            <img
                              className="ansver"
                              onClick={() => Isanswer(true)}
                              src="/img/chat_img/ответ.png"
                              alt="img absent"
                            />
                            <img
                              src="/img/chat_img/span.png"
                              alt="img absent"
                            />
                            {/* <img className="delete_message" src="/img/icons/delete.png" alt="" /> */}
                          </div>
                        </div>
                        <div className="sms df align">
                          <div className="sms_text">
                            <h2>Могу выполнить заказ</h2>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="chat_technical_message">
                <div className={`${styles.message_block} ${styles.text_right}`}>
                  <div className="my_chat">
                    <div
                      className="correspondence-active font_inter df"
                      style={{ gap: '10px' }}
                    >
                      <div className="ciril-img">
                        <img
                          src="/img/chat_img/2.png"
                          style={{
                            width: '58px',
                            height: '58px',
                            opacity: '0',
                          }}
                          alt="img absent"
                        />
                      </div>
                      <div className="let">
                        <div
                          className="letter_kiril df"
                          style={{ gap: '10px', justifyContent: 'flex-end' }}
                        >
                          <div
                            className={`viewed_img-2 buttons_edit_message ${styles.btn_row}`}
                          >
                            <img
                              src="/img/chat_img/edid.png"
                              onClick={() => Isedit(true)}
                              alt="img absent"
                            />
                            <div style={{ position: 'relative' }}>
                              {isVisibleDeleteMessage && (
                                <div
                                  className={styles.modal_delete_message}
                                  onClick={() => setVisibleDeleteMessage(false)}
                                >
                                  <img
                                    className="delete_message"
                                    src="/img/icons/delete.png"
                                    alt=""
                                  />
                                  <span>удалить сообщение</span>
                                </div>
                              )}
                              <img
                                className="delete_message"
                                onClick={() => setVisibleDeleteMessage(true)}
                                src="/img/icons/delete.png"
                                alt=""
                              />
                            </div>

                            {/* <img src="/img/chat_img/просмотрено.png" alt="img absent" /> */}
                          </div>
                          <div className="letter_text-2">
                            <h3>13:44</h3>
                          </div>
                          <div className="letter_text-1">
                            <h2>Вы</h2>
                          </div>
                          <img
                            src="/img/chat_img/2.png"
                            style={{ width: '58px', height: '58px' }}
                            alt="img absent"
                          />
                        </div>
                        <div
                          className="sms_text-3"
                          style={{ marginRight: '60px' }}
                        >
                          <h2>Хорошо, мне подходит</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="message_block">
              {/* <div className="chat_technical_message">
                                    <div className={`${styles.message_block} ${styles.text_left}`}> */}
              <div className="block_messages-2 font_inter">
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

                {/* {console.log(currentUser)} */}
                {/* заблок чат */}
                {currentUser.u_details?.black_list?.find(
                  (item) => item.id?.toString() === user.u_id?.toString(),
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
                        onChange={handleInputChat} //Обновляем текст в инпуте
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

                {/* </div>
                                </div> */}
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
