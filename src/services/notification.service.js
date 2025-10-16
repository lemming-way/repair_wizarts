const noop = (..._args) => {}

// Временная заглушка: WebSocket уведомления отключены до новой реализации
const connect = ({ onNotification, onOnlineUpdate } = {}) => {
  noop(onNotification, onOnlineUpdate)
}

const disconnect = () => {}

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
