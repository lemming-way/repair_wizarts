import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import AddedDevice from './AddedDevice';
import './added-devices.css';
import styles from './AddedDevices.module.css';
import { useService } from '../../hooks/useService';
import { getClientRequests } from '../../services/request.service';
import appFetch from '../../utilities/appFetch';
import { useLanguage } from '../../state/language';

function AddedDevices() {
  const text = useLanguage();
  const requests = useService(getClientRequests, []);
  const [archiveOrders, setArchiveOrders] = useState([]);
  const tabsFilter = window.location.hash;
  useEffect(() => {
    appFetch('/drive/archive', {
      body: {
        lc: 9999999999,
      },
    }).then((v) => {
      const formattedData = Object.values(v.data.booking)
        .filter(
          (item) =>
            item.b_options.type === 'order' && !item.b_options.question1,
        )
        .sort(
          (a, b) =>
            new Date(b.b_created).getTime() - new Date(a.b_created).getTime(),
        );
      console.log(formattedData);
      setArchiveOrders(formattedData);
    });
  }, []);
  const filteredRequests = Object.values(requests.data?.data?.booking || [])
    .filter((item) => item.b_options.type === 'order')
    .sort(
      (a, b) =>
        new Date(b.b_created).getTime() - new Date(a.b_created).getTime(),
    );
  const onDeviceUpdate = (e) => requests.refetch();
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
                  <span>{filteredRequests.length}</span>
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
                  <span>{archiveOrders.length || 0}</span>
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
            {tabsFilter === '#archive'
              ? archiveOrders.map((v) => (
                  <AddedDevice
                    {...v.b_options}
                    status={v.b_options.status}
                    created_at={v.b_created}
                    key={v.b_id}
                    id={v.b_id}
                    onUpdate={onDeviceUpdate}
                    number_of_offers={v.drivers?.length || 0}
                    photoUrls={
                      v.b_options.client_feedback_photo_urls ||
                      v.b_options.photoUrls ||
                      []
                    }
                  />
                )) || []
              : filteredRequests?.map((v) => (
                  <AddedDevice
                    {...v.b_options}
                    status={v.b_options.status}
                    created_at={v.b_created}
                    key={v.b_id}
                    id={v.b_id}
                    onUpdate={onDeviceUpdate}
                    number_of_offers={v.drivers?.length || 0}
                    photoUrls={
                      v.b_options.client_feedback_photo_urls ||
                      v.b_options.photoUrls ||
                      []
                    }
                  />
                )) || []}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AddedDevices;
