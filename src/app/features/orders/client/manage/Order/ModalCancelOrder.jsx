import style from '../../../OrderModals.module.css';
import { useLanguage } from 'app/state/language';

export default function ModalCancelOrder({ setVisibleCancelModal, onCancelOrder }) {
  const text = useLanguage();
  const handleCancel = () => {
    onCancelOrder();
    setVisibleCancelModal(false);
  };

  return (
    <>
      <div className={style.wrap}>
        <div className={style.block}>
          <div
            className={style.close}
            onClick={() => setVisibleCancelModal(false)}
          >
            <img src="/img/close.svg" alt="" />
          </div>
          <p className={style.message}>{text('Are you sure you want to discard the order?')}</p>

          <div className={style.buttons}>
            <div
              className={style.button_back}
              onClick={() => setVisibleCancelModal(false)}
            >
              {text('Cancel')}
            </div>
            <div
              className={style.button}
              onClick={handleCancel}
            >
              {text('Discard')}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
