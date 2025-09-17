import { useEffect } from 'react'
import { useSelector, useDispatch } from "react-redux"
import { selectNotifications, shiftNotification } from "../../slices/notifications.slice"
import Portal from '../Portal'
import Notification from './Notification'
import styles from './Notifications.module.css'

const Notifications = (props) => {
    const notifications = useSelector(selectNotifications)
    const dispatch = useDispatch()

    // useEffect(() => {
    //     if (notifications.length > 3) {
    //         dispatch(shiftNotification())
    //     }
    // }, [notifications.length, dispatch])

    if (!notifications.length) return

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
