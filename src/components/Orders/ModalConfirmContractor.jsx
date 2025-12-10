import { useNavigate } from 'react-router-dom';

import style from './ModalConfirmContractor.module.css';

export default function ModalConfirmContractor({
  setVisibleModalConfirmContractor,
  id,
}) {
  const navigator = useNavigate();
  return (
    <>
      <div className={style.wrap}>
        <div className={style.block}>
          <div
            className={style.close}
            onClick={() => setVisibleModalConfirmContractor(false)}
          >
            <img src="/img/close.svg" alt="" />
          </div>
          <p className={style.message}>Вы подтвердили производителя работ</p>
          <p style={{ textAlign: 'center', marginBottom: '20px' }}>
            Подтверждая исполнителя вы открываете с ним диалог в чате
          </p>

          <div className={style.buttons}>
            <div
              className={style.button}
              onClick={() => {
                setVisibleModalConfirmContractor(false);
                navigator('/client/chat/' + id);
              }}
            >
              Ок
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
