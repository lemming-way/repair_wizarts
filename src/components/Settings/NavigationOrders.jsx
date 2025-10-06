import { Link } from 'react-router-dom';

import { useLanguage } from '../../state/language';
import style from './NavigationOrders.module.css';

export default function NavigationOrders({ setStatusOrder }) {
  const text = useLanguage();
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
          onClick={() => setStatusOrder('Active')}
        >
          {text('Active Orders')}
        </Link>
        <Link
          className={`${style.link} ${
            window.location.hash === '#success' ? 'active2' : null
          }`}
          to="/master/requests/orders#success"
          onClick={() => setStatusOrder('Completed')}
        >
          {text('Completed Orders')}
        </Link>
        <Link
          className={`${style.link} ${
            window.location.hash === '#cancel' ? 'active2' : null
          }`}
          to="/master/requests/orders#cancel"
          onClick={() => setStatusOrder('Canceled')}
        >
          {text('Canceled Orders')}
        </Link>
      </div>
    </>
  );
}
