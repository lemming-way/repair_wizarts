import { useState, useEffect, useCallback, useMemo } from 'react';
import '../../scss/orders.css';
import '../../scss/swiper.css';
import 'swiper/css';
import 'swiper/css/navigation';
import Dropdown from 'react-bootstrap/Dropdown';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import style from './Allorders.module.css';
import EmailSettings from './EmailSettings';
import FilterBlock from './FilterBlock';
import StatsBlock from './StatsBlock';
import { selectUser } from '../../slices/user.slice';
import appFetch from '../../utilities/appFetch';
import OnlineDotted from '../onlineDotted/OnlineDotted';
import PaginationPages from '../Settings/PaginationPages';
import { useLanguage } from '../../state/language';


// Переименовал App в AllOrders для большей ясности
function App() {
  const text = useLanguage();
  const user =
    Object.values(useSelector(selectUser)?.data?.user || {})[0] || {};
  const [isVisibleEmailSettings, setVisibvleEmailSettings] = useState(false);
  const [selectValue, setSelectValue] = useState('All offers');
  const [serviceInPage, setServiceInPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [allOrders, setAllOrders] = useState([]); // Храним все загруженные заказы
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [userOrderReqs, setUserOrderReqs] = useState(0);
  // --- Состояния для фильтров ---
  const [categoryFilter, setCategoryFilter] = useState(null); // null - нет фильтра
  const [offersCountFilter, setOffersCountFilter] = useState([]); // [[5, 10], [20, null]]
  const [budgetFilter, setBudgetFilter] = useState([]); // [[1000, 3000]]
  const [customPriceRange, setCustomPriceRange] = useState({
    min: '',
    max: '',
  });
  const fetchUserOrderReqs = useCallback(async () => {
    if (!user.u_id) {
      console.warn('User ID not found, skipping fetch.');
      return;
    }

    setIsLoading(true);
    setFetchError(null);

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
          order.drivers?.some((driver) => driver.u_id === user.u_id),
      );

      // Форматируем данные, чтобы в `drivers` был только объект текущего мастера
      const formattedOrders = filteredOrders.map((item) => {
        return {
          ...item,
          // Находим и сохраняем только данные нашего мастера для этого заказа
          driverData: item.drivers.find((driver) => driver.u_id === user.u_id),
        };
      });

      // Фильтруем по статусу уже после основной загрузки
      const ordersByStatus = formattedOrders.filter(() => true);
      setUserOrderReqs(ordersByStatus.length);
    } catch (error) {
      console.error(error);
      setFetchError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user.u_id]);
  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const dataNow = await appFetch('drive/now', {
          body: { u_a_role: 2 },
        });
        const dataAll = await appFetch('/drive', {
          body: { u_a_role: 2 },
        });

        const combinedOrders = {
          ...(dataNow.data.booking || {}),
          ...(dataAll.data.booking || {}),
        };

        const initialFilteredOrders = Object.values(combinedOrders)
          .filter((order) => order.b_options?.type === 'order')
          .map((order) => ({
            ...order,
            isNew:
              new Date().getTime() - new Date(order.b_created).getTime() <
              2 * 24 * 60 * 60 * 1000,
          }));

        setAllOrders(initialFilteredOrders);
      } catch (error) {
        console.error(error);
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
    fetchUserOrderReqs();
  }, [fetchUserOrderReqs]);
  const stats = useMemo(() => {
    // Статистика считается на основе всех загруженных заказов, до применения фильтров
    const totalProjects = allOrders.length;

    const totalAmount = allOrders.reduce((sum, order) => {
      const price = Number(order.b_options?.client_price) || 0;
      return sum + price;
    }, 0);

    // В данном контексте "Заказы" и "Проекты" - это одно и то же
    const totalOrders = allOrders.length;

    return {
      totalProjects,
      totalAmount,
      totalOrders,
    };
  }, [allOrders]);
  // --- Логика фильтрации ---
  // Этот блок будет пересчитываться при каждом рендере, если изменится состояние фильтров
  const filteredOrders = allOrders.filter((order) => {
    // Исключить заказы, где владелец — текущий пользователь
    const ownerId =
      order.b_options?.author?.id ||
      order.b_options?.author?.u_id ||
      order.b_options?.u_id;
    if (ownerId && String(ownerId) === String(user.u_id)) return false;

    // Фильтр "Новые" / "Просмотренные"
    if (selectValue === 'New' && !order.isNew) return false;
    if (selectValue === 'Viewed' && order.isNew) return false;

    // Фильтрация по категории
    if (categoryFilter && order.b_options?.category !== categoryFilter) {
      return false;
    }

    // Фильтрация по количеству предложений (откликов от мастеров)
    if (offersCountFilter.length > 0) {
      const offersCount = order.drivers?.length ?? 0;
      const match = offersCountFilter.some((range) => {
        const [min, max] = range;
        if (max === null) return offersCount >= min;
        return offersCount >= min && offersCount <= max;
      });
      if (!match) return false;
    }

    // Фильтрация по бюджету
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
        <h1>{text('Requests')}</h1>
      </div>

      <div className={style.top_row}>
        <div>
          <div className="two-input" style={{ marginRight: 0 }}>
            <Link to="/master/requests/orders#active">
              <div className="myorders">
                <p>
                  {text('My responses')} <span>{userOrderReqs}</span>
                </p>
              </div>
            </Link>
            <Link to="/master/requests">
              <div className="myorders">
                <p>{text('All orders')}</p>
              </div>
            </Link>
          </div>
        </div>
        <div
          className={style.email_block}
          onClick={() => setVisibvleEmailSettings(true)}
        >
          <img src="/img/email.png" alt="" />
          <p>{text('Email notification settings')}</p>
        </div>
      </div>

      <div className={style.main__row}>
        <div className={style.main__column}>
          {/* Передаем состояния и сеттеры в FilterBlock */}
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

          <StatsBlock stats={stats} />
        </div>

        <div className={style.allorders}>
          <div className={style.heading__row}>
            <h1 className={style.heading__h1}>
              {text('New on the exchange')}
              <span>{filteredOrders.length} {text('projects')}</span>
            </h1>
            <div style={{ flex: 1 }}></div>
            <div className={style.flex_row_select}>
              <p className={style.heading__p}>{text('Show')}</p>
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
                    onClick={() => setSelectValue('All offers')}
                  >
                    {text('All offers')}
                  </Dropdown.Item>
                  <Dropdown.Item
                    className={style.select__item}
                    onClick={() => setSelectValue('New')}
                  >
                    {text('New')}
                  </Dropdown.Item>
                  <Dropdown.Item
                    className={style.select__item}
                    onClick={() => setSelectValue('Viewed')}
                  >
                    {text('Viewed')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>

          {isLoading ? (
            <p>{text('Loading orders...')}</p>
          ) : fetchError ? (
            <p>{text('Loading error')}: {fetchError}</p>
          ) : filteredOrders.length === 0 ? (
            <p>{text('No orders available that match the filters.')}</p>
          ) : (
            <div>
              <div className={`${style.heading_table}`}>
                <div
                  className={`fsdfsaooo mobile-big_nav-text_1 ${style.heading_table_row}`}
                >
                  <p className="inter">{text('Project')}</p>
                  <div className={style.empty}></div>
                  <p className="inter">{text('Buyer')}</p>
                  <p className="inter">{text('Price')}</p>
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
                          {order.b_options?.title || text('Untitled')}
                        </h3>
                      </Link>
                      <p className={style.text_navigation}>
                        {order.b_options?.category}
                      </p>
                      <div
                        className={style.row}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                        }}
                      >
                        <p>{text('3 days left')}</p>
                        <p>{text('offers')} {order.drivers?.length ?? 0}</p>
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
                          <p>{order.b_options?.author?.name || text('Unnamed')}</p>
                          <p>1 {text('project on site')}</p>
                          <p>100% {text('hired')}</p>
                        </div>
                      </div>

                      <div className={style.block_price}>
                        <p className={style.price}>
                          {order.b_options?.client_price
                            ? `${order.b_options.client_price} ₽`
                            : text('Price not specified')}
                        </p>
                        <p className={style.status}>
                          <img src="/img/icon-confirm.png" alt="" />
                          {order.b_options?.status || text('No status')}
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
              <p className={style.select_pages_wrap}>{text('Show')}:</p>
              <select
                className={style.select_pages__select}
                value={serviceInPage}
                onChange={(e) => setServiceInPage(Number(e.target.value))}
              >
                <option value="10">10 {text('per page')}</option>
                <option value="20">20 {text('per page')}</option>
                <option value="50">50 {text('per page')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
