const noop = (..._args) => {}

// Временная заглушка: WebSocket уведомления отключены до новой реализации
const connect = ({ onNotification, onOnlineUpdate } = {}) => {
  noop(onNotification, onOnlineUpdate)
}

const disconnect = () => {}

//~ const createAudio = () =>
    //~ typeof Audio !== 'undefined' ? new Audio(popit) : null

//~ const playAudio = (audio) => {
    //~ if (!audio || typeof audio.play !== 'function') {
        //~ return
    //~ }

    //~ audio.play().catch(() => {
        //~ // ignored – autoplay restrictions can prevent playback
    //~ })
//~ }

//~ const dispatchDependOnTheType = (data) => {
    //~ const audio = createAudio()

    //~ switch (data.type) {
        //~ case NotificationType.UPDATE_ONLINE: {
            //~ const onlineUsers = Array.isArray(data.online_users)
                //~ ? data.online_users
                //~ : []
            //~ handlersRef.onOnlineUpdate?.(onlineUsers)
            //~ break
        //~ }
        //~ case NotificationType.CREATED_MESSAGE: {
            //~ if (Array.isArray(data.unread_messages)) {
                //~ queryClient.setQueryData(messageKeys.unread(), data.unread_messages)
            //~ } else {
                //~ queryClient.invalidateQueries({ queryKey: messageKeys.unread() })
            //~ }
            //~ playAudio(audio)
            //~ break
        //~ }
        //~ case NotificationType.ACCEPTED_ORDER: {
            //~ handlersRef.onNotification?.({
                //~ title: 'Заявка одобрена!',
                //~ description: 'Чтобы пройти в чат нажмите на это сообщение.',
                //~ url: '/client/chat',
            //~ })
            //~ playAudio(audio)
            //~ break
        //~ }
        //~ case NotificationType.CREATED_OFFER: {
            //~ handlersRef.onNotification?.({
                //~ title: `На ваш заказ #${data.request} поступило предложение!`,
                //~ description: 'Чтобы просмотреть все предложения на этот заказ, нажмите это сообщение.',
                //~ url: '/client/offers/' + data.request,
            //~ })
            //~ playAudio(audio)
            //~ break
        //~ }
        //~ case NotificationType.ACCEPTED_OFFER: {
            //~ handlersRef.onNotification?.({
                //~ title: 'Ваше предложение было принято!',
                //~ description: 'Чтобы пройти в чат нажмите на это сообщение',
                //~ url: '/master/chat',
            //~ })
            //~ playAudio(audio)
            //~ break
        //~ }
        //~ default:
            //~ break
    //~ }
//~ }

const sendMessageCreate = () => {}

const sendOrderAccept = () => {}

const sendOfferCreate = () => {}

const sendOfferAccept = () => {}

export {
  connect,
  disconnect,
  sendMessageCreate,
  sendOrderAccept,
  sendOfferCreate,
  sendOfferAccept,
}
