import { Link } from 'react-router-dom'

import styles from './Notifications.module.css'
import { useNotifications } from '../../state/notifications/NotificationsContext'

const Notification = (props) => {
    const {
        title,
        description,
        url,
        index
    } = props

    const { removeNotification } = useNotifications()

    const onClose = (e) => {
        e.preventDefault()
        removeNotification(index)
    }

    return (
        <Link to={url} className={styles.notification}>
            <div className={styles.notificationTitlebar}>
                <div className={styles.notificationTitle}>{title}</div>
                <button className={styles.notificationClose} onClick={onClose}>x</button>
            </div>
            <div className={styles.notificationDescription}>{description}</div>
        </Link>
    )
}

export default Notification
