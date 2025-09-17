import React from "react"
import { connect } from "react-redux"
import { getToken } from "../../services/token.service"
import { getDialogs, getMessages } from '../../services/chat.service'
import { sendMessageCreate } from "../../services/notification.service"
import { removeMessages } from "../../slices/messages.slice"
import withRouter from "../../hoc/withRouter"
import ChatSidebar from './ChatSidebar'
import ChatContent from "./ChatContent"
import Sidebar from "../sidebar"
import styles from './Chat.module.css'
import { SERVER_WSPATH } from "../../constants/SERVER_PATH"


const MessageRequestTypes = {
    SEND: 1,
    UPDATE: 2,
    READ: 3,
    STARTED_TYPING: 4,
    STOPPED_TYPING: 5
}

class Chat extends React.Component {
    state = {
        selectedDialog: { },
        receiver: { },
        typingUserId: null,
        dialogs: [],
        messages: [],
    }

    static defaultProps = {
        showSidebar: false,
        baseRoute: "/client/chat/"
    }

    sendDataWithFile(ws, message, files, type, message_id) {
        const filePromiseList = [...files].map((f) => new Promise((res) => {
            const reader = new FileReader()
            reader.onload = (e) => res({
                name: f.name,
                data: e.target.result.split(',')[1]
            })
            reader.readAsDataURL(f)
        }))

        return Promise.all(filePromiseList)
            .then((files) => this.ws.send(JSON.stringify({
                type,
                message,
                message_id,
                files
            })))
    }

    messageSend(message, files) {
        this.sendDataWithFile(this.ws, message, files, MessageRequestTypes.SEND)
    }
    
    messageUpdate(message, files, messageId) {
        this.sendDataWithFile(this.ws, message, files, MessageRequestTypes.UPDATE, messageId)
    }
    
    messageRead(messages) {
        this.props.dispatch(removeMessages({
            dialog: this.state.selectedDialog.id,
            count: messages.length
        }))
        this.ws.send(JSON.stringify({ type: MessageRequestTypes.READ, messages }))
    }

    messageStartedTyping() {
        this.ws.send(JSON.stringify({ type: MessageRequestTypes.STARTED_TYPING }))
    }

    messageStoppedTyping() {
        this.ws.send(JSON.stringify({ type: MessageRequestTypes.STOPPED_TYPING }))
    }

    updateStateByRequestType(data) {
        const updateMessages = (updateCallback) => this.setState((prev) => ({
            ...prev,
            messages: updateCallback(prev.messages)
        }))

        switch (data.type) {
            case MessageRequestTypes.SEND:
                if (data.message.sender_id === this.state.receiver.id) {
                    this.messageRead([data.message.id])
                }
                sendMessageCreate(
                    this.state.receiver.id,
                    this.state.selectedDialog.id,
                    data.message.id
                )
                updateMessages((m) => [...m, data.message])
                break;
            case MessageRequestTypes.UPDATE:
                updateMessages((m) => m.map((v) =>
                    v.id === data.message.id ? data.message : v))
                break;
            case MessageRequestTypes.READ:
                updateMessages((m) => m.map((v) =>
                    data.messages.find((mv) => mv.id === v.id) || v))
                break;
            case MessageRequestTypes.STARTED_TYPING:
                if (data.user !== this.props.user.id) {
                    this.setState((prev) => ({ ...prev, typingUserId: data.user }))
                }
                break;
            default:
                if (data.user !== this.props.user.id) {
                    this.setState((prev) => ({ ...prev, typingUserId: null }))
                }
                break;
        }
    }

    createWebSocket(dialogId, receiverId) {
        const url = new URL(SERVER_WSPATH + "ws/chat/" + dialogId)
        url.searchParams.set("token", getToken().access_token)
        url.searchParams.set("receiver_id", receiverId)

        return new WebSocket(decodeURIComponent(url))
    }

    async updateChatState() {
        const dialogs = await getDialogs()
        const selectedDialog = dialogs.find((v) =>
            v.id === +this.props.match.params.id)

        if (!selectedDialog) {
            return this.setState({
                dialogs,
                typingUserId: null,
                receiver: { }
            })
        }

        const messages = await getMessages(selectedDialog.id)
        const receiver = this.props.user.id === selectedDialog.sender1_id
            ? selectedDialog.sender2
            : selectedDialog.sender1
        const unreadMessages = messages
            .filter((v) => v.sender_id === receiver.id && !v.is_read)
            .map((v) => v.id)

        this.ws = this.createWebSocket(selectedDialog.id, receiver.id)
        this.ws.addEventListener("open", (e) => unreadMessages.length > 0
            && this.messageRead(unreadMessages))
        this.ws.addEventListener("message", (e) => {
            this.updateStateByRequestType(JSON.parse(e.data))
        })

        this.setState({
            selectedDialog,
            receiver,
            typingUserId: null,
            dialogs,
            messages
        })
    }

    constructor(props) {
        super(props)

        this.messageSend = this.messageSend.bind(this)
        this.messageUpdate = this.messageUpdate.bind(this)
        this.messageStartedTyping = this.messageStartedTyping.bind(this)
        this.messageStoppedTyping = this.messageStoppedTyping.bind(this)
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.ws?.close()
            return this.updateChatState()
        }
    }

    componentDidMount() {
        return this.updateChatState()
    }

    componentWillUnmount() {
        this.ws?.close()
    }

    render() {
        const dialogId = this.state.selectedDialog.order_id
            || this.state.selectedDialog.request_id

        return (
            <div className={styles.container}>
                {this.props.showSidebar && (
                    <Sidebar />
                )}
                <section className="page_2 fchat_page_inter inter">
                    <div className="big_frame-chat big_frame-chat__fullchat df">
                        <ChatSidebar
                            dialogs={this.state.dialogs}
                            selectedDialog={this.state.selectedDialog}
                            userId={this.props.user.id}
                            typingUserId={this.state.typingUserId}
                            prefix={this.props.baseRoute}
                        />
                        <ChatContent
                            receiver={this.state.receiver}
                            messages={this.state.messages}
                            dialogId={dialogId}
                            selectedDialog={this.state.selectedDialog}
                            onMessageSend={this.messageSend}
                            onMessageUpdate={this.messageUpdate}
                            onMessageStartedTyping={this.messageStartedTyping}
                            onMessageStoppedTyping={this.messageStoppedTyping}
                        />
                    </div>
                </section>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({ user: state.user.data })

export default withRouter(connect(mapStateToProps)(Chat))
