import { Link } from "react-router-dom"
import style from "./NavigationOrders.module.css"

export default function NavigationOrders() {
    return (
        <>
            <div className={style.links_block}>
                <Link className={`${style.link} ${window.location.hash == "#active" || window.location.hash == "" ? "active2" : null}`} to="/master/requests/orders#active">Активные</Link>
                <Link className={`${style.link} ${window.location.hash == "#success" ? "active2" : null}`} to="/master/requests/orders#success">Выполненные</Link>
                <Link className={`${style.link} ${window.location.hash == "#cancel" ? "active2" : null}`} to='/master/requests/orders#cancel'>Отмененные</Link>
            </div>
        </>
    )
}