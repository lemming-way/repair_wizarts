import '../../scss/orders.css'
import '../../scss/swiper.css'
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router-dom";
import SERVER_PATH from "../../constants/SERVER_PATH";
import style from "./Orders.module.css"
import EmptyOrder from "./EmptyOrder";
import OrderRow from "./OrderRow";


import NavigationOrders from "../Settings/NavigationOrders";

function Orders() {
    // const requests = useService(getMasterRequests, [])
    // тестовые данные
    const requests = {
        "data": [
            {
                "id": 1,
                title: "Заголовок запроса", // Заголовок
                client: {
                    name: "Имя клиента", // Имя клиента
                    avatar: "profil_img/1.png", // Путь к изображению профиля
                    number_of_submissions: 5 // Количество заказов
                },
                client_price: "1000 ₽" // Цена клиента
            }
        ]
    }


    return (
        <>
                <div className={style.order_row}>
                    <div>
                        <h1 className={style.heading}>Биржа заказы</h1>

                        <div className="df" style={{paddingBottom: 0}}>
                            <div className="two-input">
                                <Link to='/master/requests'>
                                    <div className="myorders">
                                        <p>Мои отклики<span>1</span></p>
                                    </div>
                                </Link>
                                <Link to='/master/requests'>
                                    <div className="myorders">
                                        <p>Все заказы </p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <NavigationOrders />
                </div>


                <EmptyOrder />
                <OrderRow />

        </>
    )
}


export default Orders;
