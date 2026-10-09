import { useState } from 'react';

import style from './Dispute.module.css';
import { useLanguage } from 'app/state/language';

type DisputeModalProps = {
  id: number;
  onDisputeOpen: (claim: string) => void;
  setVisibleDispute: (value: boolean) => void;
};

export function DisputeModal({ id, setVisibleDispute, onDisputeOpen }: DisputeModalProps) {
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
              onClick={() => onDisputeOpen(value)}
            >
              {text('Send')}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
