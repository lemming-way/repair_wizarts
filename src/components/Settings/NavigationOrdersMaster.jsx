import { Link } from "react-router-dom"
import style from "./NavigationOrdersClient.module.css"

export default function NavigationOrdersMaster() {
    return (
        <>
            <div className={style.nav_block}>
                <Link className={`just ${window.location.hash == "#order" ? "active2" : null}`} to="/master/requests/my_orders#order"><h3 >Данные заказа</h3></Link>
                <Link className={`just ${window.location.hash == "#working" ? "active2" : null}`} to="/master/requests/my_orders#working"><h3>В работе</h3></Link>
                <Link className={`just ${window.location.hash == "#success" ? "active2" : null}`} to='/master/requests/my_orders#success'><h3 >Выполнено</h3></Link>
                <Link className={`just ${window.location.hash == "#cancel" ? "active2" : null}`} to='/master/requests/my_orders#cancel'><h3 >Отменено</h3></Link>
                <Link className={`just ${window.location.hash == "#all" ? "active2" : null}`} to='/master/requests/my_orders#all'><h3 >Все</h3></Link>
            </div>
        </>
    )
}