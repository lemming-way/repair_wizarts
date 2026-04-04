import { useState, useEffect } from 'react';
import '../../scss/orders.css';
import '../../scss/swiper.css';
import 'swiper/css';
import 'swiper/css/navigation';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';

import style from './Allorders.module.css';
import EmailSettings from './EmailSettings';
import FilterBlock from './FilterBlock';
import StatsBlock from './StatsBlock';
import OnlineDotted from '../onlineDotted/OnlineDotted';
import PaginationPages from '../Settings/PaginationPages';
import { useLanguage } from '../../state/language';
import { useOfferings } from '../../state/site-data';
import { useUsersByIds } from '../../state/user';
import { useAvailableOrders, useContractorOrders, OrderStatus, orderStatusString } from '../../state/order';

function AllOrders() {
  const text = useLanguage();
  const { categories, subcategories, offerings } = useOfferings();
  const [isVisibleEmailSettings, setVisibvleEmailSettings] = useState(false);
  const [selectValue, setSelectValue] = useState('All offers');
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  // --- Состояния для фильтров ---
  const [categoryFilter, setCategoryFilter] = useState(null); // null - нет фильтра
  const [offersCountFilter, setOffersCountFilter] = useState([]); // [[5, 10], [20, null]]
  const [budgetFilter, setBudgetFilter] = useState([]); // [[1000, 3000]]
  const [customPriceRange, setCustomPriceRange] = useState({
    min: '',
    max: '',
  });

  const {
    orders: availableOrders,
    isLoading: isLoadingAvailable,
    isError: isErrorAvailable,
    error: errorAvailable,
  } = useAvailableOrders();

  const {
    orders: contractorOrders,
    isLoading: isLoadingContractor,
    isError: isErrorContractor,
    error: errorContractor,
  } = useContractorOrders();

  const isLoading = isLoadingAvailable || isLoadingContractor;
  const isFetchError = isErrorAvailable || isErrorContractor;
  const fetchError = errorAvailable || errorContractor;

  const pendingContractorOrders = contractorOrders.filter(
    (o) =>
      o.status === OrderStatus.PUBLISHED ||
      o.status === OrderStatus.REQUESTED
  );

  const allOrders = [
    ...availableOrders,
    ...pendingContractorOrders,
  ];

  const clientIds = Array.from(new Set(allOrders.map(o => o.clientId)));  // список уникальных id
  const { users: clients } = useUsersByIds(clientIds);
  const clientsById = new Map();
  for (const user of clients) clientsById.set(user.id, user);
  const getClient = (order) =>
    clientsById.get(order.clientId) ?? null;

  const getPrice = (order) => {
    return order.contractorPrice ?? order.desiredPrice;
  };

  // Сейчас заглушка. todo: сделать правильный фильтр новых/просмотренных заказов
  const isNew = (order) => {
    return true;
  };

  const userOrderReqs = contractorOrders.filter(
    (o) => o.status === OrderStatus.PUBLISHED
  ).length;

  // Заглушка для статистики
  // todo: получить реальную статистику с бэка
  const stats = {
    totalProjects: 0,
    totalAmount: 0,
    totalOrders: 0,
  };

  // --- Логика фильтрации ---
  // Этот блок будет пересчитываться при каждом рендере
  const filteredOrders = allOrders.filter((order) => {
    // Фильтр "Новые" / "Просмотренные"
    if (selectValue === 'New' && !isNew(order)) return false;
    if (selectValue === 'Viewed' && isNew(order)) return false;

    // Фильтрация по категории
    if (categoryFilter && subcategories?.[ offerings?.[order.offeringId]?.parent ]?.parent !== categoryFilter) {
      return false;
    }

    // Фильтрация по количеству предложений (откликов от мастеров)
    if (offersCountFilter.length > 0) {
      const offersCount = order.contractorOffers.length ?? 0;
      const match = offersCountFilter.some((range) => {
        const [min, max] = range;
        if (max === null) return offersCount >= min;
        return offersCount >= min && offersCount <= max;
      });
      if (!match) return false;
    }

    // Фильтрация по бюджету
    if (budgetFilter.length > 0) {
      const price = getPrice(order);
      const match = budgetFilter.some((range) => {
        const [min, max] = range;
        if (max === null) return price >= min;
        return price >= min && price <= max;
      });
      if (!match) return false;
    }

    // Фильтрация по своему диапазону цен
    const price = getPrice(order);
    if (customPriceRange.min && price < Number(customPriceRange.min))
      return false;
    if (customPriceRange.max && price > Number(customPriceRange.max))
      return false;

    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, offersCountFilter, budgetFilter, customPriceRange]);

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
            <Link to="/contractor/requests/orders#active">
              <div className="myorders">
                <p>
                  {text('My responses')} <span>{userOrderReqs}</span>
                </p>
              </div>
            </Link>
            <Link to="/contractor/requests">
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
                  {text(selectValue)}
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
          ) : isFetchError ? (
            <p>{`${text('Loading error')}${fetchError ? `: ${text(fetchError)}` : ''}`}</p>
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
                  (currentPage - 1) * ordersPerPage,
                  currentPage * ordersPerPage,
                )
                .map((order) => (
                  <div
                    key={order.id}
                    className={`${style.row_order} ${style.first_row}`}
                  >
                    <div className={style.block_title}>
                      <Link to={`/contractor/requests/offer/${order.id}`}>
                        <h3 className={style.heading}>
                          {offerings?.[order.offeringId]?.name || text('Untitled')}
                        </h3>
                      </Link>
                      <p className={style.text_navigation}>
                        {categories?.[ subcategories?.[ offerings?.[order.offeringId]?.parent ]?.parent ]?.name ?? ''}
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
                        <p>{text('offers')} {order.contractorOffers.length}</p>
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
                              getClient(order)?.avatar || '/img/profil_img/1.png'
                            }
                            alt=""
                          />
                        </div>
                        <div className={style.col}>
                          <p>{getClient(order)?.fullname || text('Unnamed')}</p>
                          <p>1 {text('project on site')}</p>
                          <p>100% {text('hired')}</p>
                        </div>
                      </div>

                      <div className={style.block_price}>
                        <p className={style.price}>
                          {getPrice(order)
                            ? `${order.b_options.client_price} ₽`
                            : text('Price not specified')}
                        </p>
                        <p className={style.status}>
                          <img src="/img/icon-confirm.png" alt="" />
                          {orderStatusString[order.status] || text('No status')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          <div className={style.pagination_wrap}>
            <PaginationPages
              contentCountInPage={ordersPerPage}
              contentLength={filteredOrders.length}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
            <div className={style.select_pages_wrap}>
              <p className={style.select_pages_wrap}>{text('Show')}:</p>
              <select
                className={style.select_pages__select}
                value={ordersPerPage}
                onChange={(e) => setOrdersPerPage(Number(e.target.value))}
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

export default AllOrders;
