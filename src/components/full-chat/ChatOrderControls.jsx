import { Link } from 'react-router-dom'
import cx from 'classnames'
import OrderStatus from '../../constants/OrderStatus'
import styles from './Chat.module.css'

const ChatOrderControls = (props) => {
    const {
        isUserMaster,
        status,
        updateStatus,
        receiver
    } = props

    if (isUserMaster) {
        return (
            <div className={styles.orderControls}>
                {status === OrderStatus.Proceeding && (
                    <button
                        className={cx(styles.orderButton, styles.orderButtonAccept)}
                        onClick={updateStatus(OrderStatus.Completed)}
                    >
                        Подтвердить
                    </button>
                )}
            </div>
        )
    }

    if (status === OrderStatus.Completed) {
        return (
            <div className={styles.orderControls}>
                <button
                    className={cx(styles.orderButton, styles.orderButtonAccept)}
                    onClick={updateStatus(OrderStatus.Confirmed)}
                >
                    Подтвердить
                </button>
                <button
                    className={cx(styles.orderButton, styles.orderButtonCancel)}
                    onClick={updateStatus(OrderStatus.Canceled)}
                >
                    Отменить
                </button>
            </div>
        )
    }

    if (status === OrderStatus.Confirmed) {
        return (
            <div className={styles.orderControls}>
                <Link
                    className={cx(styles.orderButton, styles.orderButtonReview)}
                    to={"/client/feedback/" + receiver.master[0]?.username}
                >
                    Оставить отзыв
                </Link>
            </div>
        )
    }

    return (
        <div className={styles.orderControls}>
            {status !== OrderStatus.Canceled && (
                <button
                    className={cx(styles.orderButton, styles.orderButtonCancel)}
                    onClick={updateStatus(OrderStatus.Canceled)}
                >
                    Отменить
                </button>
            )}
        </div>
    )
}

export default ChatOrderControls
