import '../../scss/orders.css';
import '../../scss/swiper.css';
import 'swiper/css';
import 'swiper/css/navigation';
import { useEffect, useState, useCallback } from 'react'; // Добавляем useCallback
import { Link } from 'react-router-dom';

import EmptyOrder from './EmptyOrder';
import OrderRow from './OrderRow';
import style from './Orders.module.css';
import appFetch from '../../services/api';
import NavigationOrders from '../Settings/NavigationOrders';

const STATE_ENUM = {
  active: 'Активно',
  success: 'Выполнено',
  cancel: 'Отменено',
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [orderState, setOrderState] = useState('Активно');

  // Безопасное получение user.u_id
  const user = JSON.parse(localStorage.getItem('userdata'))?.user || {};
  const userId = user.u_id;

  // --- 1. Выносим логику загрузки в отдельную функцию с useCallback ---
  const fetchOrders = useCallback(async () => {
    if (!userId) {
      console.warn('User ID not found, skipping fetch.');
      return;
    }

    setIsLoading(true);

    try {
      const allOrder = await appFetch('/drive', {
        body: {
          u_a_role: 2, // Роль "Водитель" (Мастер)
          lc: 99999999999999, // Получить все
        },
      });

      // Фильтруем заказы, на которые откликнулся текущий мастер
      const filteredOrders = Object.values(
        allOrder?.data?.booking || {},
      ).filter(
        (order) =>
          order.b_options?.type === 'order' &&
          order.drivers?.some((driver) => driver.u_id === userId),
      );

      // Форматируем данные, чтобы в `drivers` был только объект текущего мастера
      const formattedOrders = filteredOrders.map((item) => {
        return {
          ...item,
          // Находим и сохраняем только данные нашего мастера для этого заказа
          driverData: item.drivers.find((driver) => driver.u_id === userId),
        };
      });

      // Фильтруем по статусу уже после основной загрузки
      const ordersByStatus = formattedOrders.filter(
        (order) => order.b_options?.status === orderState,
      );

      setOrders(ordersByStatus);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, orderState]); // Зависимости для useCallback

  useEffect(() => {
    const currentFilter =
      STATE_ENUM[window.location.hash.slice(1)] || 'Активно';
    setOrderState(currentFilter);
  }, []); // Этот useEffect для установки начального состояния по хэшу

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // Этот useEffect вызывает загрузку при изменении orderState

  // --- 2. Функция для перезагрузки данных, которую мы передадим в OrderRow ---
  const handleResponseCancelled = () => {
    // Просто вызываем нашу функцию загрузки снова
    fetchOrders();
  };

  return (
    <>
      <div className={style.order_row} style={{ marginBottom: 20 }}>
        <div>
          <h1 className={style.heading}>Биржа заказы</h1>
          <div className="df" style={{ paddingBottom: 0 }}>
            <div className="two-input">
              <Link to="/master/requests">
                <div className="myorders">
                  <p>
                    Мои отклики<span>{orders.length}</span>
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
        <div style={{ textAlign: 'center', padding: '20px' }}>Загрузка...</div>
      ) : orders.length === 0 ? (
        <EmptyOrder />
      ) : (
        orders.map((item) => (
          <OrderRow
            // --- 3. Передаем необходимые props в дочерний компонент ---
            key={item.b_id} // Уникальный ключ
            b_id={item.b_id} // ID заказа для API-запроса
            onResponseCancelled={handleResponseCancelled} // Колбэк для обновления
            userProfile={{
              avatar: item.b_options?.author?.photo,
              name: item.b_options?.author?.name,
              projectsCount: 12, // Заглушка, или нужно получать эти данные
              hireRate: 100, // Заглушка
            }}
            orderInfo={{
              device: item.b_options?.title,
              problem: item.b_options?.description,
              budget: item.b_options?.client_price,
            }}
            photos={item.b_options?.photos || []}
            images={item.b_options?.photos || []}
            commentData={{
              author: {
                avatar: user.u_photo, // Аватар текущего мастера
                name: `${user.u_name || ''} ${user.u_family || ''}`.trim(),
                ordersCount: 0, // Заглушка
              },
              message: item.driverData?.c_options?.comment,
              offers: [
                {
                  description: item.b_options?.title,
                  time: item.driverData?.c_options?.time
                    ? `${item.driverData.c_options.time} час`
                    : '-',
                  price: item.driverData?.c_options?.bind_amount,
                },
              ],
              statuses: [
                {
                  class: 'status',
                  icon: '/img/icons/eye_white.png',
                  text: 'просмотрено',
                },
              ],
            }}
          />
        ))
      )}
    </>
  );
}

export default Orders;
