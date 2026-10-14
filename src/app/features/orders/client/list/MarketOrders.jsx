import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import MarketOrder from '../manage/MarketOrder';
import { useClientOrders, useFinishedOrders } from 'app/state/order';
import { useLanguage } from 'app/state/language';
import './MarketOrders/MarketOrders.css';
import styles from './MarketOrders/MarketOrders.module.css';

function MarketOrders() {
  const text = useLanguage();
  const { orders: activeOrders } = useClientOrders(true, false);
  const { orders: archiveOrders } = useFinishedOrders(true, false);
  const tabsFilter = window.location.hash;

  useEffect(() => {
    document.title = text('Added devices');
  }, [text]);

  return (
    <section className="page_7">
      <div className={`container_added ${styles.block}`}>
        <div className="adding_devices font_abel">
          <div className="device">
            <div className="device_text-2">
              <h2>{text('Added devices')}</h2>
              <h3>{text('Applications')}</h3>
            </div>
          </div>
          <div className={styles.block_nav}>
            <div className="nav_device df " style={{ margin: 0 }}>
              <div
                className={`nav_device-1 ${
                  window.location.hash === '' && 'nav_device-1-active'
                } ${styles.relative}`}
              >
                {/* <Link to="/added-device">
                                      <h2>Актуальное</h2>
                                  </Link> */}
                <Link className="just__flexingfaa" to="/client/requests">
                  <h2>{text('Current')}</h2>
                </Link>
                <div className={styles.counter}>
                  <span>{activeOrders.length ?? ''}</span>
                </div>
              </div>
              <div
                className={`nav_device-2 ${
                  window.location.hash === '#archive' && 'nav_device-1-active'
                } ${styles.relative}`}
              >
                <Link className="just__flexingfaa" to="#archive">
                  <h2>{text('Archive')}</h2>
                </Link>
                <div className={styles.counter}>
                  <span>{archiveOrders.length ?? ''}</span>
                </div>
              </div>
            </div>
            <Link className={styles.button} to="/client/requests/create/data">
              {text('Add device')}
            </Link>
          </div>

          <div className={styles.table_wrap}>
            <div className={styles.table}>
              <span>{text('Orders')}</span>
              <span>{text('Price')}</span>
              <span>{text('Offer')}</span>
              <span>{text('Status')}</span>
              <span>{text('Manage')}</span>
            </div>
            {(tabsFilter === '#archive' ? archiveOrders : activeOrders)
              .map((v) =>
                <MarketOrder
                  productId={v.productId}
                  contractorId={v.contractorId}
                  address={v.address}
                  desiredPrice={v.desiredPrice}
                  agreedPrice={v.agreedPrice}
                  description={v.description}
                  status={v.status}
                  createdAt={v.createdAt}
                  key={v.id}
                  id={v.id}
                  contractorsCount={v.contractorOffersCount}
                  attachments={v.attachments}
                />
              )
            }
          </div>
        </div>
      </div>
    </section>
  );
}

export default MarketOrders;
