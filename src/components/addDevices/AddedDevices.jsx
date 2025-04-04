import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AddedDevice from './AddedDevice';
import './added-devices.css';
import { useService } from '../../hooks/useService';
import { getClientRequests } from '../../services/request.service';
import styles from './AddedDevices.module.css';

function AddedDevices() {
  const requests = useService(getClientRequests, []);

  // временно тестовые данные
  const filteredRequests = Object.values(
    requests.data?.data?.booking || [],
  ).filter((item) => item.b_options.type === 'order');
  const onDeviceUpdate = (e) => requests.refetch();

  useEffect(() => {
    document.title = 'Добавленные устройства';
  }, []);

  return (
    <section className="page_7">
      <div className={`container_added ${styles.block}`}>
        <div className="adding_devices font_abel">
          <div className="device">
            <div className="device_text-2">
              <h2>Добавленные устройства</h2>
              <h3>Заявки</h3>
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
                  <h2>Актуальное</h2>
                </Link>
                <div className={styles.counter}>
                  <span>5</span>
                </div>
              </div>
              <div
                className={`nav_device-2 ${
                  window.location.hash === '#archive' && 'nav_device-1-active'
                } ${styles.relative}`}
              >
                <Link className="just__flexingfaa" to="#archive">
                  <h2>Архив</h2>
                </Link>
                <div className={styles.counter}>
                  <span>2</span>
                </div>
              </div>
            </div>
            <Link className={styles.button} to="/client/requests/create/title">
              Добавить устройство
            </Link>
          </div>

          <div className={styles.table_wrap}>
            <div
              className={`big_nav-devicefsadsad df align ${styles.table}`}
              style={{ marginBottom: 0 }}
            >
              <div className="">
                <h2>Заказы</h2>
              </div>
              <div className="big_nav-text_2 df align">
                <div className="tex-1 df">
                  <h2 className="nav-text-left">Цена</h2>

                  <h2 className="nav-text-center">Предложение</h2>

                  <h2 className="nav-text-center">Статус</h2>
                  <h2 className="nav-text-right">Управлять</h2>
                </div>
              </div>
            </div>
            {filteredRequests?.map((v) => (
              <AddedDevice
                {...v.b_options}
                status={v.b_options.status}
                created_at={v.b_created}
                key={v.b_id}
                id={v.b_id}
                onUpdate={onDeviceUpdate}
                number_of_offers={v.drivers?.length || 0}
              />
            )) || []}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AddedDevices;
