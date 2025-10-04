import { useState } from 'react';

import style from './Dispute.module.css';
import { updateRequest } from '../../../services/request.service';
import { useLanguage } from '../../../state/language';

export default function DisputeModal_v2({
  setVisibleDispute,
  setVisibleDisputeFinal,
  id,
  refetchRequests,
}) {
  const text = useLanguage();
  const [value, setValue] = useState('');
  return (
    <>
      <div className={style.wrap}>
        <div className={style.block}>
          <div className={style.close} onClick={() => setVisibleDispute(false)}>
            <img src="/img/close.svg" alt="" />
          </div>
          <h2 className={style.heading}>{text('Opening a dispute')} </h2>

          <div className={style.textarea_wrap}>
            <textarea
              rows={8}
              className={style.textarea}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={text('Describe your problem, your order will be moved to technical support')}
            ></textarea>
          </div>

          <div className={style.buttons}>
            <div
              className={style.button}
              onClick={async () => {
                try {
                  await updateRequest(id, {
                    is_open_dispute: true,
                    dispute_comment: value,
                  });
                  refetchRequests();
                } catch (error) {
                  console.error(text('Error canceling order:'), error);
                } finally {
                  setVisibleDispute(false);
                  setVisibleDisputeFinal(true);
                }
              }}
            >
              {text('Send')}
            </div>
            <div className={style.add_photo}>
              <img src="/img/icons/camera.png" alt="" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
