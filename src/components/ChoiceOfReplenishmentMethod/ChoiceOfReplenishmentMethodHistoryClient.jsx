import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { selectUser } from '../../slices/user.slice';
import { useLanguage } from '../../state/language';

function ChoiceOfReplenishmentMethodHistoryClient() {
  const text = useLanguage();
  const user =
    Object.values(useSelector(selectUser)?.data?.user || {})[0] || {};
  const [history, setHistory] = useState([]);
  useEffect(() => {
    if (user?.u_details?.history_of_pay)
      setHistory(user?.u_details?.history_of_pay);
  }, [user?.u_details?.history_of_pay]);
  const historyOfPaymentsItems = history.map((item) => (
    <div className="blocks">
      <div className="block df">
        <div className="df poplocho">
          <img src="/img/img-qivi-2.png" alt="" />
          <h2>{text(item.title ?? item.type ?? 'Top up balance')} </h2>
        </div>
        <p>
          <span className="abel">+{item.cost}</span>₽
        </p>
      </div>
    </div>
  ));
  return (
    <div className="middle-block-2 middle-block-2ffsdfas">
      <Link
        to="/client/settings/wallet_history"
        style={{ textDecoration: 'none' }}
      >
        <h1>{text('Transaction history')} </h1>
      </Link>

      <div className="blocks">
        {historyOfPaymentsItems.length ? historyOfPaymentsItems : text('No entries yet')}
        {/* <div className="block df">
          <div className="df poplocho">
            <img src="/img/img-qivi-2.png" alt="" />
            <h2>Пополнение счета </h2>
          </div>
          <p>
            <span className="abel">+1500</span>₽
          </p>
        </div>
        <div className="block df">
          <div className="df poplocho">
            <img src="/img/img-card-2.png" alt="" />
            <h2>Пополнение счета </h2>
          </div>
          <p>
            <span className="abel">+2000</span>₽
          </p>
        </div>
        <div className="block df">
          <div className="df poplocho">
            <img src="/img/img-card-2.png" alt="" />
            <h2>Пополнение счета </h2>
          </div>
          <p>
            <span className="abel">+500</span>₽
          </p>
        </div> */}
      </div>
    </div>
  );
}

export default ChoiceOfReplenishmentMethodHistoryClient;
