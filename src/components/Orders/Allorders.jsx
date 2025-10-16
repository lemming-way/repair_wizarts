import { useState, useEffect } from 'react';
import '../../scss/orders.css';
import '../../scss/swiper.css';
import 'swiper/css';
import 'swiper/css/navigation';
import { Link } from 'react-router-dom';
import style from './Allorders.module.css';

import FilterBlock from './FilterBlock';
import StatsBlock from './StatsBlock';
import EmailSettings from './EmailSettings';
import Dropdown from 'react-bootstrap/Dropdown';
import OnlineDotted from '../onlineDotted/OnlineDotted';
import PaginationPages from '../Settings/PaginationPages';
import appFetch from '../../utilities/appFetch';

function App() {
  const [isVisibleEmailSettings, setVisibvleEmailSettings] = useState(false);
  const [selectValue, setSelectValue] = useState('Все предложения');
  const [serviceInPage, setServiceInPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [offersCountFilter, setOffersCountFilter] = useState([]);
  const [budgetFilter, setBudgetFilter] = useState([]);
  const [customPriceRange, setCustomPriceRange] = useState({
    min: '',
    max: '',
  });

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
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
        const filteredOrders = Object.values({
          ...(data.data.booking || {}),
          ...(allOrder.data.booking || {}),
        })
          .filter((order) => order.b_options?.type === 'order')
          .map((order) => ({
            ...order,
            isNew:
              new Date().getTime() - new Date(order.b_created_at).getTime() <
              2 * 24 * 60 * 60 * 1000,
          }));

        setOrders(filteredOrders);
      } catch (error) {
        console.error(error);
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // фильтрация заказов в зависимости от выбранного значения
  const filteredOrders = orders.filter((order) => {
    if (selectValue === 'Новые' && !order.isNew) return false;
    if (selectValue === 'Просмотренные' && order.isNew) return false;

    // Фильтрация по категории (если выбрана)
    if (categoryFilter && !order.category?.includes(categoryFilter)) {
      return false;
    }

    // Фильтрация по количеству предложений (если выбраны чекбоксы)
    if (offersCountFilter.length > 0) {
      const offersCount = order.c_options?.length ?? 0;
      const match = offersCountFilter.some((range) => {
        const [min, max] = range;
        if (max === null) return offersCount >= min;
        return offersCount >= min && offersCount <= max;
      });
      if (!match) return false;
    }

    // Фильтрация по бюджету (если выбраны чекбоксы)
    if (budgetFilter.length > 0) {
      const price = order.b_options?.client_price ?? 0;
      const match = budgetFilter.some((range) => {
        const [min, max] = range;
        if (max === null) return price >= min;
        return price >= min && price <= max;
      });
      if (!match) return false;
    }

    // Фильтрация по своему диапазону цен
    const price = order.b_options?.client_price ?? 0;
    if (customPriceRange.min && price < Number(customPriceRange.min))
      return false;
    if (customPriceRange.max && price > Number(customPriceRange.max))
      return false;

    return true;
  });

  return (
    <>
      {isVisibleEmailSettings && (
        <EmailSettings setVisibvleEmailSettings={setVisibvleEmailSettings} />
      )}
      <div className="mini-text">
        <h1>Заявки</h1>
      </div>

      <div className={style.top_row}>
        <div>
          <div className="two-input" style={{ marginRight: 0 }}>
            <Link to="/master/requests/orders#active">
              <div className="myorders">
                <p>
                  Мои отклики <span>1</span>
                </p>
              </div>
            </Link>
            <Link to="/master/requests">
              <div className="myorders">
                <p>Все заказы</p>
              </div>
            </Link>
          </div>
        </div>
        <div
          className={style.email_block}
          onClick={() => setVisibvleEmailSettings(true)}
        >
          <img src="/img/email.png" alt="" />
          <p>Настройка Email уведомления</p>
        </div>
      </div>

      <div className={style.main__row}>
        <div className={style.main__column}>
          <FilterBlock
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            offersCountFilter={offersCountFilter}
            setOffersCountFilter={setOffersCountFilter}
            budgetFilter={budgetFilter}
            setBudgetFilter={setBudgetFilter}
            customPriceRange={customPriceRange}
            setCustomPriceRange={setCustomPriceRange}
          />

          <StatsBlock />
        </div>

        <div className={style.allorders}>
          <div className={style.heading__row}>
            <h1 className={style.heading__h1}>
              Новое на бирже
              <span>{filteredOrders.length} проектов</span>
            </h1>
            <div style={{ flex: 1 }}></div>
            <div className={style.flex_row_select}>
              <p className={style.heading__p}>Показать</p>

              <Dropdown>
                <Dropdown.Toggle
                  variant="success"
                  id="dropdown-basic"
                  className={style.heading__select}
                >
                  {selectValue}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item
                    className={style.select__item}
                    onClick={() => setSelectValue('Все предложения')}
                  >
                    Все предложения
                  </Dropdown.Item>
                  <Dropdown.Item
                    className={style.select__item}
                    onClick={() => setSelectValue('Новые')}
                  >
                    Новые
                  </Dropdown.Item>
                  <Dropdown.Item
                    className={style.select__item}
                    onClick={() => setSelectValue('Просмотренные')}
                  >
                    Просмотренные
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          {isLoading ? (
            <p>Загрузка заказов...</p>
          ) : fetchError ? (
            <p>Ошибка загрузки: {fetchError}</p>
          ) : filteredOrders.length === 0 ? (
            <p>Нет доступных заказов.</p>
          ) : (
            <div>
              <div className={`${style.heading_table}`}>
                <div
                  className={`fsdfsaooo mobile-big_nav-text_1 ${style.heading_table_row}`}
                >
                  <p className="inter">Проект</p>
                  <div className={style.empty}></div>
                  <p className="inter">Покупатель</p>
                  <p className="inter">Цена</p>
                </div>
              </div>

              {filteredOrders
                .slice(
                  (currentPage - 1) * serviceInPage,
                  currentPage * serviceInPage,
                )
                .map((order) => (
                  <div
                    key={order.b_id}
                    className={`${style.row_order} ${style.first_row}`}
                  >
                    <div className={style.block_title}>
                      <Link to={`/master/requests/offer/${order.b_id}`}>
                        <h3 className={style.heading}>
                          {order.b_options?.title || 'Без названия'}
                        </h3>
                      </Link>
                      <p className={style.text_navigation}>{order.category}</p>
                      <div
                        className={style.row}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }}
                      >
                        <p>осталось еще 3 дня</p>
                        <p>предложений {order.c_options?.length ?? 0}</p>
                      </div>
                    </div>

                    <div className={style.modile_col}>
                      <div className={style.block_author}>
                        <div style={{ position: 'relative' }}>
                          <div className={style.dotted_wrap}>
                            <OnlineDotted isVisible={true} />
                          </div>
                          <img
                            src={
                              order.b_options?.author?.photo ||
                              '/img/profil_img/1.png'
                            }
                            alt=""
                          />
                        </div>
                        <div className={style.col}>
                          <p>{order.b_options?.author?.name || 'Без имени'}</p>
                          <p>1 проект на сайте</p>
                          <p>100% нанято</p>
                        </div>
                      </div>

                      <div className={style.block_price}>
                        <p className={style.price}>
                          {order.b_options?.client_price
                            ? `${order.b_options.client_price} ₽`
                            : 'Цена не указана'}
                        </p>
                        <p className={style.status}>
                          <img src="/img/icon-confirm.png" alt="" />
                          {order.b_options?.status || 'Без статуса'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          <div className={style.pagination_wrap}>
            <PaginationPages
              contentCountInPage={serviceInPage}
              contentLength={filteredOrders.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
            <div className={style.select_pages_wrap}>
              <p className={style.select_pages_wrap}>Показать:</p>
              <select
                className={style.select_pages__select}
                value={serviceInPage}
                onChange={(e) => setServiceInPage(Number(e.target.value))}
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

export default App;
