import { getToken } from "./token.service"
import { SERVER_WSPATH } from "../constants/SERVER_PATH"
import popit from "../img/popit.wav"
import { queryClient } from "../app/queryClient";
import { messageKeys } from "../queries";

let ws = null
let keepAliveTimer = null
let handlersRef = {
    onNotification: undefined,
    onOnlineUpdate: undefined,
}

const NotificationType = {
    UPDATE_ONLINE: 1,
    CREATED_MESSAGE: 2,
    ACCEPTED_ORDER: 3,
    CREATED_OFFER: 4,
    ACCEPTED_OFFER: 5,
}

const createAudio = () =>
    typeof Audio !== 'undefined' ? new Audio(popit) : null

const playAudio = (audio) => {
    if (!audio || typeof audio.play !== 'function') {
        return
    }

    audio.play().catch(() => {
        // ignored – autoplay restrictions can prevent playback
    })
}

const dispatchDependOnTheType = (data) => {
    const audio = createAudio()

    switch (data.type) {
        case NotificationType.UPDATE_ONLINE: {
            const onlineUsers = Array.isArray(data.online_users)
                ? data.online_users
                : []
            handlersRef.onOnlineUpdate?.(onlineUsers)
            break
        }
        case NotificationType.CREATED_MESSAGE: {
            if (Array.isArray(data.unread_messages)) {
                queryClient.setQueryData(messageKeys.unread(), data.unread_messages)
            } else {
                queryClient.invalidateQueries({ queryKey: messageKeys.unread() })
            }
            playAudio(audio)
            break
        }
        case NotificationType.ACCEPTED_ORDER: {
            handlersRef.onNotification?.({
                title: 'Заявка одобрена!',
                description: 'Чтобы пройти в чат нажмите на это сообщение.',
                url: '/client/chat',
            })
            playAudio(audio)
            break
        }
        case NotificationType.CREATED_OFFER: {
            handlersRef.onNotification?.({
                title: `На ваш заказ #${data.request} поступило предложение!`,
                description: 'Чтобы просмотреть все предложения на этот заказ, нажмите это сообщение.',
                url: '/client/offers/' + data.request,
            })
            playAudio(audio)
            break
        }
        case NotificationType.ACCEPTED_OFFER: {
            handlersRef.onNotification?.({
                title: 'Ваше предложение было принято!',
                description: 'Чтобы пройти в чат нажмите на это сообщение',
                url: '/master/chat',
            })
            playAudio(audio)
            break
        }
        default:
            break
    }
}

const safeSend = (payload) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        return
    }

    ws.send(JSON.stringify(payload))
}

const startKeepAlive = () => {
    keepAliveTimer = setInterval(() => {
        safeSend({ type: NotificationType.UPDATE_ONLINE })
    }, 30000)
}

const stopKeepAlive = () => {
    if (keepAliveTimer) {
        clearInterval(keepAliveTimer)
        keepAliveTimer = null
    }
}

const connect = (handlers = {}) => {
    if (typeof WebSocket === 'undefined') {
        return
    }

    const token = getToken()?.access_token
    if (!token) {
        return
    }

    disconnect()

    handlersRef = {
        onNotification: handlers.onNotification,
        onOnlineUpdate: handlers.onOnlineUpdate,
    }

    ws = new WebSocket(`${SERVER_WSPATH}ws/notifications?token=${token}`)

    ws.addEventListener('open', () => {
        safeSend({ type: NotificationType.UPDATE_ONLINE })
        startKeepAlive()
    })

    ws.addEventListener('message', (event) => {
        try {
            const payload = JSON.parse(event.data)
            dispatchDependOnTheType(payload)
        } catch (error) {
            console.error('Failed to parse notification payload', error)
        }
    })

    ws.addEventListener('close', () => {
        stopKeepAlive()
    })

    ws.addEventListener('error', () => {
        stopKeepAlive()
    })
}

const disconnect = () => {
    stopKeepAlive()
    if (ws) {
        ws.close()
        ws = null
    }
    handlersRef = {
        onNotification: undefined,
        onOnlineUpdate: undefined,
    }
}

const sendMessageCreate = (receiver_id, dialog_id, message_id) => {
    safeSend({
        type: NotificationType.CREATED_MESSAGE,
        receiver_id,
        dialog_id,
        message_id,
    })
}

const sendOrderAccept = (receiver_id, order_id) => {
    safeSend({
        type: NotificationType.ACCEPTED_ORDER,
        receiver_id,
        order_id,
    })
}

const sendOfferCreate = (receiver_id, request_id) => {
    safeSend({
        type: NotificationType.CREATED_OFFER,
        receiver_id,
        request_id,
    })
}

const sendOfferAccept = (receiver_id, offer_id) => {
    safeSend({
        type: NotificationType.ACCEPTED_OFFER,
        receiver_id,
        offer_id,
    })
}

export {
    connect,
    disconnect,
    sendMessageCreate,
    sendOrderAccept,
    sendOfferCreate,
    sendOfferAccept,
}
