import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import AddedDevice from './AddedDevice';
import './added-devices.css';
import styles from './AddedDevices.module.css';
import { useClientOrders, useFinishedOrders } from '../../state/order';
import { useLanguage } from '../../state/language';

function AddedDevices() {
  const text = useLanguage();
  const { orders: activeOrders } = useClientOrders();
  const { orders: archiveOrders } = useFinishedOrders();
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
            <Link className={styles.button} to="/client/requests/create/title">
              {text('Add device')}
            </Link>
          </div>

          <div className={styles.table_wrap}>
            <div
              className={`big_nav-devicefsadsad df align ${styles.table}`}
              style={{ marginBottom: 0 }}
            >
              <div className="">
                <h2>{text('Orders')}</h2>
              </div>
              <div className="big_nav-text_2 df align">
                <div className="tex-1 df">
                  <h2 className="nav-text-left">{text('Price')}</h2>

                  <h2 className="nav-text-center">{text('Offer')}</h2>

                  <h2 className="nav-text-center">{text('Status')}</h2>
                  <h2 className="nav-text-right">{text('Manage')}</h2>
                </div>
              </div>
            </div>
            {(tabsFilter === '#archive' ? archiveOrders : activeOrders)
              .map((v) =>
                <AddedDevice
                  serviceId={v.serviceId}
                  desiredPrice={v.desiredPrice}
                  agreedPrice={v.agreedPrice}
                  description={v.description}
                  status={v.status}
                  createdAt={v.createdAt}
                  key={v.id}
                  id={v.id}
                  contractorOffers={v.contractorOffers}
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

export default AddedDevices;
