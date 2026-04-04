import { useState } from 'react';
import { Link } from 'react-router-dom';

import 'app/scss/orders.css';
import style from './ContractorsOffers.module.css';
import { useOfferings } from 'app/state/site-data';
import { useClientOrders, OrderStatus, orderStatusString } from 'app/state/order';
import { useUser, useUsersByIds } from 'app/state/user';
import PaginationPages from 'app/components/Settings/PaginationPages';

function ContractorsOffers() {
  const { user } = useUser();
  const { offerings } = useOfferings();
  const { orders } = useClientOrders();
  const [contentCount, setContentCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Фильтруем заказы только со статусом PUBLISHED
  const publishedOrders = orders.filter(
    (order) => order.status === OrderStatus.PUBLISHED
  );

  // Собираем все уникальные ID клиентов и подрядчиков из предложений
  const allContractorIds = [...new Set(
    publishedOrders.flatMap((order) => order.contractorOffers.map((offer) => offer.contractorId))
  )];

  // Загружаем профили всех необходимых пользователей
  const { users: fetchedUsers } = useUsersByIds(allContractorIds);
  const userMap = new Map(fetchedUsers.map((user) => [user.id, user]));

  // Формируем список элементов для отображения, разворачивая заказы по их предложениям
  const itemsToDisplay = publishedOrders.flatMap((order) => {
    return order.contractorOffers.map((offer) => {
      const contractor = userMap.get(offer.contractorId);
      return {
        order,
        offer,
        contractor,
      };
    });
  });

  return (
    <>
      <div className={style.block_main}>
        <div className={style.order_row}>
          <h1>Все заказы</h1>
          {/* Удалена секция поиска по заголовку */}
        </div>

        <div className={style.content_wrap}>
          {/* Удалена навигация по статусам */}
          <div className={style.table_wrap}>
            <table className={style.table}>
              <thead>
                <tr>
                  <th>Услуга</th>
                  <th>Исполнитель</th>
                  <th>Заказчик</th>
                  <th>Предложенная стоимость</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {itemsToDisplay
                  .slice(
                    (currentPage - 1) * contentCount,
                    currentPage * contentCount,
                  )
                  .map((item) => {
                    const currentStatusStyleClass = style.status_ok; // Для статуса PUBLISHED всегда будет "Активно"

                    return (
                      <tr key={`${item.order.id}-${item.offer.contractorId}`}>
                        <td>{offerings[item.order.offeringId] ?? 'Неизвестная услуга'}</td>
                        <td>
                          <img
                            src={ item.contractor?.avatar || '/img/img-camera.png' }
                            alt=""
                            style={{
                              marginRight: '10px',
                              cursor: 'pointer',
                              width: 70,
                              borderRadius: 20,
                              height: 70,
                            }}
                          />
                          <Link to={`/client/requests/my_order/${item.order.id}`}>
                            {item.contractor?.fullname || 'Неизвестный мастер'}
                          </Link>
                        </td>
                        <td>
                          <img
                            src={ user.avatar || '/img/img-camera.png' }
                            alt=""
                            style={{
                              marginRight: '10px',
                              width: '70px',
                              borderRadius: '50%',
                              height: '70px',
                              objectFit: 'cover',
                            }}
                          />
                          { user.fullname || 'Неизвестный заказчик' }
                        </td>
                        <td>{item.offer.price}</td>
                        <td>
                          <p className={currentStatusStyleClass}>
                            {orderStatusString[item.order.status]}
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
            {itemsToDisplay
              .slice(
                (currentPage - 1) * contentCount,
                currentPage * contentCount,
              )
              .map((item) => {
                const currentStatusStyleClass = style.status_ok; // Для статуса PUBLISHED всегда будет "Активно"
                return (
                  <div className={style.card_block} key={`${item.order.id}-${item.offer.contractorId}`}>
                    <Link to={`/client/requests/my_order/${item.order.id}`}>
                      {offerings[item.order.offeringId] ?? 'Неизвестная услуга'}
                    </Link>
                    <p className={style.card__date}>
                      {new Intl.DateTimeFormat('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(item.order.createdAt))}
                    </p>
                    <div className={style.card__line}></div>
                    <div className={style.card__row}>
                      <div className={style.card__profile}>
                        <img
                          src={ user.avatar || '/img/img-camera.png' }
                          alt=""
                          style={{
                            cursor: 'pointer',
                            width: 40,
                            borderRadius: 20,
                            height: 40,
                            marginRight: 10,
                          }}
                        />
                        { user.fullname || 'Неизвестный заказчик' }
                      </div>
                      <div className={style.card__col}>
                        <p className={currentStatusStyleClass}>
                          {orderStatusString[item.order.status]}
                        </p>
                        <p className={style.card__price}>
                          {item.offer.price} руб
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className={style.pagination_wrap}>
            <PaginationPages
              contentCountInPage={contentCount}
              contentLength={itemsToDisplay.length}
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

export default ContractorsOffers;
