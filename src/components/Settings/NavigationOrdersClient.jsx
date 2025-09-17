import { Link } from "react-router-dom"
import style from "./NavigationOrdersClient.module.css"

export default function NavigationOrdersClient() {
    return (
        <>
            <div className={style.nav_block}>
                <Link className={`${style.link} ${window.location.hash == "#order" || window.location.hash == "" ? "active2" : null}`} to="#order">Данные заказа</Link>
                <Link className={`${style.link} ${window.location.hash == "#working" ? "active2" : null}`} to="#working">В работе</Link>
                <Link className={`${style.link} ${window.location.hash == "#success" ? "active2" : null}`} to='#success'>Выполнено</Link>
                <Link className={`${style.link} ${window.location.hash == "#cancel" ? "active2" : null}`} to='#cancel'>Отменено</Link>
                <Link className={`${style.link} ${window.location.hash == "#all" ? "active2" : null}`} to='#all'>Все</Link>
            </div>
        </>
    )
}