import { Link } from "react-router-dom"

import { useAvailableOrders } from "app/state/order"
import { useUsersByIds } from "app/state/user"
import { useProducts } from "app/state/site-data"

const PersonalRequests = () => {
    const { orders, isLoading: isLoadingOrders } = useAvailableOrders(false, true);
    const { products, isLoading: isLoadingProducts } = useProducts();

    const clientIds = [ ...new Set(orders.map(order => order.clientId))];
    const { users: clients, isLoading: isLoadingClients } = useUsersByIds(clientIds);
    const clientsMap = new Map(clients.map(client => [client.id, client]));

    const getEndingOfDigit = (digit) => {
        if (digit % 100 > 10 && digit % 100 < 20) {
            return "ов"
        }
        switch (digit % 10) {
            case 1:
                return ""
            case 2: case 3: case 4:
                return "а"
            default:
                return "ов"
        }
    }

    if (isLoadingOrders || isLoadingProducts || isLoadingClients) {
        return <div>Загрузка...</div>;
    }

    return (
        <>
            <div className="huge-content">
                <h1>Заказы</h1>

                <div className="huge-fasfdsoiXC df">
                    <div className="two-input">
                        <Link to='/contractor/requests/personal'>
                            <div className="myorders">
                                <p>Мои заказы</p>
                            </div>
                        </Link>
                        <Link to='/contractor/requests'>
                            <div className="myorders">
                                <p>Все заказы </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="allorders">
                <div>
                    <h1 className="allorder__title inter">Новое на бирже - <span>{orders.length} проект{getEndingOfDigit(orders.length)}</span> </h1>
                    <div className="h bbbmt hbb mobile-h">
                        <div className="big_nav-device big_nav-devicefsdafstX df align mobile-big_nav-device">
                            <div className="fsdfsaooo mobile-big_nav-text_1">
                                <h2 className="inter-header-left inter">Проект</h2>
                                <h2 className="inter-header-center inter">Покупатель</h2>
                                <h2 className="inter-header-right inter">Цена</h2>
                            </div>
                        </div>
                        {orders.map((order) => {
                            const client = clientsMap.get(order.clientId);
                            const productName = products[order.productId]?.name || 'Неизвестная услуга';
                            // Заглушка, так как number_of_submissions нет в UserProfile
                            const numberOfSubmissions = 0;

                            return (
                                <Link to={"/contractor/requests/" + order.id} key={order.id}>
                                    <div className="archive-hee sewreqwreqw">
                                        <div className="nav_applications-3 fasfXf nav_applications-3-gee fsdfsaooo big_nav-device df align mobile-nav_applications-3">
                                            <div className="all-requests-title-container">
                                                <h2>{productName}</h2>
                                            </div>
                                            <div className="client__order">
                                                <img
                                                    src={client?.avatar || '/img/profil_img/1.png'}
                                                    alt={client?.fullname || 'Неизвестный клиент'}
                                                    width="48px"
                                                    height="48px"
                                                    style={{ objectFit: "cover", borderRadius: "24px" }}
                                                />
                                                <div className="info__client__order">
                                                    <h3 className="inter">{client?.fullname || 'Неизвестный клиент'}</h3>
                                                    <p className="inter">
                                                        {numberOfSubmissions} заказ{getEndingOfDigit(numberOfSubmissions)} на сайте
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="all-requests-price-container">
                                                <p>{order.desiredPrice} &#x20BD;</p> {/* Предполагаем валюту */}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <div className="bri">
                    <a href="./" className="inter">Показать все</a>
                </div>
            </div>
        </>
    )
}

export default PersonalRequests
