import 'swiper/css';
import 'swiper/css/navigation';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import EmptyOrder from './Offers/EmptyOrder';
import OrderRow from '../manage/Offer/OrderRow';
import { useLanguage } from 'app/state/language';
import { OrderStatus, useAvailableOrders, useContractorFinishedOrders } from 'app/state/order';
import { useUser, useUsersByIds, UserRole } from 'app/state/user';
import 'app/styles/legacy/orders.css';
import 'app/styles/legacy/swiper.css';
import style from './Offers/Offers.module.css';

function Offers() {
  const text = useLanguage();
  const [activeStatus, setActiveStatus] = useState('active');

  const { user, isLoading: isUserLoading } = useUser();
  const { orders: activeOrders, isLoading: isActiveOrdersLoading } = useAvailableOrders(true, false);
  const { orders: finishedOrders, isLoading: isFinishedOrdersLoading } = useContractorFinishedOrders(true, false);
  const orders = [...new Map(
    [...activeOrders, ...finishedOrders].map(order => [order.id, order])
  ).values()];

  const responseOrders = orders.filter(order => {
    return order.contractorOffers.length > 0;
  });

  const filteredOrders = responseOrders.filter(order => {
    if (activeStatus === 'completed') {
      return order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CLOSED;
    }
    if (activeStatus === 'cancelled') {
      return order.status === OrderStatus.CANCELLED;
    }
    return order.status !== OrderStatus.COMPLETED
      && order.status !== OrderStatus.CLOSED
      && order.status !== OrderStatus.CANCELLED;
  });

  const clientIds = [...new Set(filteredOrders.map(order => order.clientId))];
  const { users: clientProfiles, isLoading: isClientProfilesLoading } = useUsersByIds(clientIds);

  // Доступно только для мастера
  if (!isUserLoading && (!user.id || user.role !== UserRole.Contractor)) {
    return null;
  }

  const clientsMap = new Map(isClientProfilesLoading ? [] : clientProfiles.map(profile => [profile.id, profile]));

  const handleResponseChanged = () => {
    // Пока здесь не требуется дополнительных действий
  };

  const isLoading = isUserLoading || isActiveOrdersLoading || isFinishedOrdersLoading || isClientProfilesLoading;

  return (
    <>
      <div className={style.order_row} style={{ marginBottom: 20 }}>
        <div className={style.header_content}>
          <h1 className={style.heading}>{text('Exchange orders')}</h1>
          <div className={style.navigation_row}>
          <div className="df" style={{ paddingBottom: 0 }}>
            <div className="two-input">
              {/* todo: здесь глюк с навигацией: обе ссылки ведут к одному URL */}
              <Link to="/contractor/requests">
                <div className="myorders">
                  <p>
                    {text('My responses')}<span>{responseOrders.length}</span>
                  </p>
                </div>
              </Link>
              <Link to="/contractor/requests">
                <div className="myorders">
                  <p>{text('All orders')} </p>
                </div>
              </Link>
            </div>
          </div>
          <nav className={style.status_tabs} aria-label="Статусы откликов">
            {[
              ['active', 'Активные'],
              ['completed', 'Выполненные'],
              ['cancelled', 'Отменённые'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`${style.status_tab} ${activeStatus === value ? style.status_tab_active : ''}`}
                onClick={() => setActiveStatus(value)}
              >
                {label}
              </button>
            ))}
          </nav>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>{text('Loading...')}</div>
      ) : filteredOrders.length === 0 ? (
        <EmptyOrder />
      ) : (
        filteredOrders.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            clientProfile={clientsMap.get(order.clientId)}
            onResponseChanged={handleResponseChanged}
          />
        ))
      )}
    </>
  );
}

export default Offers;
