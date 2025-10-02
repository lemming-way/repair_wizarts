import '../../scss/orders.css';
import '../../scss/swiper.css';
import 'swiper/css';
import 'swiper/css/navigation';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import OrderRowOffer from './OrderRowOffer';
import style from './Orders.module.css';
import appFetch from '../../utilities/appFetch';

function Offer() {
  const { id } = useParams();
  const [currentOrder, setCurrentOrder] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(id);
        await appFetch(`drive/get/`, {
          body: {
            u_a_role: 2,
            b_max_waiting: Math.floor(
              (new Date().getTime() + 4 * 24 * 60 * 60 * 1000) / 1000,
            ),
          },
        });
        const data = await appFetch('drive/now', {
          method: 'POST',
          body: {
            u_a_role: 2,
            b_max_waiting: Math.floor(
              (new Date().getTime() + 4 * 24 * 60 * 60 * 1000) / 1000,
            ),
          },
        });
        const allOrder = await appFetch('/drive', {
          body: {
            u_a_role: 2,
          },
        });
        const currentOrder = Object.values({
          ...(data.data.booking || {}),
          ...(allOrder.data.booking || {}),
        }).find((item) => item.b_id === id);
        setCurrentOrder(currentOrder);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [id]);
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

  const navigator = useNavigate();

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

          <button
            className={style.button_back_v2}
            onClick={() => navigator('/master/requests')}
          >
            Назад
          </button>
        </div>
        {/* <NavigationOrders /> */}
      </div>
      {console.log(currentOrder)}
      <OrderRowOffer
        b_id={id}
        userName={currentOrder.b_options?.author.name}
        projectsPosted={1} // или можно сюда добавить реальную цифру, если появится
        hiredPercent={100} // условно
        deviceName={currentOrder.b_options?.title}
        problemDescription={currentOrder.b_options?.description}
        timeLeft={'1 день'} // можно рассчитать от b_start_datetime
        views={0}
        budget={currentOrder.b_options?.client_price}
        images={currentOrder.b_options?.photoUrls || []} // если будут фотки - подставишь
        profileImage={
          currentOrder.b_options?.author.photo || '/img/profil_img/1.png'
        }
      />
    </>
  );
}

export default Offer;
