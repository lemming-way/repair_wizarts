import { updateOnline } from "../slices/online.slice"
import { updateMessages } from "../slices/messages.slice"
import { pushNotification } from "../slices/notifications.slice"
import { getToken } from "./token.service"
import popit from "../img/popit.wav"
import { SERVER_WSPATH } from "../constants/SERVER_PATH"

let ws = null

const NotificationType = {
    UPDATE_ONLINE: 1,
    CREATED_MESSAGE: 2,
    ACCEPTED_ORDER: 3,
    CREATED_OFFER: 4,
    ACCEPTED_OFFER: 5
}

const dispatchDependOnTheType = (dispatch, data) => {
    const audio = new Audio(popit)

    switch (data.type) {
        case NotificationType.UPDATE_ONLINE:
            dispatch(updateOnline(data.online_users))
            break
        case NotificationType.CREATED_MESSAGE:
            dispatch(updateMessages(data.unread_messages))
            audio.play()
            break
        case NotificationType.ACCEPTED_ORDER:
            dispatch(pushNotification({
                title: 'Заявка одобрена!',
                description: 'Чтобы пройти в чат нажмите на это сообщение.',
                url: '/client/chat'
            }))
            audio.play()
            break
        case NotificationType.CREATED_OFFER:
            dispatch(pushNotification({
                title: `На ваш заказ #${data.request} поступило предложение!`,
                description: 'Чтобы просмотреть все предложения на этот заказ, нажмите это сообщение.',
                url: '/client/offers/' + data.request
            }))
            audio.play()
            break
        case NotificationType.ACCEPTED_OFFER:
            dispatch(pushNotification({
                title: "Ваше предложение было принято!",
                description: 'Чтобы пройти в чат нажмите на это сообщение',
                url: '/master/chat'
            }))
            audio.play()
            break
        default:
            break
    }
}

const connect = (dispatch) => {
    ws = new WebSocket(SERVER_WSPATH + "ws/notifications?token=" + getToken()?.access_token)
    ws?.addEventListener("open", (e) => {
        ws.send(JSON.stringify({ type: NotificationType.UPDATE_ONLINE }))
        setInterval(() => ws.send(
            JSON.stringify({ type: NotificationType.UPDATE_ONLINE })),
            30000
        )
    })
    ws?.addEventListener("message", (e) => dispatchDependOnTheType(
        dispatch, JSON.parse(e.data)
    ))
}

const disconnect = () => {
    ws?.close()
}

const sendMessageCreate = (receiver_id, dialog_id, message_id) => {
    ws.send(JSON.stringify({
        type: NotificationType.CREATED_MESSAGE,
        receiver_id,
        dialog_id,
        message_id
    }))
}

const sendOrderAccept = (receiver_id, order_id) => {
    ws.send(JSON.stringify({
        type: NotificationType.ACCEPTED_ORDER,
        receiver_id,
        order_id
    }))
}

const sendOfferCreate = (receiver_id, request_id) => {
    ws.send(JSON.stringify({
        type: NotificationType.CREATED_OFFER,
        receiver_id,
        request_id
    }))
}

const sendOfferAccept = (receiver_id, offer_id) => {
    ws.send(JSON.stringify({
        type: NotificationType.ACCEPTED_OFFER,
        receiver_id,
        offer_id
    }))
}

export {
    connect,
    disconnect,
    sendMessageCreate,
    sendOrderAccept,
    sendOfferCreate,
    sendOfferAccept
}
