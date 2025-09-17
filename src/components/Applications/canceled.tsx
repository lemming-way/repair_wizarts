import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Application from "./Application";
import Sidebar from "../sidebar";
import '../../scss/applications.css'
import { Link } from "react-router-dom";
import NavApplication from './NavApplication'
import { useService } from "../../hooks/useService";
import { getMasterOrders } from "../../services/order.service";

function App() {
    const orders = useService(getMasterOrders, [])
    const filteredOrders = orders.data.filter((v) => v.status === "Отменено")

    useEffect(() => {
        document.title = 'Заявки';
    }, []);

    return (
        <>
            <div className="mini-text">
                <h1>Заявки</h1>
            </div>

            <NavApplication/>

            <div className="so_3">
                {filteredOrders?.map((v) => (
                    <Application
                        {...v}
                        order_id={v.id}
                        key={v.id}
                        status={v.status}
                    />
                ))}
            </div>
        </>
    )
}


export default App;
