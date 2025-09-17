import { useEffect, useRef } from "react";
import '../../../scss/chat.css'
import { useState } from 'react'
import FrameMessages from './frameMessages'
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom'
import { useParams } from "react-router-dom";
import styles from './Chat.module.css'
import Dropdown from "react-multilevel-dropdown";
import MiniSlider from "../../miniSlider/MiniSilder";
import BlackListModal from "./BlackListModal";
import BlockUser from "./BlockUser";
import DeleteChatModal from "./DeleteChatModal"
import OkModal from "./OkModal"
import AddOrderModal from "./AddOrderModal";
import AddFeedbackModal from "./AddFeedbackModal";
import FinalOrder from "./FinalOrder";
import DisputeModal from "./DisputeModal";
import DisputeFinalModal from "./DisputeFinalModal";
import ConfirmOrder from "./ConfirmOrder";
import ConfirmOrderFinal from "./ConfirmOrderFinal";

import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import ModalАrbitration from "./ModalАrbitration";
import CancelOrder from "./CancelOrder";
import OnlineDotted from "../../onlineDotted/OnlineDotted";
import ConfirmOrder_v2 from "./ConfirmOrder_v2";
import ConfirmOrderFinal_v2 from "./ConfirmOrderFinal_v2";
import ConfirmOrder_v3 from "./ConfirmOrder_v3";
import ConfirmOrderFinal_v3 from "./ConfirmOrderFinal_v3";
import DisputeModal_v2 from "./DisputeModal_v2";
import DisputeFinalModal_v2 from "./DisputeFinalModal";
import CancelOrder_v4 from "./CancelOrder_v4";
import CancelOrderItem_v4 from "./CancelOrderItem_v4";
import ModalАrbitrationItem from "./ModalАrbitrationItem";
import DisputeFinalModal_v5 from "./DisputeFinalModal_v5";
import DisputeFinalItemModal_v5 from "./DisputeFinalItemModal_v5"
import SimpleImage from "./SimpleImage"
function ChoiceOfReplenishmentMethodCard() {

    const [visibleTestOrder, setVisibleTestOrder] = useState(false)
    const [visibleTestCancel, setVisibleTestCancel] = useState(false)
    const [visibleTestAcceptItem, setVisibleTestAcceptItem] = useState(false);
    const [visibleTestCancel2, setVisibleTestCancel2] = useState("")
    const [visibleTestCancelOrder2, setVisibleTestCancelOrder2] = useState("")

    const [visibleTestCancel3, setVisibleTestCancel3] = useState("")

    const [isVisibleBlackList, setVisibleBlackList] = useState(false)
    const [isVisibleAddOrder, setVisibleAddOrder] = useState(false)
    const [isVisibleEmoji, setVisibleEmoji] = useState(false)
    const [isVisibleAddFeedback, setVisibleAddFeedback] = useState(false)
    const [isVisibleFinalOrder, setVisibleFinalOrder] = useState(false)
    const [isVisibleDispute, setVisibleDispute] = useState(false)
    const [isVisibleDisputeFinal, setVisibleDisputeFinal] = useState(false)
    const [isVisibleConfirmOrder, setVisibleConfirmOrder] = useState(false)
    const [isVisibleConfirmOrderFinal, setVisibleConfirmOrderFinal] = useState(false)
    const [isVisibleModalArbitation, setVisibleModalArbitation] = useState(false)
    const [isVisibleCancelOrder, setVisibleCancelOrder] = useState(false)
    const [isVisibleCancelOrderFinal, setVisibleCancelOrderFinal] = useState(false)


    const [isOpenOrder, setOpenOrder] = useState(false)
    const [isOpenPovtor, setOpenPovtor] = useState(false)
    const [isOpenZayavka, setOpenZayavka] = useState(false)
    const [isShowDetailsOrder, setShowDetailsOrder] = useState(false)

    const { id } = useParams()

    useEffect(() => {
        document.title = 'Чат';
        document.body.style.overflow = 'hidden'
    }, []);


    const [answer, Isanswer] = useState(false)
    const [edit, Isedit] = useState(false)
    const [chooseFile, IschooseFile] = useState(false)


    const [message, setMessage] = useState("");
    function addEmojiToMessage(emoji: EmojiClickData) {
        setMessage((prevMessage) => prevMessage + emoji.emoji);
    }

    function handleInputChat(event) {
        setMessage(event.target.value)
    }

    const [isVisibleDeleteMessage, setVisibleDeleteMessage] = useState(false)
    const [isOpenDispute, setOpenDispute] = useState(false)
    const [isConfirmOrder, setConfirmOrder] = useState(false)

    const [dispute__isVisibleModal, dispute__SetVisibleModal] = useState(false)
    const [dispute__isVisibleModalFinal, dispute__SetVisibleModalFinal] = useState(false)
    const [dispute__isVConfirmOrder, dispute__SetConfirmOrder] = useState(false)

    const [order__isDenyOrder, order__setDenyOrder] = useState(false)

    // const [zayavka__isVisibleDispute, zayavka__SetVisibleDispute] = useState(false)
    const [zayavka__isVisibleModal, zayavka__SetVisibleModal] = useState(false)
    const [zayavka__isVisibleModalFinal, zayavka__SetVisibleModalFinal] = useState(false)
    const [zayavka__isConfirmOrder, zayavka__SetConfirmOrder] = useState(false)
    const [zayavka__isOpenDispute, zayavka__setOpenDispute] = useState(false)

    const [zayavka__isVisibleDispute, zayavka__setVisibleDispute] = useState(false)
    const [zayavka__isVisibleDisputeFinal, zayavka__setisVisibleDisputeFinal] = useState(false)

    const [visibleTestCancel_v2, setVisibleTestCancel_v3] = useState(false)
    const [visibleTestAccept_v2, setVisibleTestAccept_v2] = useState(false);

    const [isCancelOrder_v4, setCancelOrder_v4] = useState(false)
    const [isCancelOrderItem_v4, setCancelOrderItem_v4] = useState(false)

    const [isVisibleCancelOrder_v4, setVisibleCancelOrder_v4] = useState(false)
    const [isVisibleCancelOrderItem_v4, setVisibleCancelOrderItem_v4] = useState(false)
    // Создаем реф для доступа к блоку
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
            console.log('At bottom:', atBottom);
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
    const behaiveStyles: React.CSSProperties = {
        position: 'fixed',
        bottom: '120px',
        borderRadius: '50%',
        right: '20px',
        width: '40px',
        height: '40px',
        display: isAtBottom ? 'flex' : 'none', // Показать кнопку, если прокрутили больше чем 200px от низа
        justifyContent: 'center',
        alignItems: 'center',
        background: 'rgb(185, 185, 185)', // Сделаем фон кнопки прозрачным
        border: 'none',
        cursor: 'pointer',
        padding: '0',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 9999, // Чтобы кнопка была поверх другого контента
    };


    const imageStyles: React.CSSProperties = {
    };
    const [isVisibleModalArbitation_v5, setVisibleModalArbitation_v5] = useState(false)
    const [isVisibleModalArbitationItem_v5, setVisibleModalArbitationItem_v5] = useState(false)
    const [isVisibleModalArbitationFinal_v5, setVisibleModalArbitationFinal_v5] = useState(false)
    const [isVisibleModalArbitationFinalItem_v5, setVisibleModalArbitationFinalItem_v5] = useState(false)
    const [isDisputeArbitr, setDisputeArbitr] = useState(false)
    const [isDisputeArbitrItem, setDisputeArbitrItem] = useState(false)

    const [isVisibleBlock, setIsVisibleBlock] = useState(false);
    const [isDeleteBlockChat, setIsDeleteChat] = useState(false);
    const [isOkModal, setVisibleOkModal] = useState(false);

    return (
        <>
            {isOkModal ? <OkModal setVisibleBlackList={setVisibleOkModal} /> : null}
            {isDeleteBlockChat ? <DeleteChatModal setVisibleBlackList={setIsDeleteChat} /> : null}
            {isVisibleBlock ? <BlockUser setVisibleBlackList={setIsVisibleBlock} /> : null}
            {isVisibleBlackList ? <BlackListModal setVisibleBlackList={setVisibleBlackList} /> : null}
            {isVisibleAddOrder ? <AddOrderModal setVisibleAddOrder={setVisibleAddOrder} setVisibleOkModal={setVisibleOkModal} /> : null}
            {isVisibleAddFeedback ? <AddFeedbackModal setVisibleAddFeedback={setVisibleAddFeedback} setVisibleFinalOrder={setVisibleFinalOrder} /> : null}
            {isVisibleFinalOrder ? <FinalOrder setVisibleFinalOrder={setVisibleFinalOrder} /> : null}
            {isVisibleDispute ? <DisputeModal setVisibleDispute={setVisibleDispute} setVisibleDisputeFinal={setVisibleDisputeFinal} /> : null}
            {isVisibleDisputeFinal ? <DisputeFinalModal setVisibleDisputeFinal={setVisibleDisputeFinal} setOpenDispute={setOpenDispute} /> : null}
            {isVisibleConfirmOrder ? <ConfirmOrder setVisibleConfirmOrder={setVisibleConfirmOrder} setVisibleConfirmOrderFinal={setVisibleConfirmOrderFinal} /> : null}
            {isVisibleConfirmOrderFinal ? <ConfirmOrderFinal setVisibleConfirmOrderFinal={setVisibleConfirmOrderFinal} setConfirmOrder={setConfirmOrder} /> : null}
            {isVisibleModalArbitation ? <ModalАrbitration setVisibleModalArbitation={setVisibleModalArbitation} setVisibleDisputeFinal={setVisibleDisputeFinal} /> : null}
            {isVisibleCancelOrder ? <CancelOrder setVisibleCancelOrder={setVisibleCancelOrder} setVisibleCancelOrderFinal={setVisibleCancelOrderFinal} /> : null}

            {dispute__isVisibleModal ? <ConfirmOrder_v2 setVisibleConfirmOrder={dispute__SetVisibleModal} setVisibleConfirmOrderFinal={dispute__SetVisibleModalFinal} /> : null}
            {dispute__isVisibleModalFinal ? <ConfirmOrderFinal_v2 setVisibleConfirmOrderFinal={dispute__SetVisibleModalFinal} setConfirmOrder={dispute__SetConfirmOrder} /> : null}

            {zayavka__isVisibleModal ? <ConfirmOrder_v3 setVisibleConfirmOrder={zayavka__SetVisibleModal} setVisibleConfirmOrderFinal={zayavka__SetVisibleModalFinal} /> : null}
            {zayavka__isVisibleModalFinal ? <ConfirmOrderFinal_v3 setVisibleConfirmOrderFinal={zayavka__SetVisibleModalFinal} setConfirmOrder={zayavka__SetConfirmOrder} /> : null}
            {zayavka__isVisibleDispute ? <DisputeModal_v2 setVisibleDispute={zayavka__setVisibleDispute} setVisibleDisputeFinal={zayavka__setisVisibleDisputeFinal} /> : null}
            {zayavka__isVisibleDisputeFinal ? <DisputeFinalModal_v2 setVisibleDisputeFinal={zayavka__setisVisibleDisputeFinal} setOpenDispute={zayavka__setOpenDispute} /> : null}

            {isVisibleCancelOrder_v4 ? <CancelOrder_v4 setVisibleCancelOrder={setVisibleCancelOrder_v4} setVisibleCancelOrderFinal={setCancelOrder_v4} /> : null}
            {isVisibleCancelOrderItem_v4 ? <CancelOrderItem_v4 setVisibleCancelOrder={setVisibleCancelOrderItem_v4} setVisibleCancelOrderFinal={setCancelOrderItem_v4} /> : null}

            {isVisibleModalArbitation_v5 ? <ModalАrbitration setVisibleModalArbitation={setVisibleModalArbitation_v5} setVisibleDisputeFinal={setVisibleModalArbitationFinal_v5} /> : null}
            {isVisibleModalArbitationItem_v5 ? <ModalАrbitrationItem setVisibleModalArbitation={setVisibleModalArbitationItem_v5} setVisibleDisputeFinal={setVisibleModalArbitationFinalItem_v5} /> : null}

            {isVisibleModalArbitationFinal_v5 ? <DisputeFinalModal_v5 setVisibleDisputeFinal={setVisibleModalArbitationFinal_v5} setOpenDispute={setDisputeArbitr} /> : null}
            {isVisibleModalArbitationFinalItem_v5 ? <DisputeFinalItemModal_v5 setVisibleDisputeFinal={setVisibleModalArbitationFinalItem_v5} setOpenDispute={setDisputeArbitrItem} /> : null}


            <section className={styles.container} >

                {id ?
                    <>
                        {window.location.href.includes("master")
                            ? <MediaQuery query="(min-device-width: 1615px)">
                                <FrameMessages />
                            </MediaQuery>
                            : <MediaQuery query="(min-device-width: 1300px)">
                                <FrameMessages />
                            </MediaQuery>
                        }
                    </>
                    :
                    <FrameMessages />
                }



                {id ?
                    <div className="profil fchat__profile">
                        <div className={`kiril_profil kiril_profil_fchat df font_inter ${styles.profile_top_row}`}
                             style={{gap: "10px"}}>
                            <div onClick={scrollToBottom}
                                 className={`${styles.scroll_to_bottom} ${isAtBottom ? styles.visible : styles.hidden}`}
                                 aria-label="Scroll down">
                                <img
                                    src="/img/dropdownuser.png"
                                    className="dropdownuser_arrow"
                                    alt="Scroll Down"
                                    style={imageStyles}
                                />
                            </div>
                            <Link to="/profile-number">
                                <div className="kirill df align" style={{gap: "10px"}}>
                                    <div className={`prof_img chatfgetu twerwe ${styles.profile_row}`}>
                                        <Link
                                            to={window.location.href.includes("master")
                                                ? "/master/chat/"
                                                : "/client/chat/"}
                                            className={`backtoframemessagesLink ${window.location.href.includes("master") ? styles.master__arrow_back : null}`}
                                        >
                                            <img src="/img/chat_back.png" alt=""/>
                                        </Link>
                                        <div style={{position: "relative"}}>
                                            <div className={styles.dotted_wrap}>
                                                <OnlineDotted isVisible={true}/>
                                            </div>
                                            <img src="/img/chat_img/кирил.png" alt="no photo"/>
                                        </div>

                                    </div>

                                    <div className="nik">
                                        <h2 className="eyrqwe">
                                            Кирилл Воронов
                                        </h2>

                                        <div className="info_nik df">
                                            <div className="kiril_info">
                                                <h3>
                                                    Офлайн 31 минута
                                                </h3>
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

                            <div style={{flex: 1}}></div>

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
                                    {window.location.pathname.includes("/master/chat")
                                        ? null
                                        : <Dropdown.Item className={styles.item_modile}
                                                         onClick={() => setVisibleAddOrder(true)}>
                                            <img src="/img/icons/review.png" alt=""/>
                                            Заказать ещё
                                        </Dropdown.Item>
                                    }
                                    {window.location.pathname.includes("/master/chat")
                                        ? null
                                        : <Dropdown.Item className={styles.item}
                                                         onClick={() => setVisibleAddFeedback(true)}>
                                            <img src="/img/icons/review.png" alt=""/>
                                            Оставить отзыв
                                        </Dropdown.Item>
                                    }

                                    <Dropdown.Item className={styles.item} onClick={() => setIsVisibleBlock(true)}>
                                        <img src="/img/icons/block.png" alt=""/>
                                        Заблокировать
                                    </Dropdown.Item>
                                    <Dropdown.Item className={styles.item} onClick={() => setVisibleBlackList(true)}>
                                        <img src="/img/icons/ban.png" alt=""/>
                                        Чёрный список
                                    </Dropdown.Item>
                                    <Dropdown.Item className={styles.item} onClick={() => setIsDeleteChat(true)}>
                                        <img src="/img/icons/trash.png" alt=""/>
                                        Удалить чат
                                    </Dropdown.Item>
                                </div>
                            </Dropdown>


                            {window.location.pathname.includes("/master/chat")
                                ? null
                                : <button className={`ordermore inter ${styles.button_more}`}
                                          onClick={() => setVisibleAddOrder(true)}>Заказать еще</button>
                            }

                        </div>

                        <div className="chatt awqervgg chat_block__ashd" ref={chatBlockRef}>
                            <div className="right_menu">

                                <div className="call_date font_inter chat_date_hover">
                                    <div className="cal_date-text df align"
                                         style={{margin: "auto", justifyContent: "center"}}>
                                        <div className="date_line-left"></div>
                                        <div className="date1">
                                            <h2>21 АВГ</h2>
                                        </div>
                                        <div className="date_line-right"></div>
                                    </div>
                                </div>
                                <div className="chat_technical_message">
                                    <div className={`${styles.message_block} ${styles.text_left}`}>
                                        <div className="correspondence font_inter df">
                                            <div className="correspondence_ciril-4 df">
                                                <div className="ciril-img">
                                                    <img src="/img/chat_img/кирил.png" alt="no photo"/>
                                                </div>
                                                <div className="let">
                                                    <div className="letter">
                                                        <div className="letter_kiril-4 df">
                                                            <div className="letter_text-1">
                                                                <h2>Кирилл Воронов</h2>
                                                            </div>
                                                            <div className="letter_text-2">
                                                                <h3>14:02</h3>
                                                            </div>
                                                            <div className="right_menu-img df align mini-gap">
                                                                <img className="ansver" onClick={() => Isanswer(true)}
                                                                     src="/img/chat_img/ответ.png" alt="no photo"/>
                                                                <img src="/img/chat_img/span.png" alt="no photo"/>
                                                                {/* <img className="delete_message" src="/img/icons/delete.png" alt="" /> */}
                                                            </div>
                                                        </div>
                                                        <div className="sms df align">
                                                            <div className="sms_text-2">
                                                                <h2>Смогу приехать через час</h2>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* подтвердить заявку или открыть спор */}
                            {zayavka__isConfirmOrder || zayavka__isOpenDispute ?

                                null
                                :
                                <div className="chat_technical_message">
                                    <div className={styles.confirm_block}>
                                        <button onClick={() => zayavka__SetVisibleModal(true)}>Подтвердить заявку
                                        </button>
                                        <button onClick={() => zayavka__setVisibleDispute(true)}>Открыть спор</button>
                                    </div>
                                </div>
                            }

                            {zayavka__isOpenDispute && (
                                <div className="chat_technical_message">
                                    <div>
                                        <div className={`${styles.message_block} ${styles.text_center}`}>
                                            <div className={`${styles.cancel_block}`}>
                                                <img src="/img/message_cancel.png" alt=""/>
                                                <p>Открылся спор по данному заказу 19:08</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {zayavka__isConfirmOrder && (
                                <div className="chat_technical_message">
                                    <div>
                                        <div className={`${styles.cancel_block}`}>
                                            <img src="/img/message_green.png" alt=""/>
                                            <p>Заявка успешно подтверждена 5:42</p>
                                        </div>
                                        <div className={styles.add_feedback}>
                                            <button onClick={() => setVisibleAddFeedback(true)}>Оставить отзыв</button>
                                        </div>
                                    </div>
                                </div>
                            )
                            }


                            {/* подтвердить заказ или отменить заказ */}
                            {isConfirmOrder || order__isDenyOrder
                                ? null
                                : <div className="chat_technical_message">
                                    <div className={styles.confirm_block}>
                                        <button onClick={() => setVisibleConfirmOrderFinal(true)}>Подтвердить заказ
                                        </button>
                                        <button onClick={() => order__setDenyOrder(true)}>Отменить заказ</button>
                                    </div>
                                </div>
                            }

                            {isConfirmOrder && (
                                <div className="chat_technical_message">
                                    <div>
                                        <div className={`${styles.cancel_block}`}>
                                            <img src="/img/message_green.png" alt=""/>
                                            <p>Заказ успешно подтвержден 5:42</p>
                                        </div>
                                        <div className={styles.add_feedback}>
                                            <button onClick={() => setVisibleAddFeedback(true)}>Оставить отзыв</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {order__isDenyOrder && (
                                <div className="chat_technical_message">
                                    <div className={styles.cancel_block}>
                                        <img src="/img/cansel_message.png" alt=""/>
                                        <p>Вы предложили отменить заказ 5:42</p>
                                    </div>
                                </div>
                            )}


                            {/* подтвердить заказ или открыть спор */}
                            {dispute__isVConfirmOrder || isOpenDispute ?

                                null
                                :
                                <div className="chat_technical_message">
                                    <div className={styles.confirm_block}>
                                        <button onClick={() => dispute__SetVisibleModal(true)}>Подтвердить заказ
                                        </button>
                                        <button onClick={() => setVisibleDispute(true)}>Открыть спор</button>
                                    </div>
                                </div>
                            }

                            {isOpenDispute && (
                                <div className="chat_technical_message">
                                    <div>
                                        <div className={`${styles.message_block} ${styles.text_center}`}>
                                            <div className={`${styles.cancel_block}`}>
                                                <img src="/img/message_cancel.png" alt=""/>
                                                <p>Открылся спор по данному заказу 19:08</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {dispute__isVConfirmOrder && (
                                <div className="chat_technical_message">
                                    <div>
                                        <div className={`${styles.cancel_block}`}>
                                            <img src="/img/message_green.png" alt=""/>
                                            <p>Заказ успешно подтвержден 5:42</p>
                                        </div>
                                        <div className={styles.add_feedback}>
                                            <button onClick={() => setVisibleAddFeedback(true)}>Оставить отзыв</button>
                                        </div>
                                    </div>
                                </div>
                            )
                            }


                            {/*  */}


                            <div className="chat_technical_message">
                                <div
                                    className={`${styles.cancel_block} ${visibleTestCancel3 != "deny" ? styles.display_none : null}`}>
                                    <img src="/img/cansel_message.png" alt=""/>
                                    <p>Вы предложили отменить заявку 5:42</p>
                                </div>

                                <div
                                    className={`${styles.confirm_block} ${visibleTestCancel3 != "" ? styles.display_none : null}`}>
                                    <button onClick={() => setVisibleTestCancel3("access")}>Подтвердить заявку</button>
                                    <button onClick={() => setVisibleTestCancel3("deny")}>Отменить заявку</button>
                                </div>

                                <div className={`${visibleTestCancel3 != "access" ? styles.display_none : null}`}>
                                    <div className={`${styles.cancel_block}`}>
                                        <img src="/img/message_green.png" alt=""/>
                                        <p>Заявка успешно подтверждена 5:42</p>
                                    </div>
                                    <div className={styles.add_feedback}>
                                        <button onClick={() => setVisibleAddFeedback(true)}>Оставить отзыв</button>
                                    </div>
                                </div>
                            </div>

                            {/* открыт спор */}
                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_center}`}>
                                    <div className={`${styles.cancel_block}`}>
                                        <img src="/img/message_cancel.png" alt=""/>
                                        <p>Открылся спор по данной заявке 19:08</p>
                                    </div>
                                </div>
                            </div>

                            {/* открыт спор */}
                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_center}`}>
                                    <div className={`${styles.cancel_block}`}>
                                        <img src="/img/message_cancel.png" alt=""/>
                                        <p>Открылся спор по данному заказу 19:08</p>
                                    </div>
                                </div>
                            </div>

                            {/* открыт спор */}
                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_center}`}>
                                    <div className={styles.cancel_client_block}>
                                        <img src="/img/message_cancel.png" alt=""/>
                                        <div>
                                            <p>В работе 17:08</p>
                                            <p>Вы отказались от заявки!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Исполнитель отказался от заявки */}
                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_center}`}>
                                    <div className={`${styles.cancel_block}`}>
                                        <img src="/img/message_green.png" alt=""/>
                                        <p>Исполнитель отказался от заявки 5:42</p>
                                    </div>
                                </div>
                            </div>

                            {/* Исполнитель отказался от заказа */}
                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_center}`}>
                                    <div className={`${styles.cancel_block}`}>
                                        <img src="/img/message_green.png" alt=""/>
                                        <p>Исполнитель отказался от заказа 5:42</p>
                                    </div>
                                </div>
                            </div>

                            {/* исполнитель согласился на отмену заявки */}
                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_center}`}>
                                    <div className={styles.cancel_block}>
                                        <img src="/img/message_green.png" alt=""/>
                                        <p>Исполнитель согласился на отмену заявки 5:42</p>
                                    </div>
                                    <div className={styles.add_feedback} style={{maxWidth: "750px"}}>
                                        <button onClick={() => setVisibleAddFeedback(true)}>Оставить отзыв</button>
                                    </div>
                                </div>
                            </div>

                            {/* исполнитель согласился на отмену заказа */}
                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_center}`}>
                                    <div className={styles.cancel_block}>
                                        <img src="/img/message_green.png" alt=""/>
                                        <p>Исполнитель согласился на отмену заказа 5:42</p>
                                    </div>
                                    <div className={styles.add_feedback} style={{maxWidth: "750px"}}>
                                        <button onClick={() => setVisibleAddFeedback(true)}>Оставить отзыв</button>
                                    </div>
                                </div>
                            </div>

                            {/* исполнитель согласился на отмену заявки */}
                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_center}`}>
                                    <div className={styles.cancel_block}>
                                        <img src="/img/message_cancel.png" alt=""/>
                                        <p>Исполнитель не согласился на отмену заявки 5:42</p>
                                    </div>
                                </div>
                            </div>

                            {/* заявка успешно подтверждена */}
                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_center}`}>
                                    <div className={styles.cancel_block}>
                                        <img src="/img/message_green.png" alt=""/>
                                        <p>заявка успешно подтверждена 5:42</p>
                                    </div>
                                </div>
                            </div>

                            {/* Заказ успешно подтвержден */}
                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_center}`}>
                                    <div className={styles.cancel_block}>
                                        <img src="/img/message_green.png" alt=""/>
                                        <p>Заказ успешно подтвержден 5:42</p>
                                    </div>
                                </div>
                            </div>

                            {/* клиент предлагает отменить заявку */}
                            <div className="chat_technical_message">
                                <div
                                    className={`${styles.message_block} ${styles.text_center} ${styles.text_center_col}`}>
                                    <div className={styles.cancel_client_block}>
                                        <img src="/img/cansel_message.png" alt=""/>
                                        <div>
                                            <p>В работе 17:08</p>
                                            <p>Клиент предлагает отменить заявку</p>
                                        </div>
                                    </div>
                                    {visibleTestCancel
                                        ? // Вы отказались принимать отмену заявки
                                        <div className={styles.cancel_client_block}>
                                            <img src="/img/message_cancel.png" alt=""/>
                                            <div>
                                                <p>В работе 17:08</p>
                                                <p>Вы отказались принимать отмену заявки</p>
                                            </div>
                                        </div>
                                        : visibleTestAcceptItem ?
                                            <div className={styles.cancel_client_block}>
                                                <img src="/img/message_green.png" alt=""/>
                                                <div>
                                                    <p>В работе 17:08</p>
                                                    <p>Вы приняли отмену заявки</p>
                                                </div>
                                            </div>
                                            :
                                            <div className={styles.cancel_client_confirm}>
                                                <button onClick={() => setVisibleTestAcceptItem(true)}>Подтвердить
                                                    отмену заявки
                                                </button>
                                                <button onClick={() => setVisibleTestCancel(true)}>Нет</button>
                                            </div>
                                    }
                                </div>
                            </div>


                            {/* клиент предлагает отменить заказ */}
                            <div className="chat_technical_message">
                                <div
                                    className={`${styles.message_block} ${styles.text_center} ${styles.text_center_col}`}>
                                    <div className={styles.cancel_client_block}>
                                        <img src="/img/cansel_message.png" alt=""/>
                                        <div>
                                            <p>В работе 17:08</p>
                                            <p>Клиент предлагает отменить заказ</p>
                                        </div>
                                    </div>
                                    {visibleTestCancel_v2
                                        ? // Вы отказались принимать отмену заявки
                                        <div className={styles.cancel_client_block}>
                                            <img src="/img/message_cancel.png" alt=""/>
                                            <div>
                                                <p>В работе 17:08</p>
                                                <p>Вы отказались принимать отмену заказа</p>
                                            </div>
                                        </div>
                                        : visibleTestAccept_v2 ?
                                            <div className={styles.cancel_client_block}>
                                                <img src="/img/message_green.png" alt=""/>
                                                <div>
                                                    <p>В работе 17:08</p>
                                                    <p>Вы приняли отмену заказа</p>
                                                </div>
                                            </div>
                                            :
                                            <div className={styles.cancel_client_confirm}>
                                                <button onClick={() => setVisibleTestAccept_v2(true)}>Подтвердить отмену
                                                    заказа
                                                </button>
                                                <button onClick={() => setVisibleTestCancel_v3(true)}>Нет</button>
                                            </div>
                                    }
                                </div>
                            </div>

                            {/* Исполнитель отказался принимать отмену заявки */}
                            <div className="chat_technical_message">
                                <div
                                    className={`${styles.message_block} ${styles.text_center} ${styles.text_center_col}`}>
                                    <div className={styles.cancel_block}>
                                        <img src="/img/message_cancel.png" alt=""/>
                                        <p>Исполнитель отказался принимать отмену заявки</p>
                                    </div>


                                    {/* Вы отказались принимать отмену заявки */}
                                    <div
                                        className={`${styles.cancel_block} ${visibleTestCancel2 != "access" ? styles.display_none : null}`}>
                                        <img src="/img/message_green.png" alt=""/>
                                        <p>заявка успешно подтверждена 5:42</p>
                                    </div>

                                    <div
                                        className={`${styles.cancel_client_confirm} ${visibleTestCancel2 != "" ? styles.display_none : null}`}>
                                        <button onClick={() => setVisibleTestCancel2("access")}>Подтвердить заявку
                                        </button>
                                        <button onClick={() => setVisibleTestCancel2("deny")}>Отменить заявку</button>
                                    </div>

                                    <div
                                        className={`${styles.cancel_block} ${visibleTestCancel2 != "deny" ? styles.display_none : null}`}>
                                        <img src="/img/cansel_message.png" alt=""/>
                                        <p>Вы предложили отменить заявку 5:42</p>
                                    </div>
                                </div>
                            </div>

                            <div className="chat_technical_message">
                                <div
                                    className={`${styles.message_block} ${styles.text_center} ${styles.text_center_col}`}>
                                    <div className={styles.cancel_block}>
                                        <img src="/img/message_cancel.png" alt=""/>
                                        <p>Исполнитель отказался принимать отмену заказа</p>
                                    </div>


                                    {/* Вы отказались принимать отмену заявки */}
                                    <div
                                        className={`${styles.cancel_block} ${visibleTestCancelOrder2 != "access" ? styles.display_none : null}`}>
                                        <img src="/img/message_green.png" alt=""/>
                                        <p>заказ успешно подтвержден 5:42</p>
                                    </div>

                                    <div
                                        className={`${styles.cancel_client_confirm} ${visibleTestCancelOrder2 != "" ? styles.display_none : null}`}>
                                        <button onClick={() => setVisibleTestCancelOrder2("access")}>Подтвердить заказ
                                        </button>
                                        <button onClick={() => setVisibleTestCancelOrder2("deny")}>Отменить зака
                                        </button>
                                    </div>

                                    <div
                                        className={`${styles.cancel_block} ${visibleTestCancelOrder2 != "deny" ? styles.display_none : null}`}>
                                        <img src="/img/cansel_message.png" alt=""/>
                                        <p>Вы предложили отменить заказ 5:42</p>
                                    </div>
                                </div>
                            </div>


                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_left}`}>
                                    <div className="correspondence df font_inter">
                                        <div className="correspondence_ciril df_chat">
                                            <div className="ciril-img">
                                                <img src="/img/chat_img/кирил.png" alt="no photo"/>
                                            </div>
                                            <div className="let">
                                                <div className="letter_kiril df" style={{gap: "10px"}}>
                                                    <div className="letter_text-1">
                                                        <h2>Кирилл Воронов</h2>
                                                    </div>
                                                    <div className="letter_text-2">
                                                        <h3>13:44</h3>
                                                    </div>
                                                    <div className="right_menu-img df align mini-gap">
                                                        <img className="ansver" onClick={() => Isanswer(true)}
                                                             src="/img/chat_img/ответ.png" alt="no photo"/>
                                                        <img src="/img/chat_img/span.png" alt="no photo"/>
                                                        {/* <img className="delete_message" src="/img/icons/delete.png" alt="" /> */}
                                                    </div>
                                                </div>
                                                <div className="sms df align">
                                                    <div className="sms_text">
                                                        <h2>Стоимость работ будет 2000 рублей</h2>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* сообзение с созданной заявкой v2 (из 2 вида) */}
                            {/*<div className="chat_technical_message">*/}
                            {/*    <div className={`${styles.message_block} ${styles.text_left}`}>*/}
                            {/*        <div className="correspondence df font_inter">*/}
                            {/*            <div className="correspondence_ciril df_chat">*/}
                            {/*                <div className="ciril-img">*/}
                            {/*                    <img src="/img/chat_img/кирил.png" alt="no photo"/>*/}
                            {/*                </div>*/}
                            {/*                <div className="let">*/}
                            {/*                    <div className="letter_kiril df" style={{gap: "10px"}}>*/}
                            {/*                        <div className="letter_text-1">*/}
                            {/*                            <h2>Кирилл Воронов</h2>*/}
                            {/*                        </div>*/}
                            {/*                        <div className="letter_text-2">*/}
                            {/*                            <h3>13:44</h3>*/}
                            {/*                        </div>*/}
                            {/*                        <div className="right_menu-img df align mini-gap">*/}
                            {/*                            <img className="ansver" onClick={() => Isanswer(true)}*/}
                            {/*                                 src="/img/chat_img/ответ.png" alt="no photo"/>*/}
                            {/*                            <img src="/img/chat_img/span.png" alt="no photo"/>*/}
                            {/*                            /!* <img className="delete_message" src="/img/icons/delete.png" alt="" /> *!/*/}
                            {/*                        </div>*/}
                            {/*                    </div>*/}
                            {/*                    <div className={styles.block_bid}>*/}
                            {/*                        <p>Размещен на биржи заказ <a href="#"*/}
                            {/*                                                      className={styles.block_bid__link}>Замена*/}
                            {/*                            экрана на iphone 15 pro </a></p>*/}
                            {/*                        <p>Описание клиента ...</p>*/}
                            {/*                        <p>Мастер откликнулся на этот заказ, сделав предложение на сумму 35*/}
                            {/*                            000 рублей.</p>*/}
                            {/*                        <p>Слова мастера из заказа на бирже! </p>*/}
                            {/*                    </div>*/}
                            {/*                </div>*/}
                            {/*            </div>*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*</div>*/}

                            {/* повторая заявка */}
                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_right}`}>
                                    <div className="my_chat">
                                        <div className="correspondence-active font_inter df" style={{gap: "10px"}}>
                                            <div className="ciril-img">
                                                <img src="/img/chat_img/2.png"
                                                     style={{width: '58px', height: '58px', opacity: '0'}}
                                                     alt="no photo"/>
                                            </div>
                                            <div className="let">
                                                <div className="letter_kiril df"
                                                     style={{gap: "10px", justifyContent: "flex-end"}}>
                                                    <div
                                                        className={`viewed_img-2 buttons_edit_message ${styles.btn_row}`}>
                                                        <img src="/img/chat_img/edid.png"
                                                             onClick={() => Isedit(true)} alt="no photo"/>
                                                        <div style={{position: "relative"}}>
                                                            {isVisibleDeleteMessage &&
                                                                <div className={styles.modal_delete_message}
                                                                     onClick={() => setVisibleDeleteMessage(false)}>
                                                                    <img className="delete_message"
                                                                         src="/img/icons/delete.png" alt=""/>
                                                                    <span>удалить сообщение</span>
                                                                </div>
                                                            }
                                                            <img className="delete_message"
                                                                 onClick={() => setVisibleDeleteMessage(true)}
                                                                 src="/img/icons/delete.png" alt=""/>
                                                        </div>


                                                        {/* <img src="/img/chat_img/просмотрено.png" alt="no photo" /> */}
                                                    </div>
                                                    <div className="letter_text-2">
                                                        <h3>13:44</h3>
                                                    </div>
                                                    <div className="letter_text-1">
                                                        <h2>Вы</h2>
                                                    </div>
                                                    <img src="/img/chat_img/2.png"
                                                         style={{width: '58px', height: '58px'}}
                                                         alt="no photo"/>

                                                </div>
                                                <div className={styles.block_bid}>
                                                    <p>Размещен на биржи заказ <a href="#"
                                                                                  className={styles.block_bid__link}>Замена
                                                        экрана на iphone 15 pro </a></p>
                                                    <p>Описание клиента ...</p>
                                                    <p>Мастер откликнулся на этот заказ, сделав предложение на
                                                        сумму 35
                                                        000 рублей.</p>
                                                    <p>Слова мастера из заказа на бирже! </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* индивидуальное предложение заказа */}
                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_left}`}>
                                    <div className={`correspondence df font_inter`}
                                         style={{flexDirection: "column", gap: "10px"}}>
                                        <div className="correspondence_ciril df_chat">
                                            <div className="ciril-img">
                                                <img src="/img/chat_img/кирил.png" alt="no photo"/>
                                            </div>
                                            <div className="let">
                                                <div className="letter_kiril df" style={{gap: "10px"}}>
                                                    <div className="letter_text-1">
                                                        <h2>Кирилл Воронов</h2>
                                                    </div>
                                                    <div className="letter_text-2">
                                                        <h3>13:44</h3>
                                                    </div>
                                                    <div className="right_menu-img df align mini-gap">
                                                        <img className="ansver" onClick={() => Isanswer(true)}
                                                             src="/img/chat_img/ответ.png" alt="no photo"/>
                                                        <img src="/img/chat_img/span.png" alt="no photo"/>
                                                        {/* <img className="delete_message" src="/img/icons/delete.png" alt="" /> */}
                                                    </div>
                                                </div>

                                                <div
                                                    className={`${styles.individual_order} ${styles.individual_order2}`}>
                                                    <div className={styles.individual_order__heading}>
                                                        <img src="/img/icons/cil_basket.png" alt=""/>
                                                        <p>Индивидуальное предложение заказа</p>
                                                    </div>

                                                    <div className={styles.individual_order__block}>
                                                        <details className={styles.individual_order__details}>
                                                            <summary className={styles.individual_order__order}>
                                                                <p style={{position: "relative"}}>Замена экрана на
                                                                    iphone 15 pro

                                                                    {/* мини слайдер */}
                                                                    <div
                                                                        className={`miniSwiperWrap miniswiperslideInfo ${styles.miniswiperslideInfo} ${styles.miniSwiperWrap}`}>
                                                                        <MiniSlider/>
                                                                    </div>
                                                                </p>
                                                                <div className={styles.individual_order__arrow}><img
                                                                    src="/img/bot.png" alt=""/></div>
                                                                <div style={{flex: 1}}></div>
                                                                <p className={styles.modile_hidden}>1 день</p>
                                                                <p className={styles.modile_hidden}>35000</p>
                                                            </summary>
                                                            <div className={styles.individual_order__more}>
                                                                <p>условия заказа</p>
                                                                <p>Заменить экран на iphone 15 pro и прописать трутон и
                                                                    поменять чип </p>
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
                                            <img src="/img/icons/box.png" alt=""/>
                                            <div>
                                                <p>Заказ создан</p>
                                                <p>Номер заказа <a className={styles.create_order__link} href="#"
                                                                   onClick={() => setOpenZayavka(prev => !prev)}>№243</a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* заказ создан  */}
                            {isOpenZayavka ?
                                <div className="chat_technical_message">
                                    <div className={`${styles.message_block} ${styles.text_left}`}>
                                        <div className={`correspondence df font_inter ${styles.create_order__message}`}>
                                            <div className="correspondence_ciril df_chat">
                                                <div className="ciril-img">
                                                    <img src="/img/chat_img/кирил.png" alt="no photo"/>
                                                </div>
                                                <div className="let">
                                                    <div className="letter_kiril df" style={{gap: "10px"}}>
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
                                                <div style={{flex: 1}}></div>
                                                <p>Кол-во</p>
                                                <p>Срок</p>
                                                <p>Стоимость</p>
                                            </div>
                                            <div className={styles.create_order__data}>
                                                <div style={{position: "relative"}}><p
                                                    style={{position: "relative"}}>Замена экрана на iphone 15 pro</p>
                                                    {/* мини слайдер */}
                                                    {isShowDetailsOrder ?
                                                        <div className={`miniSwiperWrap ${styles.miniSwiperWrap}`}>
                                                            <MiniSlider/>
                                                        </div>
                                                        : null}
                                                    {!isShowDetailsOrder ?
                                                        <img onClick={() => setShowDetailsOrder(true)}
                                                             style={{marginLeft: "10px", cursor: "pointer"}}
                                                             src="/img/bot.png" alt=""/> : null}

                                                </div>
                                                <div style={{flex: 1}}></div>
                                                <p>1</p>
                                                <p style={{whiteSpace: "nowrap"}}>2 дня</p>
                                                <p className={styles.create_order__price}>35000 ₽</p>
                                            </div>
                                            {isShowDetailsOrder ?
                                                <div className={styles.create_order__data_visible}>
                                                    <p>Условия заказа </p>
                                                    <p>Свернуть
                                                        <img style={{
                                                            marginLeft: "10px",
                                                            cursor: "pointer",
                                                            rotate: "180deg"
                                                        }} onClick={() => setShowDetailsOrder(false)} src="/img/bot.png"
                                                             alt=""/>
                                                    </p>
                                                    <div className={styles.create_order__line}/>
                                                    <div className={styles.create_order__final}>
                                                        <p>Итого:</p>
                                                        <p>2 дня</p>
                                                        <p className={styles.create_order__price}>35000 ₽</p>
                                                    </div>
                                                </div>
                                                : null}
                                        </div>
                                    </div>
                                </div>
                                : null}

                            {/* сообщение с созданной заявкой */}
                            {/*<div className="chat_technical_message">*/}
                            {/*    <div className={`${styles.message_block} ${styles.text_left}`}>*/}
                            {/*        <div className="correspondence df font_inter">*/}
                            {/*            <div className="correspondence_ciril df_chat">*/}
                            {/*                <div className="ciril-img">*/}
                            {/*                    <img src="/img/chat_img/кирил.png" alt="no photo"/>*/}
                            {/*                </div>*/}
                            {/*                <div className="let">*/}
                            {/*                    <div className="letter_kiril df" style={{gap: "10px"}}>*/}
                            {/*                        <div className="letter_text-1">*/}
                            {/*                            <h2>Кирилл Воронов</h2>*/}
                            {/*                        </div>*/}
                            {/*                        <div className="letter_text-2">*/}
                            {/*                            <h3>13:44</h3>*/}
                            {/*                        </div>*/}
                            {/*                        <div className="right_menu-img df align mini-gap">*/}
                            {/*                            <img className="ansver" onClick={() => Isanswer(true)}*/}
                            {/*                                 src="/img/chat_img/ответ.png" alt="no photo"/>*/}
                            {/*                            <img src="/img/chat_img/span.png" alt="no photo"/>*/}
                            {/*                            /!* <img className="delete_message" src="/img/icons/delete.png" alt="" /> *!/*/}
                            {/*                        </div>*/}
                            {/*                    </div>*/}
                            {/*                    <div className={styles.block_bid}>*/}
                            {/*                        <p>Выбранная модель устройства <a href="#"*/}
                            {/*                                                          className={styles.block_bid__link}>iPhone*/}
                            {/*                            15 pro </a></p>*/}
                            {/*                        <p>Перечень работ:</p>*/}
                            {/*                        <p>Описание клиента ...</p>*/}
                            {/*                        <p>Мастер откликнулся на этот заказ, сделав предложение на сумму 35*/}
                            {/*                            000 рублей.</p>*/}
                            {/*                        <p>Слова мастера из заявки! </p>*/}
                            {/*                    </div>*/}
                            {/*                </div>*/}
                            {/*            </div>*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*</div>*/}

                            {/* повторая заявка */}
                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_right}`}>
                                    <div className="my_chat">
                                        <div className="correspondence-active font_inter df" style={{gap: "10px"}}>
                                            <div className="ciril-img">
                                                <img src="/img/chat_img/2.png"
                                                     style={{width: '58px', height: '58px', opacity: '0'}}
                                                     alt="no photo"/>
                                            </div>
                                            <div className="let">
                                                <div className="letter_kiril df"
                                                     style={{gap: "10px", justifyContent: "flex-end"}}>
                                                    <div
                                                        className={`viewed_img-2 buttons_edit_message ${styles.btn_row}`}>
                                                        <img src="/img/chat_img/edid.png"
                                                             onClick={() => Isedit(true)} alt="no photo"/>
                                                        <div style={{position: "relative"}}>
                                                            {isVisibleDeleteMessage &&
                                                                <div className={styles.modal_delete_message}
                                                                     onClick={() => setVisibleDeleteMessage(false)}>
                                                                    <img className="delete_message"
                                                                         src="/img/icons/delete.png" alt=""/>
                                                                    <span>удалить сообщение</span>
                                                                </div>
                                                            }
                                                            <img className="delete_message"
                                                                 onClick={() => setVisibleDeleteMessage(true)}
                                                                 src="/img/icons/delete.png" alt=""/>
                                                        </div>


                                                        {/* <img src="/img/chat_img/просмотрено.png" alt="no photo" /> */}
                                                    </div>
                                                    <div className="letter_text-2">
                                                        <h3>13:44</h3>
                                                    </div>
                                                    <div className="letter_text-1">
                                                        <h2>Вы</h2>
                                                    </div>
                                                    <img src="/img/chat_img/2.png"
                                                         style={{width: '58px', height: '58px'}}
                                                         alt="no photo"/>

                                                </div>
                                                <div className={styles.block_bid}>
                                                    <p>Выбранная модель устройства <a href="#"
                                                                                      className={styles.block_bid__link}>iPhone
                                                        15 pro </a></p>
                                                    <p>Перечень работ:</p>
                                                    <p>Описание клиента ...</p>
                                                    <p>Мастер откликнулся на этот заказ, сделав предложение на сумму
                                                        35
                                                        000 рублей.</p>
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
                                    <div className={`correspondence df font_inter`}
                                         style={{flexDirection: "column", gap: "10px"}}>
                                        <div className="correspondence_ciril df_chat">
                                            <div className="ciril-img">
                                                <img src="/img/chat_img/кирил.png" alt="no photo"/>
                                            </div>
                                            <div className="let">
                                                <div className="letter_kiril df" style={{gap: "10px"}}>
                                                    <div className="letter_text-1">
                                                        <h2>Кирилл Воронов</h2>
                                                    </div>
                                                    <div className="letter_text-2">
                                                        <h3>13:44</h3>
                                                    </div>
                                                    <div className="right_menu-img df align mini-gap">
                                                        <img className="ansver" onClick={() => Isanswer(true)}
                                                             src="/img/chat_img/ответ.png" alt="no photo"/>
                                                        <img src="/img/chat_img/span.png" alt="no photo"/>
                                                        {/* <img className="delete_message" src="/img/icons/delete.png" alt="" /> */}
                                                    </div>
                                                </div>

                                                <div
                                                    className={`${styles.individual_order} ${styles.individual_order2}`}>
                                                    <div className={styles.individual_order__heading}>
                                                        <img src="/img/icons/cil_basket.png" alt=""/>
                                                        <p>Индивидуальное предложение заявки</p>
                                                    </div>

                                                    <div className={styles.individual_order__block}>
                                                        <details className={styles.individual_order__details}>
                                                            <summary className={styles.individual_order__order}>
                                                                <p style={{position: "relative"}}>Замена экрана на
                                                                    iphone 15 pro

                                                                    {/* мини слайдер */}
                                                                    <div
                                                                        className={`miniSwiperWrap ${styles.miniSwiperWrap}`}>
                                                                        {/* <MiniSlider /> */}
                                                                    </div>
                                                                </p>
                                                                <div className={styles.individual_order__arrow}><img
                                                                    src="/img/bot.png" alt=""/></div>
                                                                <div style={{flex: 1}}></div>
                                                                <p className={styles.modile_hidden}>1 день</p>
                                                                <p className={styles.modile_hidden}>35000</p>
                                                            </summary>
                                                            <div className={styles.individual_order__more}>
                                                                <p>условия заказа</p>
                                                                <p>Заменить экран на iphone 15 pro и прописать трутон и
                                                                    поменять чип </p>
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
                                            <img src="/img/icons/box.png" alt=""/>
                                            <div>
                                                <p>Заявка создана</p>
                                                <p>Номер заявки <a className={styles.create_order__link} href="#"
                                                                   onClick={() => setOpenOrder(prev => !prev)}>№243</a>
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
                                            <p>Номер заявки <a className={styles.create_order__link} href="#" onClick={() => setOpenOrder(prev => !prev)}>№243</a></p>
                                        </div>
                                    </div>
                                </div>
                            </div> */}


                            {/* заявка создана  */}
                            {isOpenOrder ?
                                <div className="chat_technical_message">
                                    <div className={`${styles.message_block} ${styles.text_left}`}>
                                        <div className={`correspondence df font_inter ${styles.create_order__message}`}>
                                            <div className="correspondence_ciril df_chat">
                                                <div className="ciril-img">
                                                    <img src="/img/chat_img/кирил.png" alt="no photo"/>
                                                </div>
                                                <div className="let">
                                                    <div className="letter_kiril df" style={{gap: "10px"}}>
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
                                                <div style={{flex: 1}}></div>
                                                <p>Кол-во</p>
                                                <p>Срок</p>
                                                <p>Стоимость</p>
                                            </div>
                                            <div className={styles.create_order__data}>
                                                <div style={{position: "relative"}}><p
                                                    style={{position: "relative"}}>Замена экрана на <span
                                                    style={{color: "#2E9BD9"}}>iPhone 15 pro</span></p>
                                                    {/* мини слайдер */}
                                                    {/* {isShowDetailsOrder ?
                                                        <div className={`miniSwiperWrap ${styles.miniSwiperWrap}`}>
                                                            <MiniSlider />
                                                        </div>
                                                        : null} */}
                                                    {!isShowDetailsOrder ?
                                                        <img onClick={() => setShowDetailsOrder(true)}
                                                             style={{marginLeft: "10px", cursor: "pointer"}}
                                                             src="/img/bot.png" alt=""/> : null}

                                                </div>
                                                <div style={{flex: 1}}></div>
                                                <p>1</p>
                                                <p style={{whiteSpace: "nowrap"}}>2 дня</p>
                                                <p className={styles.create_order__price}>35000 ₽</p>
                                            </div>
                                            {isShowDetailsOrder ?
                                                <div className={styles.create_order__data_visible}>
                                                    <p>Условия заказа </p>
                                                    <p>Свернуть
                                                        <img style={{
                                                            marginLeft: "10px",
                                                            cursor: "pointer",
                                                            rotate: "180deg"
                                                        }} onClick={() => setShowDetailsOrder(false)} src="/img/bot.png"
                                                             alt=""/>
                                                    </p>
                                                    <div className={styles.create_order__line}/>
                                                    <div className={styles.create_order__final}>
                                                        <p>Итого:</p>
                                                        <p>2 дня</p>
                                                        <p className={styles.create_order__price}>35000 ₽</p>
                                                    </div>
                                                </div>
                                                : null}
                                        </div>
                                    </div>
                                </div>
                                : null}

                            {/* повторая заявка */}
                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_right}`}>
                                    <div className="my_chat">
                                        <div className="correspondence-active font_inter df" style={{gap: "10px"}}>
                                            <div className="ciril-img">
                                                <img src="/img/chat_img/2.png"
                                                     style={{width: '58px', height: '58px', opacity: '0'}}
                                                     alt="no photo"/>
                                            </div>
                                            <div className="let">
                                                <div className="letter_kiril df"
                                                     style={{gap: "10px", justifyContent: "flex-end"}}>
                                                    <div
                                                        className={`viewed_img-2 buttons_edit_message ${styles.btn_row}`}>
                                                        <img src="/img/chat_img/edid.png"
                                                             onClick={() => Isedit(true)} alt="no photo"/>
                                                        <div style={{position: "relative"}}>
                                                            {isVisibleDeleteMessage &&
                                                                <div className={styles.modal_delete_message}
                                                                     onClick={() => setVisibleDeleteMessage(false)}>
                                                                    <img className="delete_message"
                                                                         src="/img/icons/delete.png" alt=""/>
                                                                    <span>удалить сообщение</span>
                                                                </div>
                                                            }
                                                            <img className="delete_message"
                                                                 onClick={() => setVisibleDeleteMessage(true)}
                                                                 src="/img/icons/delete.png" alt=""/>
                                                        </div>


                                                        {/* <img src="/img/chat_img/просмотрено.png" alt="no photo" /> */}
                                                    </div>
                                                    <div className="letter_text-2">
                                                        <h3>13:44</h3>
                                                    </div>
                                                    <div className="letter_text-1">
                                                        <h2>Вы</h2>
                                                    </div>
                                                    <img src="/img/chat_img/2.png"
                                                         style={{width: '58px', height: '58px'}}
                                                         alt="no photo"/>

                                                </div>
                                                <div className={styles.block_bid}>
                                                    <p>Размещена повторная заявка <a href="#"
                                                                                     className={styles.block_bid__link}>Замена
                                                        экрана на iphone 15 pro </a></p>
                                                    <p>Описание клиента ...</p>
                                                    <p>Мастер откликнулся на этот заказ, сделав предложение на сумму 35
                                                        000 рублей.</p>
                                                    <p>Слова мастера из лк</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* повтор - индивидуальное предложение заявки */}
                            <div className="chat_technical_message">
                                <div className={`${styles.message_block} ${styles.text_left}`}>
                                    <div className={`correspondence df font_inter`}
                                         style={{flexDirection: "column", gap: "10px"}}>
                                        <div className="correspondence_ciril df_chat">
                                            <div className="ciril-img">
                                                <img src="/img/chat_img/кирил.png" alt="no photo"/>
                                            </div>
                                            <div className="let">
                                                <div className="letter_kiril df" style={{gap: "10px"}}>
                                                    <div className="letter_text-1">
                                                        <h2>Кирилл Воронов</h2>
                                                    </div>
                                                    <div className="letter_text-2">
                                                        <h3>13:44</h3>
                                                    </div>
                                                    <div className="right_menu-img df align mini-gap">
                                                        <img className="ansver" onClick={() => Isanswer(true)}
                                                             src="/img/chat_img/ответ.png" alt="no photo"/>
                                                        <img src="/img/chat_img/span.png" alt="no photo"/>
                                                        {/* <img className="delete_message" src="/img/icons/delete.png" alt="" /> */}
                                                    </div>
                                                </div>

                                                <div
                                                    className={`${styles.individual_order} ${styles.individual_order2}`}>
                                                    <div className={styles.individual_order__heading}>
                                                        <img src="/img/icons/cil_basket.png" alt=""/>
                                                        <p>Индивидуальное предложение заявки</p>
                                                    </div>

                                                    <div className={styles.individual_order__block}>
                                                        <details className={styles.individual_order__details}>
                                                            <summary className={styles.individual_order__order}>
                                                                <p style={{position: "relative"}}>Замена экрана на
                                                                    iphone 15 pro

                                                                    {/* мини слайдер */}
                                                                    <div
                                                                        className={`miniSwiperWrap miniswiperslideInfo ${styles.miniswiperslideInfo}  ${styles.miniSwiperWrap}`}>
                                                                        <MiniSlider/>
                                                                    </div>
                                                                </p>
                                                                <div className={styles.individual_order__arrow}><img
                                                                    src="/img/bot.png" alt=""/></div>
                                                                <div style={{flex: 1}}></div>
                                                                <p className={styles.modile_hidden}>1 день</p>
                                                                <p className={styles.modile_hidden}>35000</p>
                                                            </summary>
                                                            <div className={styles.individual_order__more}>
                                                                <p>условия заказа</p>
                                                                <p>Заменить экран на iphone 15 pro и прописать трутон и
                                                                    поменять чип </p>
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
                                            <img src="/img/icons/box.png" alt=""/>
                                            <div>
                                                <p>Заявка создана</p>
                                                <p>Номер заявки <a className={styles.create_order__link} href="#"
                                                                   onClick={() => setOpenPovtor(prev => !prev)}>№243</a>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* повтор - заявка создана  */}
                            {isOpenPovtor ?
                                <div className="chat_technical_message">
                                    <div className={`${styles.message_block} ${styles.text_left}`}>
                                        <div className={`correspondence df font_inter ${styles.create_order__message}`}>
                                            <div className="correspondence_ciril df_chat">
                                                <div className="ciril-img">
                                                    <img src="/img/chat_img/кирил.png" alt="no photo"/>
                                                </div>
                                                <div className="let">
                                                    <div className="letter_kiril df" style={{gap: "10px"}}>
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
                                                <div style={{flex: 1}}></div>
                                                <p>Кол-во</p>
                                                <p>Срок</p>
                                                <p>Стоимость</p>
                                            </div>
                                            <div className={styles.create_order__data}>
                                                <div style={{position: "relative"}}><p
                                                    style={{position: "relative"}}>Замена экрана на <span
                                                    style={{color: "#2E9BD9"}}>iPhone 15 pro</span></p>
                                                    {/* мини слайдер */}
                                                    {isShowDetailsOrder ?
                                                        <div className={`miniSwiperWrap ${styles.miniSwiperWrap}`}>
                                                            <MiniSlider/>
                                                        </div>
                                                        : null}
                                                    {!isShowDetailsOrder ?
                                                        <img onClick={() => setShowDetailsOrder(true)}
                                                             style={{marginLeft: "10px", cursor: "pointer"}}
                                                             src="/img/bot.png" alt=""/> : null}

                                                </div>
                                                <div style={{flex: 1}}></div>
                                                <p>1</p>
                                                <p style={{whiteSpace: "nowrap"}}>2 дня</p>
                                                <p className={styles.create_order__price}>35000 ₽</p>
                                            </div>
                                            {isShowDetailsOrder ?
                                                <div className={styles.create_order__data_visible}>
                                                    <p>Условия заказа </p>
                                                    <p>Свернуть
                                                        <img style={{
                                                            marginLeft: "10px",
                                                            cursor: "pointer",
                                                            rotate: "180deg"
                                                        }} onClick={() => setShowDetailsOrder(false)} src="/img/bot.png"
                                                             alt=""/>
                                                    </p>
                                                    <div className={styles.create_order__line}/>
                                                    <div className={styles.create_order__final}>
                                                        <p>Итого:</p>
                                                        <p>2 дня</p>
                                                        <p className={styles.create_order__price}>35000 ₽</p>
                                                    </div>
                                                </div>
                                                : null}
                                        </div>
                                    </div>
                                </div>
                                : null}


                            {/* предложение повторной заявки */}
                            {false &&
                                <div className="chat_technical_message">
                                    <div className={`${styles.message_block} ${styles.text_left}`}>
                                        <div className="correspondence df font_inter">
                                            <div className="correspondence_ciril df_chat">
                                                <div className="ciril-img">
                                                    <img src="/img/chat_img/кирил.png" alt="no photo"/>
                                                </div>
                                                <div className="let">
                                                    <div className="letter_kiril df" style={{gap: "10px"}}>
                                                        <div className="letter_text-1">
                                                            <h2>Кирилл Воронов</h2>
                                                        </div>
                                                        <div className="letter_text-2">
                                                            <h3>13:44</h3>
                                                        </div>
                                                        <div className="right_menu-img df align mini-gap">
                                                            <img className="ansver" onClick={() => Isanswer(true)}
                                                                 src="/img/chat_img/ответ.png" alt="no photo"/>
                                                            <img src="/img/chat_img/span.png" alt="no photo"/>
                                                            {/* <img className="delete_message" src="/img/icons/delete.png" alt="" /> */}
                                                        </div>
                                                    </div>

                                                    <div className={styles.individual_order}>
                                                        <div className={styles.individual_order__heading}>
                                                            <img src="/img/icons/cil_basket.png" alt=""/>
                                                            <p>Предложение повторной заявки</p>
                                                        </div>

                                                        <div className={styles.individual_order__block}>
                                                            <details className={styles.individual_order__details}>
                                                                <summary className={styles.individual_order__order}>
                                                                    <p>Замена экрана на iphone 15 pro</p>
                                                                    <div className={styles.individual_order__arrow}><img
                                                                        src="/img/bot.png" alt=""/></div>
                                                                    <div style={{flex: 1}}></div>
                                                                    <p>1 день</p>
                                                                    <p>35000</p>
                                                                </summary>
                                                                <div className={styles.individual_order__more}>
                                                                    <p>условия заказа</p>
                                                                    <p>Заменить экран на iphone 15 pro и прописать
                                                                        трутон и поменять чип </p>
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
                            }


                            <div className="chat_technical_message">
                                <div className={styles.dispute_block}>
                                    <p className={styles.dispute_heading}>Клиент открыл спор</p>
                                    <div className={styles.dispute_details}>
                                        <div className={styles.row_title}>
                                            <p>Размещена заявка</p>
                                            <Link to="#" className={styles.dispute_link}>Замена экрана на iphone 15
                                                pro</Link>
                                        </div>
                                        <div className={styles.dispute_description}>
                                            <p>Вы наклеили стекло криво! очень плохая работа</p>
                                            <div className={`miniSwiperWrap ${styles.miniSwiperWrap}`}>
                                                <div className="miniSlider">
                                                    <SimpleImage/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {isCancelOrderItem_v4 || isDisputeArbitrItem ? null
                                        : <div className={styles.dispute_row}>
                                            <button className={styles.dispute_button}
                                                    onClick={() => setVisibleCancelOrderItem_v4(true)}>Подтвердить
                                                отмену
                                                заявки
                                            </button>
                                            <button className={styles.dispute_button}
                                                    onClick={() => setVisibleModalArbitationItem_v5(true)}>Обратиться в
                                                арбитраж
                                            </button>
                                        </div>
                                    }

                                    {isCancelOrderItem_v4 && (
                                        <div className="chat_technical_message">
                                            <div className={`${styles.message_block} ${styles.text_center}`}>
                                                <div className={styles.cancel_client_block}>
                                                    <img src="/img/message_cancel.png" alt=""/>
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
                                            <div className={`${styles.message_block} ${styles.text_center}`}>
                                                <div className={`${styles.cancel_block}`}>
                                                    <img src="/img/message_cancel.png" alt=""/>
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
                                            <Link to="#" className={styles.dispute_link}>Замена экрана на iphone 15
                                                pro</Link>
                                        </div>
                                        <div className={styles.dispute_description}>
                                            <p>Вы наклеили стекло криво! очень плохая работа</p>
                                            <div className={`miniSwiperWrap ${styles.miniSwiperWrap}`}>
                                                <MiniSlider/>
                                            </div>
                                        </div>
                                    </div>
                                    {isCancelOrder_v4 || isDisputeArbitr ? null
                                        : <div className={styles.dispute_row}>
                                            <button className={styles.dispute_button}
                                                    onClick={() => setVisibleCancelOrder_v4(true)}>Подтвердить отмену
                                                заказа
                                            </button>
                                            <button className={styles.dispute_button}
                                                    onClick={() => setVisibleModalArbitation_v5(true)}>Обратиться в
                                                арбитраж
                                            </button>
                                        </div>
                                    }

                                    {isCancelOrder_v4 && (
                                        <div className="chat_technical_message">
                                            <div className={`${styles.message_block} ${styles.text_center}`}>
                                                <div className={styles.cancel_client_block}>
                                                    <img src="/img/message_cancel.png" alt=""/>
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
                                            <div className={`${styles.message_block} ${styles.text_center}`}>
                                                <div className={`${styles.cancel_block}`}>
                                                    <img src="/img/message_cancel.png" alt=""/>
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
                                                <img src="/img/chat_img/кирил.png" alt="no photo"/>
                                            </div>
                                            <div className="let">
                                                <div className="letter_kiril df" style={{gap: "10px"}}>
                                                    <div className="letter_text-1">
                                                        <h2>Кирилл Воронов</h2>
                                                    </div>
                                                    <div className="letter_text-2">
                                                        <h3>13:44</h3>
                                                    </div>
                                                    <div className="right_menu-img df align mini-gap">
                                                        <img className="ansver" onClick={() => Isanswer(true)}
                                                             src="/img/chat_img/ответ.png" alt="no photo"/>
                                                        <img src="/img/chat_img/span.png" alt="no photo"/>
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
                                        <div className="correspondence-active font_inter df" style={{gap: "10px"}}>
                                            <div className="ciril-img">
                                                <img src="/img/chat_img/2.png"
                                                     style={{width: '58px', height: '58px', opacity: '0'}}
                                                     alt="no photo"/>
                                            </div>
                                            <div className="let">
                                                <div className="letter_kiril df"
                                                     style={{gap: "10px", justifyContent: "flex-end"}}>
                                                    <div
                                                        className={`viewed_img-2 buttons_edit_message ${styles.btn_row}`}>
                                                        <img src="/img/chat_img/edid.png"
                                                             onClick={() => Isedit(true)} alt="no photo"/>
                                                        <div style={{position: "relative"}}>
                                                            {isVisibleDeleteMessage &&
                                                                <div className={styles.modal_delete_message}
                                                                     onClick={() => setVisibleDeleteMessage(false)}>
                                                                    <img className="delete_message"
                                                                         src="/img/icons/delete.png" alt=""/>
                                                                    <span>удалить сообщение</span>
                                                                </div>
                                                            }
                                                            <img className="delete_message"
                                                                 onClick={() => setVisibleDeleteMessage(true)}
                                                                 src="/img/icons/delete.png" alt=""/>
                                                        </div>


                                                        {/* <img src="/img/chat_img/просмотрено.png" alt="no photo" /> */}
                                                    </div>
                                                    <div className="letter_text-2">
                                                        <h3>13:44</h3>
                                                    </div>
                                                    <div className="letter_text-1">
                                                        <h2>Вы</h2>
                                                    </div>
                                                    <img src="/img/chat_img/2.png"
                                                         style={{width: '58px', height: '58px'}}
                                                         alt="no photo"/>

                                                </div>
                                                <div className="sms_text-3" style={{marginRight: '60px'}}>
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
                                {answer ?
                                    <p className="answer_to_message">Ответить <span>Смогу приехать через час</span>
                                        <button onClick={() => Isanswer(false)}>X</button>
                                    </p> : null}
                                {edit ? <p className="answer_to_message">Редактирование <button
                                    onClick={() => Isedit(false)}>X</button></p> : null}

                                {/* заблок чат */}
                                {Number(id) == 111 ?
                                    <div className={styles.chat_block_wrap}>
                                        <img src="/img/icons/chat_block.png" alt=""/>
                                        <p>Возможности для связи с пользователем нет, поскольку он заблокировал диалог с
                                            вами </p>
                                    </div>
                                    :
                                    <div className="magnafire-2 df align">
                                        <div className="magnafire_input-2">
                                            <input className="inp"
                                                   type="text"
                                                   placeholder="Введите сообщение..."
                                                   value={message}
                                                   onChange={handleInputChat} //Обновляем текст в инпуте
                                            />
                                        </div>
                                        <div className="nav_message df">

                                            <div style={{position: "relative"}}>
                                                {chooseFile ?
                                                    <div className="frame_icon qwerewrf">
                                                        <div className="choice df block_file_attach__flex">
                                                            <div className="choice_img">
                                                                <img src="/img/chat_img/img.png" alt="no photo"/>
                                                            </div>
                                                            <div className="im_attach pull-left align">
                                                                <input type="file" className="im_attach_input"
                                                                       title="Send file"
                                                                       style={{display: "none"}}/>
                                                                <p className="block_file_attach__text">Фото или
                                                                    видео</p>
                                                            </div>
                                                        </div>

                                                        <div className="folder df block_file_attach__flex">
                                                            <div className="choice_img">
                                                                <img src="/img/chat_img/folder.png" alt="no photo"/>
                                                            </div>
                                                            <div className="im_attach pull-left align">
                                                                <input type="file" className="im_attach_input"
                                                                       title="Send file"
                                                                       style={{display: "none"}}/>
                                                                <p className="block_file_attach__text">Документ</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    : null}

                                                <label>
                                                    <img onClick={(event) => {
                                                        IschooseFile(prev => !prev);
                                                        event.preventDefault()
                                                    }} src="/img/chat_img/clip.png" alt="no photo"/>
                                                </label>
                                            </div>

                                            <label htmlFor="file-input">
                                                <img src="/img/icons/micro.png" alt="no photo"/>
                                            </label>

                                            <div style={{position: "relative" }}>
                                                {isVisibleEmoji ?
                                                    <div className={styles.emoji_pos}>
                                                        <EmojiPicker onEmojiClick={addEmojiToMessage} />
                                                    </div>
                                                    : null}
                                                <label htmlFor="file-input" onClick={() => setVisibleEmoji(prev => !prev)}>
                                                    <img src="/img/chat_img/emoji.png" alt="no photo" />
                                                </label>
                                            </div>


                                            <div className="plane">
                                            </div>
                                        </div>
                                    </div>}


                                {/* </div>
                                </div> */}
                            </div>


                        </div>

                    </div>

                    : <div className={styles.empty_chat}>
                        <img src="/img/empty_chat.png" alt="" />
                        <p>Пожалуйста, выберите диалог чтобы видеть сообщение!</p>
                    </div>
                }

            </section >
        </>
    )
}


export default ChoiceOfReplenishmentMethodCard;