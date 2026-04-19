import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from 'app/state/language';
import style from './CreateDirect.module.scss';

function ConfirmationBlock({ visibleConfirm, setVisibleConfirm }) {
  const text = useLanguage();

  if (!visibleConfirm) {
    return null;
  }

  return (
    <div className={style.blockConfirm_wrap}>
      <div
        className={style.blockPayment}
        style={{ padding: '50px 50px 50px 50px' }}
      >
        <div
          className={style.close}
          onClick={() => setVisibleConfirm(false)}
        >
          <img src="/img/close.svg" alt="" />
        </div>

        <h2>{text('You have confirmed the contractor')}</h2>
        <div className={style.row}>
          <p>
            {text('By confirming the performer you open a chat dialog with them')}
          </p>
        </div>

        <Link
          to="/client/requests/my_orders/#order"
          className={style.button_confirm}
        >
          {text('Continue')}
        </Link>
      </div>
    </div>
  );
}

export default ConfirmationBlock;
