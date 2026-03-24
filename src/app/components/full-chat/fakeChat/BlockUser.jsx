import style from "./ConfirmOrder.module.css";
import { useUser, useUpdateUser } from '../../../state/user';
import { useLanguage } from '../../../state/language';

export default function BlockUser({ setModalVisible, targetUserId = null, onUserBlocked = null }) {
  const text = useLanguage();
  const { user, isLoading } = useUser();
  const { save: saveUserUpdates, isPending: isUpdatingUser } = useUpdateUser();

  let handleBlock = null;
  if (!isLoading) {
    if (!user.id || !targetUserId) {
      console.error('User or targetUserId is missing for blocking.');
      setModalVisible(false);
      return null;
    }

    const currentBlackList = user.blackList || [];
    if (currentBlackList.includes(targetUserId)) {
      console.warn(`User ${targetUserId} is already in the blacklist.`);
      setModalVisible(false);
      return null;
    }

    handleBlock = async () => {
      const newBlackList = [...currentBlackList, targetUserId];
      await saveUserUpdates({ blackList: newBlackList }, {
        onSuccess: () => {
          onUserBlocked?.(); // Call optional callback
          setModalVisible(false);
        },
        onError: (error) => {
          console.error('Failed to block user:', error);
          // Optionally show an error message in the modal
        }
      });
    };
  }

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
                {text('Are you sure you want to block this user?')}
              </p>

              <div className={style.buttons}>
                <div className={style.button} onClick={handleBlock} disabled={isUpdatingUser}>
                  {isUpdatingUser ? text('Blocking...') : text('Confirm')}
                </div>
                <div className={style.button_back} onClick={() => setModalVisible(false)} disabled={isUpdatingUser}>
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
