import style from '../../../OrderModals.module.css';
import { useLanguage } from '../../../../../state/language';

export default function ModalRevokeOffer({ setVisibleRevokeModal, onConfirm }) {
  const text = useLanguage();
  return (
    <>
      <div className={style.wrap}>
        <div className={style.block}>
          <div
            className={style.close}
            onClick={() => {
              setVisibleRevokeModal(false);
            }}
          >
            <img src="/img/close.svg" alt="" />
          </div>
          <p className={style.message}>{text('Are you sure you want to delete your offer?')}</p>

          <div className={style.buttons}>
            <div
              className={style.button_back}
              onClick={() => setVisibleRevokeModal(false)}
            >
              {text('Cancel')}
            </div>
            <div
              className={style.button}
              onClick={onConfirm}
            >
              {text('Delete')}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
