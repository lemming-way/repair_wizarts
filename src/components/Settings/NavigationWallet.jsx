import { Link } from "react-router-dom"
import style from "./NavigationWallet.module.css"

export default function NavigationWallet() {
    return (
        <>
            <div className={style.block}>
                <Link className={`${style.link} ${window.location.hash == "#all" || window.location.hash == "" ? "active2" : null} ${style.heading}`} to="#all" style={{whiteSpace: "nowrap"}}>Все операции</Link>
                <Link className={`${style.link} ${window.location.hash == "#add" ? "active2" : null} ${style.heading}`} to="#add">Пополнения</Link>
                <Link className={`${style.link} ${window.location.hash == "#drop" ? "active2" : null} ${style.heading}`} to='#drop'>Выводы</Link>
                <Link className={`${style.link} ${window.location.hash == "#transaction" ? "active2" : null} ${style.heading}`} to='#transaction'>Платежи</Link>
            </div>
        </>
    )
}