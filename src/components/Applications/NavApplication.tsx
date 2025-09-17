import React, { useEffect } from "react";
import '../../scss/applications.css'
import { Link, useLocation } from "react-router-dom";
import style from "./NavApplication.module.css"


function App() {
    const location = useLocation()

    useEffect(() => {
        document.title = 'Заявки';
    }, []);

    return (
        <div className={style.wrap_links}>
            <Link  className={`just ${style.link} ${location.pathname === "/master/orders" ? "active2" : ""}`}  to='/master/orders'>
                Мои заявки
            </Link>
            <Link  className={`just ${style.link} ${location.pathname === "/master/orders/completed" ? "active2" : ""}`} to='/master/orders/completed'>
                Выполнено
            </Link>
            <Link className={`just ${style.link} ${location.pathname === "/master/orders/canceled" ? "active2" : ""}`}  to='/master/orders/canceled'>
                Отменено
            </Link>
            <Link  className={`just ${style.link} ${location.pathname === "/master/orders/all" ? "active2" : ""}`} to='/master/orders/all'>
                Все
            </Link>
        </div>
    )
}


export default App;
