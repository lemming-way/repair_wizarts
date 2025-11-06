import Portal from '../Portal'
import Notification from './Notification'
import styles from './Notifications.module.css'
import { useNotifications } from '../../state/notifications/NotificationsContext'

const Notifications = (props) => {
    const { notifications } = useNotifications()
    // const dispatch_ = useDispatch() ###

    // useEffect(() => {
    //     if (notifications.length > 3) {
    //         dispatch(shiftNotification())
    //     }
    // }, [notifications.length, dispatch])

    if (!notifications.length) return null

    return (
        <Portal>
            <div className={styles.notifications}>
                {notifications.map((v, i) => (
                    <Notification
                        {...v}
                        index={i}
                        key={i}
                    />
                ))}
            </div>
        </Portal>
    )
}

export default Notifications
