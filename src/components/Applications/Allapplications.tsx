import { useEffect } from "react";
import Application from "./Application";
import Sidebar from "../sidebar";
import '../../scss/applications.css'
import NavApplication from './NavApplication'
import { useService } from "../../hooks/useService";
import { getMasterOrders } from "../../services/order.service";

function App() {
    const orders = useService(getMasterOrders, [])

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
                {orders.data.map((v) => (
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
