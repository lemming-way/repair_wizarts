import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { removeNotification } from '../../slices/notifications.slice'
import styles from './Notifications.module.css'

const Notification = (props) => {
    const {
        title,
        description,
        url,
        index
    } = props

    const dispatch = useDispatch()

    const onClose = (e) => {
        e.preventDefault()
        dispatch(removeNotification(index))
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
