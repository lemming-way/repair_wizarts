import { useState } from 'react';
import '../../scss/orders.css';
import '../../scss/swiper.css';
import 'swiper/css';
import 'swiper/css/navigation';
import { Link } from 'react-router-dom';
// import { Navigation } from "swiper";
import SERVER_PATH from '../../constants/SERVER_PATH';
import style from './MyOrdersMaster.module.css';

import NavigationOrdersClient from '../Settings/NavigationOrdersClient';
import ModalEditOrder from './ModalEditOrder';
import PaginationPages from '../Settings/PaginationPages';
import {
  getClientRequests,
  getMasterRequests,
} from '../../services/request.service';
import { useService } from '../../hooks/useService';
const statusEnum = {
  '#order': 'Активно',
  '#all': 'Активно',
  '#working': 'В работе',
  '#cancel': 'Отменено',
};

function MyOrdersMaster() {
  const userRequests = useService(getClientRequests, []);
  const [contendCount, setContentCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState('');
  const rawRequests = [
    ...Object.values(userRequests.data?.data?.booking || {}),
  ];

  const filteredRequests = rawRequests
    .filter(
      (item) =>
        item.b_options?.type === 'order' &&
        item.b_options?.status.includes(statusEnum[window.location.hash]) &&
        item.b_options.title
          .toLowerCase()
          .includes(searchFilter.toLowerCase()) &&
        item.drivers !== undefined &&
        item.b_state !== '2' &&
        !item.b_options.winnerMaster,
    )
    .flatMap((item) => {
      if (!Array.isArray(item.drivers) || item.drivers.length === 0) {
        return [item];
      }
      return item.drivers.map((driver) => ({
        ...item,
        drivers: driver,
      }));
    });
  console.log(userRequests);
  const [isVisibleModalEdit, setVisibleModalEdit] = useState(false);
  return (
    <>
      {isVisibleModalEdit && (
        <ModalEditOrder setVisibleModalEdit={setVisibleModalEdit} />
      )}

      <div className={style.block_main}>
        <div className={style.order_row}>
          <h1>Все заказы</h1>

          <div className={style.search_flex}>
            <div className={style.search_wrap}>
              <input
                className={style.search_input}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                type="text"
                placeholder="поиск.."
              />
              <div>
                <img
                  className={style.search_icon}
                  src="/img/search.png"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>

        <div className={style.content_wrap}>
          <NavigationOrdersClient />
          <div className={style.table_wrap}>
            <table className={style.table}>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Продавец</th>
                  <th>Заказан</th>
                  <th>Стоимость</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests
                  .slice(
                    (currentPage - 1) * contendCount,
                    currentPage * contendCount,
                  )
                  .map((item, index) => {
                    const StyleEnum = {
                      'В работе': 'status_working',
                      Отменено: 'status_cancel',
                      Активно: 'status_ok',
                    };
                    const currentStatusStyleClass =
                      StyleEnum[item.b_options.status];
                    return (
                      <tr key={item.b_id}>
                        {' '}
                        <td>{item.b_options.title}</td>
                        {/* Добавляем ключ для каждого элемента списка */}
                        <td>
                          <img
                            src={
                              item.drivers?.c_options.author?.photo ||
                              '/img/img-camera.png'
                            }
                            alt=""
                            style={{
                              marginRight: '10px',
                              cursor: 'pointer',
                              width: 70,
                              borderRadius: 20,
                              height: 70,
                            }}
                            onClick={() => setVisibleModalEdit(true)}
                          />
                          <Link
                            to={
                              window.location.pathname.includes('/master')
                                ? '/master/requests/my_order/' + item.b_id
                                : '/client/requests/my_order/' + item.b_id
                            }
                          >
                            {item.c_options?.author.name || 'Anton'}
                          </Link>
                        </td>
                        <td>
                          <img
                            src={
                              item.b_options?.author?.photo ||
                              '/img/img-camera.png'
                            }
                            alt=""
                            style={{
                              marginRight: '10px',
                              width: '70px',
                              borderRadius: '50%',
                              height: '70px',
                              objectFit: 'cover',
                            }}
                          />
                          {item.b_options?.author?.name}
                        </td>
                        <td>{item.b_options?.client_price}</td>
                        {/* <td>{item.b_options?.client_price}</td> */}
                        <td>
                          <p className={style[currentStatusStyleClass]}>
                            {item.b_options.status}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* для мобильной */}
          <div className={style.cards__wrap}>
            {filteredRequests
              .slice(
                (currentPage - 1) * contendCount,
                currentPage * contendCount,
              )
              .map((item, index) => {
                const StyleEnum = {
                  'В работе': 'status_working',
                  Отменено: 'status_cancel',
                  Активно: 'status_ok',
                  Пауза: 'status_cancel',
                };
                const currentStatusStyleClass =
                  StyleEnum[item.b_options.status];
                return (
                  <div className={style.card_block} key={item.b_id}>
                    <Link
                      to={
                        window.location.pathname.includes('/master')
                          ? `/master/requests/my_order/${item.b_id}`
                          : `/client/requests/my_order/${item.b_id}`
                      }
                    >
                      {item.b_options?.title}
                    </Link>
                    <p className={style.card__date}>
                      {new Intl.DateTimeFormat('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(item.b_created))}
                    </p>
                    <div className={style.card__line}></div>
                    <div className={style.card__row}>
                      <div className={style.card__profile}>
                        <img
                          src={item.b_options.author.photo}
                          alt=""
                          style={{
                            cursor: 'pointer',
                            width: 40,
                            borderRadius: 20,
                            height: 40,
                            marginRight: 10,
                          }}
                        />
                        {item.b_options.author.name}
                      </div>
                      <div className={style.card__col}>
                        <p className={style[currentStatusStyleClass]}>
                          {item.b_options.status}
                        </p>
                        <p className={style.card__price}>
                          {item.b_options.client_price} руб
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className={style.pagination_wrap}>
            <PaginationPages
              contentCountInPage={contendCount}
              contentLength={filteredRequests.length}
              currentPage={currentPage}
              onPageChange={(newPage) => setCurrentPage(newPage)}
            />
            <div className={style.select_pages_wrap}>
              <p className={style.select_pages_wrap}>Показать:</p>
              <select
                className={style.select_pages__select}
                name=""
                id=""
                onChange={(e) => setContentCount(Number(e.target.value))}
              >
                <option value="10">10 на странице</option>
                <option value="20">20 на странице</option>
                <option value="50">50 на странице</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MyOrdersMaster;
