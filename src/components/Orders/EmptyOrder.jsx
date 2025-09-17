import style from "./Orders.module.css"
import { Link } from "react-router-dom"


export default function EmptyOrder () {
    return (
        <>
            <div className={style.empty_block}>
                <img src="/img/meeting.png" alt="" />
                <p className={style.large_text}>У вас пока нет откликов </p>
                <p className={style.empty__text}>Отслеживайте новые проекты от заказчиков на Бирже и откликайтесь на те, которые готовы выполнить. Ваши отклики будут отображаться на этой странице.</p>
                <Link className={style.button} to="/master/requests">Смотрите предложение</Link>
            </div>
        </>
    )
}