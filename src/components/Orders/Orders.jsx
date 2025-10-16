import '../../scss/orders.css';
import '../../scss/swiper.css';
import 'swiper/css';
import 'swiper/css/navigation';
import { Link } from 'react-router-dom';
import style from './Orders.module.css';
import EmptyOrder from './EmptyOrder';
import OrderRow from './OrderRow';

import NavigationOrders from '../Settings/NavigationOrders';
import { useEffect, useState } from 'react';
import appFetch from '../../utilities/appFetch';
import { useSelector } from 'react-redux';
import { selectUser } from '../../slices/user.slice';
const STATE_ENUM = {
  active: 'Активно',
  success: 'Выполнено',
  cancel: 'Отменено',
};
function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [orderState, setOrderState] = useState('Активно');
  const user = JSON.parse(localStorage.getItem('userdata')).user;
  useEffect(() => {
    const currentFilter = STATE_ENUM[window.location.hash.slice(1)];
    const fetchOrders = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const allOrder = await appFetch('/drive', {
          body: {
            u_a_role: 2,
          },
        });
        const filteredOrders = Object.values({
          ...(allOrder.data.booking || {}),
        }).filter(
          (order) =>
            order.b_options?.type === 'order' &&
            order.b_options?.status === orderState,
        );
        const formattedOrders = filteredOrders.map((item) => {
          return {
            ...item,
            drivers: item.drivers.find((item) => item.u_id === user.u_id),
          };
        });
        console.log(formattedOrders);
        setOrders(formattedOrders);
      } catch (error) {
        console.error(error);
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    setOrderState(currentFilter);
    fetchOrders();
  }, [orderState]);
  // useEffect(() => {
  //   setOrders((prev) =>
  //     prev.filter((item) => item.b_options.status === orderState),
  //   );
  // }, [orderState]);
  // const requests = useService(getMasterRequests, [])
  // тестовые данные
  // const requests = {
  //     "data": [
  //         {
  //             "id": 1,
  //             title: "Заголовок запроса", // Заголовок
  //             client: {
  //                 name: "Имя клиента", // Имя клиента
  //                 avatar: "profil_img/1.png", // Путь к изображению профиля
  //                 number_of_submissions: 5 // Количество заказов
  //             },
  //             client_price: "1000 ₽" // Цена клиента
  //         }
  //     ]
  // } ###

  return (
    <>
      <div className={style.order_row}>
        <div>
          <h1 className={style.heading}>Биржа заказы</h1>

          <div className="df" style={{ paddingBottom: 0 }}>
            <div className="two-input">
              <Link to="/master/requests">
                <div className="myorders">
                  <p>
                    Мои отклики<span>1</span>
                  </p>
                </div>
              </Link>
              <Link to="/master/requests">
                <div className="myorders">
                  <p>Все заказы </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
        <NavigationOrders setStatusOrder={setOrderState} />
      </div>
      {isLoading ? (
        'Загрузка...'
      ) : orders.length === 0 ? (
        <EmptyOrder />
      ) : (
        orders.map((item) => (
          <OrderRow
            userProfile={{
              avatar: item.b_options.author.photo,
              name: item.b_options.author.name,
              projectsCount: 12,
              hireRate: 100,
            }}
            orderInfo={{
              device: item.b_options.title,
              problem: item.b_options.description,
              budget: item.b_options.client_price,
            }}
            // photos={['/img1.png', '/img2.png']}
            // images={['/img1.png', '/img2.png']}
            commentData={{
              author: {
                avatar: item.drivers?.c_options.author.photo,
                name: user.u_name + ' ' + user.u_family,
                ordersCount: 0,
              },
              message: item.drivers.c_options.comment,
              offers: [
                {
                  description: item.b_options.title,
                  time: item.drivers.c_options.time + ' час',
                  price: item.drivers.c_options.bind_amount,
                },
              ],
              statuses: [
                {
                  class: 'status',
                  icon: '/img/icons/eye_white.png',
                  text: 'просмотрено',
                },
                { class: 'status_success', text: 'выполненный' },
                { class: 'status_new', text: 'Заказ создан' },
                { class: 'status_cancel', text: 'Отменённый' },
              ],
            }}
          />
        ))
      )}
    </>
  );
}

export default Orders;
