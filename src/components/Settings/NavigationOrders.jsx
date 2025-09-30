import { Link } from 'react-router-dom';

import style from './NavigationOrders.module.css';

export default function NavigationOrders({ setStatusOrder }) {
  return (
    <>
      <div className={style.links_block}>
        <Link
          className={`${style.link} ${
            window.location.hash === '#active' || window.location.hash === ''
              ? 'active2'
              : null
          }`}
          to="/master/requests/orders#active"
          onClick={() => setStatusOrder('Активно')}
        >
          Активные
        </Link>
        <Link
          className={`${style.link} ${
            window.location.hash === '#success' ? 'active2' : null
          }`}
          to="/master/requests/orders#success"
          onClick={() => setStatusOrder('Выполнено')}
        >
          Выполненные
        </Link>
        <Link
          className={`${style.link} ${
            window.location.hash === '#cancel' ? 'active2' : null
          }`}
          to="/master/requests/orders#cancel"
          onClick={() => setStatusOrder('Отменено')}
        >
          Отмененные
        </Link>
      </div>
    </>
  );
}
