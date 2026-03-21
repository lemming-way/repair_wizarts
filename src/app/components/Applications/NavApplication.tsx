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
            <Link  className={`just ${style.link} ${location.pathname === "/contractor/orders" ? "active2" : ""}`}  to='/contractor/orders'>
                {text('My applications')}
            </Link>
            <Link  className={`just ${style.link} ${location.pathname === "/contractor/orders/completed" ? "active2" : ""}`} to='/contractor/orders/completed'>
                {text('Completed')}
            </Link>
            <Link className={`just ${style.link} ${location.pathname === "/contractor/orders/canceled" ? "active2" : ""}`}  to='/contractor/orders/canceled'>
                {text('Canceled')}
            </Link>
            <Link  className={`just ${style.link} ${location.pathname === "/contractor/orders/all" ? "active2" : ""}`} to='/contractor/orders/all'>
                {text('All')}
            </Link>
        </div>
    )
}


export default App;
