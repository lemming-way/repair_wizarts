import React, { useEffect } from "react";
import Sidebar from "../sidebar";
import '../../scss/applications.css'
import{Link, useLocation} from "react-router-dom";

function App() {

    useEffect(() => {
        document.title = 'История операций';
    }, []);

    const location = useLocation()
    return (
        <div className="mini-wrap mini-wrap_links history__links df">
            <Link className={location.pathname.includes("/history/all") ? "just active2" : "just"}   to='/history/all'><h3>Все операции</h3></Link>
            <Link className={location.pathname.includes("/history/replenishment") ? "just active2" : "just"}   to='/history/replenishment'><h3>Пополнения</h3></Link>
            <Link className={location.pathname.includes("/history/findings") ? "just active2" : "just"}   to='/history/findings'><h3>Выводы</h3></Link>
            <Link className={location.pathname.includes("/history/payments") ? "just active2" : "just"}   to='/history/payments'><h3>Платежи</h3></Link>
        </div>
    )
}


export default App;
