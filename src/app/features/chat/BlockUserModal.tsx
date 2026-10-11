import { useState } from 'react';

import { UserProfile, useUsersByIds } from 'app/state/user';
import { useLanguage } from 'app/state/language';
import style from "./BlackList.module.css";

type BlockUserModalProps = {
  currentUser: UserProfile;
  targetUserId: number;
  setModalVisible: (value: boolean) => void;
  onUserBlocked: () => Promise<boolean>;
};

export function BlockUserModal({
  currentUser,
  setModalVisible,
  targetUserId,
  onUserBlocked
}: BlockUserModalProps) {
  const text = useLanguage();
  const [isPending, setIsPending] = useState(false);

  const { users: [ targetUser ], isLoading } = useUsersByIds(targetUserId ? [targetUserId] : []);

  const handleClick = async () => {
    setIsPending(true);
    const result = await onUserBlocked();
    setIsPending(false);
    if (result) {
      setModalVisible(false);
    }
  };

  return (
    <>
      <div className={style.wrap}>
        <div className={style.block}>
          <div className={style.close} onClick={() => setModalVisible(false)}>
            <img src="/img/close.svg" alt=""/>
          </div>
          {isLoading ?
            <p className={style.message}>
              {text('Loading...')}
            </p>
            :
            <>
              <p className={style.message}>
                {`${text('Are you sure you want to block user')} ${targetUser?.fullname ?? ''}?`}
              </p>

              <div className={style.buttons}>
                <div
                  className={`${style.button} ${isPending || !targetUser ? style.disabled : ''}`}
                  onClick={() => !isPending && targetUser && handleClick()}
                >
                  {isPending ? text('Blocking...') : text('Confirm')}
                </div>
                <div
                  className={`${style.button_back} ${isPending ? style.disabled : ''}`}
                  onClick={() => !isPending && setModalVisible(false)}
                >
                  {text('Cancel')}
                </div>
              </div>
            </>
          }
        </div>
      </div>
    </>
  )
}
