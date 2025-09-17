import { useState } from 'react';
import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';
import Sidebar from "../sidebar";
import '../../scss/chat.css'
import { useSelector } from 'react-redux';
import { selectOnline } from '../../slices/online.slice';
import { selectUnreadMessages } from '../../slices/messages.slice';
import SERVER_PATH from '../../constants/SERVER_PATH';

const ChatSidebar = (props) => {
    const {
        dialogs,
        userId,
        prefix,
        typingUserId,
        selectedDialog
    } = props

    const onlineUsers = useSelector(selectOnline)
    const { messages: unreadMessages } = useSelector(selectUnreadMessages)

    const [search, setSearch] = useState("")
    const filteredDialogs = search.length > 0
        ? dialogs.filter((v) => v.name.contains(search))
        : dialogs

    const messageCount = (dialog) => {
        const count = unreadMessages?.find((v) => v.dialog_id === dialog.id)?.messages.length

        if (count) {
            return <h3>{count}</h3>
        }
    }

    const extractReceiverFromDialog = (dialogObj) =>
        dialogObj.sender1_id === userId ? dialogObj.sender2 : dialogObj.sender1

    return (
        <div className="frame_messages frame_messages__fullchat">
            <MediaQuery query="(max-device-width: 1110px)">
                <Sidebar/>
            </MediaQuery>
            <div className="block_messages font_inter">
                <div className="messages_text">
                    <h2>
                        Сообщения
                    </h2>
                </div>
                <div className="magnafire df align">
                    <div className="magnafire_img">
                        <img src="/img/chat_img/search.png" alt="no photo" />
                    </div>
                    <div className="magnafire_input">
                        <input type="text" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                </div>
            </div>
            <div className="big_messages__wrap">
                {filteredDialogs.map((v) => (
                    <Link to={prefix + v.id} key={v.id}>
                        <div className="big_messages">
                            <div className="ilya df font_inter align">
                                <div className="ilya_img">
                                    <img
                                        src={SERVER_PATH + extractReceiverFromDialog(v).avatar}
                                        width="58px"
                                        height="58px"
                                        style={{ objectFit: "cover", borderRadius: "29px" }}
                                        alt="Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas"
                                    />
                                    {onlineUsers.includes(extractReceiverFromDialog(v).id) && (
                                        <div className="dialog-online"></div>
                                    )}
                                </div>
                                <div className="ilya_text" style={{ marginLeft: '30px', flexGrow: "1" }}>
                                    <h2>{v.request_id ? "Заказ #" + v.request_id : "Заявка #" + v.order_id}</h2>
                                    {v.id === selectedDialog?.id && extractReceiverFromDialog(v).id === typingUserId && (
                                        <span><h3>Печатает...</h3></span>
                                    )}
                                </div>
                                <div className="ilya_text-2">
                                    {messageCount(v)}
                                </div>
                            </div>
                            <div className="line_ilya"></div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default ChatSidebar
