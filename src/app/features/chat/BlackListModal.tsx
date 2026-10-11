import { useState } from 'react';

import { UserProfile, useUsersByIds } from 'app/state/user';
import { useLanguage } from 'app/state/language';
import style from './BlackList.module.css';

type BlackListModalProps = {
  currentUser: UserProfile;
  onUnblock: (id: number) => Promise<boolean>;
  setModalVisible: (value: boolean) => void;
}

export function BlackListModal({
  currentUser,
  onUnblock,
  setModalVisible
}: BlackListModalProps) {
  const text = useLanguage();
  const [ isPending, setIsPending ] = useState(false);

  const blackList = currentUser.blackList || [];
  const { users, isLoading } = useUsersByIds(blackList);

  const handleUnblock = async (id: number) => {
    if (!currentUser.blackList) return;
    setIsPending(true);
    const result = await onUnblock(id);
    setIsPending(false);
    if (result) {
      setModalVisible(false);
    }
  };

  return (
    <div className={style.wrap}>
      <div className={style.block}>
        <div className={style.close} onClick={() => setModalVisible(false)}>
          <img src="/img/close.svg" alt="" />
        </div>
        <h2 className={style.heading}>{text('Blacklist')}</h2>
        {isLoading ? (
          <p>{text('Loading...')}</p>
        ) : users.length === 0 ? (
          <p>{text('Currently empty')}</p>
        ) : (
          <>
            <div className={style.row_td}>
              <p>{text('User')}</p>
              <div style={{ flexGrow: 1 }} /> {/* Spacer for layout */}
              <p>{text('Action')}</p>
            </div>
            {users.map(item => (
              <div key={item.id} className={style.user_ban}>
                <div className={style.data}>
                  <p>{item.fullname || text('Unknown user')}</p>
                </div>
                <div
                  className={`${style.row_button} ${isPending ? style.disabled : ''}`}
                  onClick={() => !isPending && handleUnblock(item.id)}
                >
                  <div className={style.button}>{text('Unblock')}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
