import { connect, disconnect } from './services/notification.service'

const notificationMiddleware = (store) => (next) => (action) => {
    switch (action.type) {
        case "notifications/connect":
            connect(store.dispatch)
            break
        case "notifications/disconnect":
            disconnect()
            break
        default:
            break
    }

    return next(action)
}

export default notificationMiddleware
