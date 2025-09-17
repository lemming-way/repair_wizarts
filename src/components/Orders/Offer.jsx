import '../../scss/orders.css'
import '../../scss/swiper.css'
import "swiper/css";
import "swiper/css/navigation";
import SERVER_PATH from "../../constants/SERVER_PATH";
import style from "./Orders.module.css"
import OrderRowOffer from "./OrderRowOffer";
import { useNavigate } from 'react-router-dom';

function Offer() {
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

    const navigator = useNavigate()

    return (
        <>

                <div className={style.order_row}>
                    <div className={style.title_row}>
                        <h1>Предложить услугу</h1>

                        {/* <div className="huge-fasfdsoiXC df" style={{paddingBottom: 0}}>
                            <div className="two-input">
                                <Link to='/master/requests/personal'>
                                    <div className="myorders">
                                        <p>Мои заказы <span>1</span></p>
                                    </div>
                                </Link>
                                <Link to='/master/requests'>
                                    <div className="myorders">
                                        <p>Все заказы </p>
                                    </div>
                                </Link>
                            </div>
                        </div> */}

                        <button className={style.button_back_v2} onClick={()=>navigator("/master/requests")}>Назад</button>
                    </div>
                    {/* <NavigationOrders /> */}
                </div>

                <OrderRowOffer />

        </>
    )
}


export default Offer;
