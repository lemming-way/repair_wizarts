import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { selectUser } from '../../slices/user.slice'
import {
    updateOrderStatus,
    updateOrderStatusFromClient
} from '../../services/order.service'
import {
    updateRequestStatus,
    updateRequestStatusFromMaster
} from '../../services/request.service'
import ChatOrderControls from './ChatOrderControls'
import styles from './Chat.module.css'

const ChatOrder = (props) => {
    const {
        dialog,
        receiver
    } = props

    const user = useSelector(selectUser)
    const isUserMaster = Boolean(user.master?.[0])

    const [fullText, setFullText] = useState(false)
    const isOrder = Boolean(dialog.order_id)
    const orderObj = dialog.order || dialog.request
    const [status, setStatus] = useState(orderObj.status)

    useEffect(() => {
        setStatus(orderObj.status)
        setFullText(false)
    }, [dialog.id])

    const updateStatus = (status) => (e) => {
        e.preventDefault()

        if (isUserMaster) {
            if (isOrder) {
                return updateOrderStatus(orderObj.id, status)
                    .then(() => setStatus(status))
            }
            return updateRequestStatusFromMaster(orderObj.id, status)
                .then(() => setStatus(status))
        }

        if (isOrder) {
            return updateOrderStatusFromClient(orderObj.id, status)
                .then(() => setStatus(status))
        }
        return updateRequestStatus(orderObj.id, status)
            .then(() => setStatus(status))
    }

    return (
        <div className={styles.order}>
            <div className={styles.orderInfo}>
                <h3
                    className={cx(styles.orderTitle, fullText && styles.orderTitleOpen)}
                    onClick={() => setFullText((prev) => !prev)}
                >
                    {orderObj.title || orderObj.client_message}
                </h3>
                <span className={styles.orderStatus}>{status}</span>
            </div>
            <ChatOrderControls
                isUserMaster={isUserMaster}
                status={status}
                updateStatus={updateStatus}
                receiver={receiver}
            />
        </div>
    )
}

export default ChatOrder
