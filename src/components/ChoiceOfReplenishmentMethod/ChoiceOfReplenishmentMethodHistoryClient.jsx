import { useEffect, useState } from 'react';
import { getBalanceHistory } from '../../services/balance.service';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../slices/user.slice';

function ChoiceOfReplenishmentMethodHistoryClient() {
  const user =
    Object.values(useSelector(selectUser)?.data?.user || {})[0] || {};
  const [history, setHistory] = useState([]);
  useEffect(() => {
    if (user?.u_details?.history_of_pay)
      setHistory(user?.u_details?.history_of_pay);
    // getBalanceHistory().then(setHistory);
  }, [user]);
  const historyOfPaymentsItems = history.map((item) => (
    <div className="blocks">
      <div className="block df">
        <div className="df poplocho">
          <img src="/img/img-qivi-2.png" alt="" />
          <h2>{item.type} </h2>
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
        <h1>История операций </h1>
      </Link>

      <div className="blocks">
        {historyOfPaymentsItems.length ? historyOfPaymentsItems : 'Пока пусто'}
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
