import { useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { selectUser } from "../../slices/user.slice"
import cn from 'classnames'
import { updateOrderStatus } from "../../services/order.service"
import { getClientById } from "../../services/user.service"
import { createDialog } from "../../services/dialog.service"
import { sendOrderAccept } from "../../services/notification.service"
import { useService } from "../../hooks/useService"
import OrderStatus from "../../constants/OrderStatus"

const Application = (props) => {
    const {
        order_id,
        client_price,
        client_id,
        repairs,
        created_at,
        client_message,
        status
    } = props

    const navigate = useNavigate()

    const me = useSelector(selectUser)
    const user = useService(getClientById.bind(null, client_id), { })

    const date = new Date(created_at)
    const mins = date.getMinutes()
    const dateString = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}, ${date.getHours()+1}:${mins < 10 ? '0' + mins : mins}`

    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [time, setTime] = useState("")

    const onAgree = () => {
        return updateOrderStatus(order_id, OrderStatus.Proceeding).then(() => {
            createDialog({
                sender1_id: me.id,
                sender2_id: user.data.id,
                order_id
            }).then((dialog) => {
                if (dialog.id) {
                    sendOrderAccept(user.data.id, order_id)
                    navigate("/master/chat/" + dialog.id)
                }
            })
        }).catch((err) => {
            if (err.status === 402) {
                return setError("Недостаточно средств, пополните баланс")
            }
            
            setError("Произошла ошибка =(")
        })
    }

    const onCancel = () => {
        return updateOrderStatus(order_id, OrderStatus.Canceled)
    }

    const buttonClassName = cn({
        "btn_2_progress-done": status === "Выполнено",
        "btn_2_progress-canceled": status === "Отменено"
    })

    return (
        <>
            <div className="flex-content df applffff">
                <div className="name">
                    <h1>{user.data.name}</h1>
                    <p>{user.data.lastname}</p>
                </div>

                <div className="date">
                    <p>{dateString}</p>
                </div>

                <div className="info-content">
                    {repairs?.map((v, i) => (
                        <h4 key={i}>{v.name}</h4>
                    ))}
                </div>

                <div className="value">
                    <p>{client_price}₽</p>
                </div>

                <div className="btn_2_progress">
                    <button className={buttonClassName}>{status}</button>
                </div>

                <div className="img">
                    <img src="/img/img-iPhone.png" alt="" />
                </div>
            </div>

            <div className="client-message">
                <h2 className="client-message__title">{user.data.name} {user.data.lastname}</h2>
                <p className="client-message__content">{client_message}</p>
            </div>

            {status === "Активно" && (
                <div className="_master">
                    <input className="master__input" placeholder="Сообщение..." value={message} onChange={(e) => setMessage(e.target.value)} />
                    {error && (
                        <div className="auth-err" style={{ marginTop: "20px", marginBottom: "-10px" }}>
                            {error}
                        </div>
                    )}
                    <div className="master__bottom">
                        <form className="master__action">
                            <button className="master-action__button" type="button" onClick={onAgree}>
                                Согласиться
                            </button>
                            <button type="submit" className="master-action__button master-action__button--cancel" onClick={onCancel}>
                                Отказаться
                            </button>
                        </form>

                        <div className="so_2 master__time">
                            <label className="master-time__label" htmlFor="masterTimeInput">Выставить время</label>
                            <input type="text" id="masterTimeInput" className="master-time__input" placeholder="3 часа" value={time} onChange={(e) => setTime(e.target.value)} />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Application
