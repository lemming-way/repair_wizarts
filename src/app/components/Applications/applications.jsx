import React, { useEffect } from 'react';
import { Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useNavigate } from 'react-router-dom';

import '../../scss/applications.css';
import { AnyImage, getKeyFor } from 'app/shared/ui';
import { useLanguage } from '../../state/language';
import { useAcceptInvoice, useAvailableOrders } from '../../state/order';
import { useUser, useUsersByIds } from '../../state/user';
import { useProducts } from '../../state/site-data';

import style from './applications.module.css';

function MyApplications() {
  const text = useLanguage();
  const { user } = useUser();
  const navigate = useNavigate();

  const { orders, isLoading: isLoadingOrders } = useAvailableOrders(false, true);

  const clientIds = [...new Set(orders.map(order => order.clientId))];
  const { users: clients, isLoading: isLoadingClients } = useUsersByIds(clientIds);
  const clientsMap = new Map(clients.map(client => [client.id, client]));

  const { products, isLoading: isLoadingProducts } = useProducts();

  const { acceptInvoice } = useAcceptInvoice();

  useEffect(() => {
    document.title = text('Applications');
  }, [text]);

  const handleAcceptOrder = async (orderId) => {
    try {
      await acceptInvoice(orderId);
      const order = orders.find(o => o.id === orderId);
      if (order && user.id) {
        navigate(`/contractor/chat/${order.clientId}_${user.id}`);
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      // todo: Возможно, отобразить ошибку пользователю
    }
  };

  const handleDeclineOrder = (orderId) => {
    // Заглушка для отказа от заказа
    console.log(`Decline order with ID: ${orderId}`);
  };

  if (isLoadingOrders || isLoadingClients || isLoadingProducts) {
    return <div className="mini-text"><h1>{text('Loading applications...')}</h1></div>;
  }

  return (
    <>
      <div className="mini-text">
        <h1>{text('Applications')}</h1>
      </div>
      {orders.length === 0 && (
        <div className={style.empty_orders}>
          <img src="/img/robot.png" alt="" />
          <p className={style.heading}>{text('You have no applications yet')}</p>
          <p>{text('Submitted applications will appear on this page!')} </p>
        </div>
      )}

      <div className={style.orders}>
        {orders.map((order) => {
          const client = clientsMap.get(order.clientId);
          const productName = products[order.productId]?.name || text('Unknown service');
          const createdAt = new Date(order.createdAt).toLocaleDateString();

          return (
            <details className={style.details} key={order.id}>
              <summary className={style.summary}>
                <div className={style.summary_row}>
                  <p>{client ? client.fullname : text('Unknown client')}</p>
                  <p>{createdAt}</p>
                </div>
                <div className={style.summary_row}>
                  <p>{productName}</p>
                  <p>
                    {text('Cost')}:{' '}
                    <span className={style.price}>
                      {order.desiredPrice}₽
                    </span>
                  </p>
                </div>
                <div className={style.summary_row}>
                  <div className={style.flex_empty}></div>
                  <div>
                    <img className={style.arrow} src="/img/bot.png" alt="" />
                  </div>
                </div>
              </summary>
              <div className={style.details_body}>
                {
                  order.services?.map(item => 
                    <p className={style.text}>{item.service}</p>
                  )
                }
                <p className={style.text}>{order.description}</p>
                <div className={style.miniSwiperWrap}>
                  <Swiper
                    slidesPerView={4}
                    spaceBetween={30}
                    navigation={true}
                    modules={[Navigation]}
                    className={"miniSlider"}
                    breakpoints={{
                      0: { slidesPerView: 1 },
                      800: { slidesPerView: 1 },
                      1124: { slidesPerView: 1 },
                    }}
                  >
                    {order.attachments.map((id, index) => (
                      <SwiperSlide key={getKeyFor(id)} className={style.swiperSlide}>
                        <AnyImage src={id} alt={`${text('Image')} ${index + 1}`} />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                <div className={style.buttons_row}>
                  <div className={style.buttons}>
                    <button
                      className={style.button}
                      onClick={() => handleAcceptOrder(order.id)}
                    >
                      {text('Agree')}
                    </button>
                    <button
                      className={style.button_back}
                      onClick={() => handleDeclineOrder(order.id)}
                    >
                      {text('Decline')}
                    </button>
                  </div>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}

export default MyApplications;
