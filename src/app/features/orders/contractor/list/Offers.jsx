import 'swiper/css';
import 'swiper/css/navigation';
import { Link } from 'react-router-dom';

import EmptyOrder from './Offers/EmptyOrder';
import OrderRow from '../manage/Offer/OrderRow';
import { useLanguage } from 'app/state/language';
import { useAvailableOrders } from 'app/state/order';
import { useUser, useUsersByIds, UserRole } from 'app/state/user';
import 'app/scss/orders.css';
import 'app/scss/swiper.css';
import style from './Offers/Offers.module.css';

function Offers() {
  const text = useLanguage();

  const { user, isLoading: isUserLoading } = useUser();
  const { orders, isLoading: isOrdersLoading } = useAvailableOrders(true, false);

  const filteredOrders = orders.filter(order => {
    return order.contractorOffers.length > 0;
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

  const isLoading = isUserLoading || isOrdersLoading || isClientProfilesLoading;

  return (
    <>
      <div className={style.order_row} style={{ marginBottom: 20 }}>
        <div>
          <h1 className={style.heading}>{text('Exchange orders')}</h1>
          <div className="df" style={{ paddingBottom: 0 }}>
            <div className="two-input">
              {/* todo: здесь глюк с навигацией: обе ссылки ведут к одному URL */}
              <Link to="/contractor/requests">
                <div className="myorders">
                  <p>
                    {text('My responses')}<span>{filteredOrders.length}</span>
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
