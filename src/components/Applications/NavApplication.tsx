import React, { useEffect } from "react"
import '../../scss/applications.css'
import { Link, useLocation } from "react-router-dom"

import { useLanguage } from '../../state/language'
import style from "./NavApplication.module.css"


function App() {
    const location = useLocation()
    const text = useLanguage()

    useEffect(() => {
        document.title = text('Applications');
    }, [text]);

    return (
        <div className={style.wrap_links}>
            <Link  className={`just ${style.link} ${location.pathname === "/master/orders" ? "active2" : ""}`}  to='/master/orders'>
                {text('My applications')}
            </Link>
            <Link  className={`just ${style.link} ${location.pathname === "/master/orders/completed" ? "active2" : ""}`} to='/master/orders/completed'>
                {text('Completed')}
            </Link>
            <Link className={`just ${style.link} ${location.pathname === "/master/orders/canceled" ? "active2" : ""}`}  to='/master/orders/canceled'>
                {text('Canceled')}
            </Link>
            <Link  className={`just ${style.link} ${location.pathname === "/master/orders/all" ? "active2" : ""}`} to='/master/orders/all'>
                {text('All')}
            </Link>
        </div>
    )
}


export default App;
