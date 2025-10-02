import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import style from './finance.module.css';
import ModalConfirm from './ModalConfirm';
import ModalDelete from './ModalDelete';
import ModalSuccess from './ModalSuccess';
import { updateUser } from '../../services/user.service';
import { selectUser } from '../../slices/user.slice';

const FinanceClient = () => {
  const user =
    Object.values(useSelector(selectUser)?.data?.user || {})[0] || {};

  const [card, setCard] = useState('');
  const [webmoney, setWebmoney] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVisibleConfirm, setVisibleConfirm] = useState(false);
  const [isVisibleSuccess, setVisibleSuccess] = useState(false);
  const [isVisibleDelete, setVisibleDelete] = useState(false);

  useEffect(() => {
    const cardWallet = user.u_details?.wallets?.find((w) => w.type === 'card');
    const wmWallet = user.u_details?.wallets?.find(
      (w) => w.type === 'webmoney',
    );

    setCard(cardWallet?.value || '');
    setWebmoney(wmWallet?.value || '');
  }, [user.u_details?.wallets]);

  const onSubmitWallets = async () => {
    try {
      const wallets = [
        { type: 'card', value: card },
        { type: 'webmoney', value: webmoney },
      ];

      const payload = {
        wallets,
      };

      const res = await updateUser({ details: payload }, user.u_id).then((v) =>
        console.log(v),
      );
      console.log(res);
      if (!res?.code === '200') throw new Error('Ошибка при сохранении');
      setVisibleSuccess(true);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении кошельков');
    }
  };

  return (
    <>
      {isVisibleConfirm && (
        <ModalConfirm
          setVisibleConfirm={setVisibleConfirm}
          setVisibleSuccess={setVisibleSuccess}
        />
      )}
      {isVisibleSuccess && (
        <ModalSuccess setVisibleSuccess={setVisibleSuccess} />
      )}
      {isVisibleDelete && <ModalDelete setVisibleDelete={setVisibleDelete} />}

      <div className="">
        <div className={style.main}>
          {success && (
            <div className={style.alert}>Данные кошелька сохранены</div>
          )}

          <div className={style.payment_block}>
            <p className={style.name}>Банковская карта</p>
            <div className={style.payment_block__row}>
              <img src="/img/visa.png" alt="card" />
              <input
                className={style.payment_block__input}
                type="text"
                placeholder="Введите номер карты"
                value={card}
                onChange={(e) => setCard(e.target.value)}
              />
            </div>
          </div>

          <div className={style.payment_block}>
            <p className={style.name}>Webmoney</p>
            <div className={style.payment_block__row}>
              <img src="/img/webmoney.png" alt="webmoney" />
              <input
                className={style.payment_block__input}
                type="text"
                placeholder="Введите кошелёк"
                value={webmoney}
                onChange={(e) => setWebmoney(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* <button
          className="master-settings-pics__button"
          onClick={() => {
            if (!card && !webmoney) {
              alert('Введите хотя бы один способ оплаты');
              return;
            }
            setVisibleConfirm(true);
          }}
        >
          Сохранить кошельки
        </button> */}

        {/* Кнопка подтверждения */}
        {/* {isVisibleConfirm && ( */}
        <button
          className="master-settings-pics__button"
          onClick={onSubmitWallets}
        >
          Подтвердить отправку
        </button>
        {/* )}   */}
      </div>
    </>
  );
};

export default FinanceClient;
