import React, { useState } from 'react';
import { useLanguage } from '../../state/language';
import style from './ServiceDetail.module.scss';

function PaymentBlock({
  visibleBlockPayment,
  setVisibleBlockPayment,
  selectedIdx,
  setSelectedIdx,
  setVisibleConfirm,
}) {
  const text = useLanguage();

  const [errorBalance] = useState(true);
  const [errorCash] = useState(true);
  const [errorSumm] = useState(true);

  if (!visibleBlockPayment) {
    return null;
  }

  return (
    <div className={style.blockPayment_wrap}>
      {errorBalance ? (
        <div className={style.error}>
          {text('Please top up your balance by 500 rubles')}
        </div>
      ) : null}

      {errorCash ? (
        <div className={style.error}>{text('Pay the contractor in person')}</div>
      ) : null}

      {errorSumm ? (
        <div className={style.error}>
          {text('500 rubles will be deducted from your balance')}{' '}
        </div>
      ) : null}

      <div className={style.blockPayment}>
        <div
          className={style.close}
          onClick={() => setVisibleBlockPayment(false)}
        >
          <img src="/img/close.svg" alt="" />
        </div>

        <h2>{text('Payment')}</h2>
        <div className={style.row}>
          <div className={style.block_v2}>
            <p>{text('Pay through the website')}</p>
            <div className={style.radio}>
              <input
                type="radio"
                id="inputSite"
                name="radioPayments"
                checked={selectedIdx === 0}
                onChange={() => setSelectedIdx(0)}
              />
              <label htmlFor="inputSite">{text('Balance: 0₽')}</label>
            </div>
            <p>{text('Standard risk-free deal price')}</p>
            <p className={style.mini_text}>
              {text(
                'A 9% fee applies when topping up your wallet. The price in the performer response already includes the commission.',
              )}
            </p>
          </div>

          <div
            className={style.block}
            style={{ position: 'relative', top: '35px' }}
          >
            <div className={style.radio}>
              <input
                type="radio"
                id="inputCash"
                name="radioPayments"
                checked={selectedIdx === 1}
                onChange={() => setSelectedIdx(1)}
              />
              <label htmlFor="inputCash">{text('Cash payment')}</label>
            </div>
            <p className={style.mini_text}>
              {text('Pay the performer directly')} <br />
              {text('No guarantees or compensation from RepairWizarts: you negotiate conditions and payment method directly with the performer.')}
            </p>
          </div>
        </div>

        <div
          className={style.button_go}
          onClick={() => {
            setVisibleBlockPayment(false);
            setVisibleConfirm(true);
          }}
        >
          {text('Continue')}
        </div>
      </div>
    </div>
  );
}

export default PaymentBlock;
