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
  const otherRequests = useService(getMasterRequests, []);
  const userRequests = useService(getClientRequests, []);
  const [contendCount, setContentCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const filteredRequests = Object.values(
    otherRequests.data?.data?.booking || [],
    userRequests.data?.data?.booking || [],
  ).filter(
    (item) =>
      item.b_options?.type === 'order' &&
      item.b_options?.status.includes(statusEnum[window.location.hash]),
  );
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
                    return (
                      <tr key={item.b_id}>
                        {' '}
                        <td>{index + 1}</td>
                        {/* Добавляем ключ для каждого элемента списка */}
                        <td>
                          <img
                            src="/img/icons/icomoon-free_pencil.svg"
                            alt=""
                            style={{ marginRight: '10px', cursor: 'pointer' }}
                            onClick={() => setVisibleModalEdit(true)}
                          />
                          <Link
                            to={
                              window.location.pathname.includes('/master')
                                ? '/master/requests/my_order/' + item.b_id
                                : '/client/requests/my_order/' + item.b_id
                            }
                          >
                            {item.b_options?.title}
                          </Link>
                        </td>
                        <td>
                          <img
                            src={SERVER_PATH + item.b_options?.author?.avatar}
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
                        <td>{item.b_options?.description}</td>
                        <td>{item.b_options?.client_price}</td>
                        <td>
                          <p className={style.status_ok}>выполнено</p>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* для мобильной */}
          <div className={style.cards__wrap}>
            <div className={style.card_block}>
              <Link
                to={
                  window.location.pathname.includes('/master')
                    ? '/master/requests/my_order/1'
                    : '/client/requests/my_order/1'
                }
              >
                Название устройства
              </Link>
              <p className={style.card__date}>13 января, 22:26</p>
              <div className={style.card__line}></div>
              <div className={style.card__row}>
                <div className={style.card__profile}>
                  <img
                    src="/img/profile.png"
                    alt=""
                    style={{ marginRight: '10px' }}
                  />
                  Ник
                </div>
                <div className={style.card__col}>
                  <p className={style.status_working}>в работе</p>
                  <p className={style.card__price}>2000 руб</p>
                </div>
              </div>
            </div>

            <div className={style.card_block}>
              <Link
                to={
                  window.location.pathname.includes('/master')
                    ? '/master/requests/my_order/1'
                    : '/client/requests/my_order/1'
                }
              >
                Название устройства
              </Link>
              <p className={style.card__date}>13 января, 22:26</p>
              <div className={style.card__line}></div>
              <div className={style.card__row}>
                <div className={style.card__profile}>
                  <img
                    src="/img/profile.png"
                    alt=""
                    style={{ marginRight: '10px' }}
                  />
                  Ник
                </div>
                <div className={style.card__col}>
                  <p className={style.status_ok}>выполнено</p>
                  <p className={style.card__price}>2000 руб</p>
                </div>
              </div>
            </div>

            <div className={style.card_block}>
              <Link
                to={
                  window.location.pathname.includes('/master')
                    ? '/master/requests/my_order/1'
                    : '/client/requests/my_order/1'
                }
              >
                Название устройства
              </Link>
              <p className={style.card__date}>13 января, 22:26</p>
              <div className={style.card__line}></div>
              <div className={style.card__row}>
                <div className={style.card__profile}>
                  <img
                    src="/img/profile.png"
                    alt=""
                    style={{ marginRight: '10px' }}
                  />
                  Ник
                </div>
                <div className={style.card__col}>
                  <p className={style.status_cancel}>выполнено</p>
                  <p className={style.card__price}>2000 руб</p>
                </div>
              </div>
            </div>
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
