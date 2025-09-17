import { useState, useRef, useEffect } from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"
import cx from "classnames"
import { selectOnline } from "../../slices/online.slice"
import { selectUser } from "../../slices/user.slice"
import ChatOrder from "./ChatOrder"
import styles from './Chat.module.css'
import fileImage from '../../img/file.png'
import SERVER_PATH from "../../constants/SERVER_PATH"
import Dropdown from "react-multilevel-dropdown"

const ChatContent = (props) => {
    const {
        receiver,
        messages,
        dialogId,
        selectedDialog,
        onMessageSend,
        onMessageUpdate,
        onMessageStartedTyping,
        onMessageStoppedTyping
    } = props

    const [showFileInput, setShowFileInput] = useState(false)

    const onlineUsers = useSelector(selectOnline)
    const user = useSelector(selectUser)

    const mainRef = useRef(null)
    const fileInputRef = useRef(null)
    const [message, setMessage] = useState("")
    const [editMessageId, setEditMessageId] = useState()

    const formatDate = (date) => {
        const months = ["Янв", "Фев", "Март", "Апр", "Май", "Июнь", "Июль", "Авг", "Сен", "Окт", "Нояб", "Дек"]
        const d = new Date(date)
        return `${d.getHours()}:${(d.getMinutes() < 10 ? '0' : '') + d.getMinutes()} ${d.getDate()} ${months[d.getMonth()]}`
    }

    const status = receiver.master?.[0]?.status

    useEffect(() => {
        if (receiver.id) {
            mainRef.current.scrollTop =
                mainRef.current.scrollHeight - mainRef.current.clientHeight
        }
    }, [messages, receiver.id])

    const onSubmit = (e) => {
        e.preventDefault()

        if (editMessageId) {
            onMessageUpdate(message, [], editMessageId)
        } else {
            if (message.length) {
                onMessageSend(message, fileInputRef.current?.files || [])
            }
        }

        setEditMessageId()
        setMessage("")
    }

    return (
        <div className={`${styles.content} ${receiver.id ? "" : styles.content_empty}`}>


            {receiver.id ? (
                <>
                    <div className={styles.contentTop}>
                        <Link to={"/client/feedback/" + receiver?.master[0]?.username}>
                            <div className="kirill df align">
                                <div className="prof_img chatfgetu twerwe">
                                    <img
                                        src={SERVER_PATH + receiver.avatar}
                                        height="66px"
                                        width="66px"
                                        alt=""
                                        style={{ borderRadius: "33px", objectFit: "cover" }}
                                    />
                                    {onlineUsers.includes(receiver.id) && (
                                        <div className="dialog-online"></div>
                                    )}
                                </div>
                                <div className="nik">
                                    <h2 className="eyrqwe">
                                        {receiver.name} {receiver.lastname} (#{dialogId})
                                    </h2>
                                    <div className="info_nik df">
                                        <div className="kiril_info">
                                            <h3>{onlineUsers.includes(receiver.id) ? "Онлайн" : "Оффлайн"}{status && ", " + status}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        <div style={{flex:1}}></div>   
                        
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
                            <Dropdown.Item className={styles.item}>
                                Оставить отзыв
                            </Dropdown.Item>
                            <Dropdown.Item className={` ${styles.item}`}>
                                Заблокировать
                            </Dropdown.Item>
                            <Dropdown.Item className={` ${styles.item}`}>
                                Чёрный список
                            </Dropdown.Item>
                            <Dropdown.Item className={` ${styles.item}`}>
                                Удалить чат
                            </Dropdown.Item>
                        </div>
                        </Dropdown>

                        <Link to="/client/requests/create/title">
                            <button className="ordermore inter">Заказать еще</button>
                        </Link>
                    </div>
                    <ChatOrder
                        dialog={selectedDialog}
                        receiver={receiver}
                    />
                    <main className={styles.contentMain} ref={mainRef}>
                        {messages.map?.((v) => (
                            <div
                                className={cx(v.sender_id !== receiver.id && styles.myMessage, editMessageId === v.id && styles.messageActive, "correspondence font_inter df")}
                                key={v.id}
                            >
                                <div className={cx(styles.messageContent, "correspondence_ciril-4 df")}>
                                    <div className="ciril-img">
                                        <img
                                            src={SERVER_PATH + (v.sender_id === receiver.id ? receiver.avatar : user.avatar)}
                                            height="58px"
                                            width="58px"
                                            style={{ objectFit: "cover", borderRadius: "29px" }}
                                            alt=""
                                        />
                                    </div>
                                    <div className={styles.messageContentMain}>
                                        <div className="letter">
                                            <div className={cx(styles.messageContentTitle, "letter_kiril-4 df")}>
                                                <span className="letter_text-1">
                                                    {v.sender_id === receiver.id ? `${receiver.name} ${receiver.lastname}` : "Вы"}
                                                </span>
                                                <span className="letter_text-2">
                                                    {formatDate(v.sent_at)}
                                                </span>
                                            </div>
                                            <div className={styles.messageContentSMS}>
                                                {v.sender_id !== receiver.id && v.is_read && (
                                                    <img
                                                        src="/img/chat_img/просмотрено.png"
                                                        style={{ objectFit: "none", marginRight: "20px" }}
                                                        alt="watched"
                                                    />
                                                )}
                                                <div className={"sms_text " + styles.messageText}>
                                                    <h2 >{v.message}</h2>
                                                    {v.files.length > 0 && v.files.map((v, i) => (
                                                        <div className={styles.messageFile} key={i}>
                                                            <a
                                                                href={SERVER_PATH + v}
                                                                className={styles.messageFileLink}
                                                            >
                                                                <img src={fileImage} alt="" className={styles.messageFileImage} />
                                                                {v}
                                                            </a>
                                                            <span className={styles.messageFileDelete}>×</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="right_menu-img df align">
                                    {v.sender_id !== receiver.id && (
                                        <img
                                            className="ansver"
                                            src="/img/chat_img/edid.png"
                                            alt="edit"
                                            onClick={(e) => { setEditMessageId(v.id); setMessage(v.message) }}
                                        />
                                    )}
                                </div>
                                
                            </div>
                        ))}
                    </main>
                    <div>
                        {showFileInput ? <div className="frame_icon qwerewrf">
                            <div className="choice df">
                                <div className="choice_img">
                                    <img src="/img/chat_img/img.png" alt="no photo" />
                                </div>
                                <div className="im_attach pull-left align">
                                    <input
                                        type="file"
                                        className="im_attach_input"
                                        title="Send file"
                                        accept="image/png, image/jpeg"
                                        style={{ display: "none" }}
                                        id="chat-file-input"
                                        ref={fileInputRef}
                                        multiple
                                    />
                                    <label htmlFor="chat-file-input"><p>Фото или видео</p></label>
                                </div>
                            </div>
                        </div> : null}
                        <div className="block_messages-2 font_inter">
                            {false ? <p className="answer_to_message">Ответить <span>Смогу приехать через час</span><button>X</button></p> : null}
                            {editMessageId && <p className="answer_to_message">Редактирование <button onClick={(e) => { setEditMessageId(); setMessage("") }}>X</button></p>}
                            <form onSubmit={onSubmit}>
                                <div className="magnafire-2 df align">
                                    <div className="magnafire_input-2">
                                        <input
                                            className="inp"
                                            type="text"
                                            placeholder="Введите сообщение..."
                                            value={message}
                                            onFocus={(e) => onMessageStartedTyping()}
                                            onBlur={(e) => onMessageStoppedTyping()}
                                            onChange={(e) => setMessage(e.target.value)}
                                        />
                                    </div>
                                    <div className="nav_message df">
                                        <label htmlFor="file-input" className="clip" onClick={(e) => setShowFileInput(prev => !prev)}>
                                            <img src="/img/chat_img/clip.png" alt="no photo" />
                                        </label>
                                        <button className="plane" type="submit" style={{ border: "none" }} />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            ) : (
                <>
                <div className={styles.empty_chat}>
                    <img src="/img/empty_chat.png" alt="" />
                    <p>Пожалуйста, выберите диалог чтобы видеть сообщение!</p>
                </div>
                </>
            )}
        </div>
    )
}

export default ChatContent
