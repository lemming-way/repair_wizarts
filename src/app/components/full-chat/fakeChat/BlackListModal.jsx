import style from './blackListModal.module.css';
import { useUser, useUpdateUser, useUsersByIds } from '../../../state/user';
import { useLanguage } from '../../../state/language';

export default function BlackListModal({ setModalVisible }) {
  const text = useLanguage();
  const { user } = useUser();
  const blackListIds = user.blackList || [];

  const { users, isLoading: isUsersLoading } = useUsersByIds(blackListIds);
  const { save, isPending: isUpdatingUser } = useUpdateUser();

  const handleUnblock = async (id) => {
    if (!user.id) {
      return;
    }
    const newList = blackListIds.filter((lId) => lId !== id);
    save({ blackList: newList });
  };

  return (
    <div className={style.wrap}>
      <div className={style.block}>
        <div className={style.close} onClick={() => setModalVisible(false)}>
          <img src="/img/close.svg" alt="" />
        </div>
        <h2 className={style.heading}>{text('Blacklist')}</h2>
        {isUsersLoading ? (
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
                  className={style.row_button}
                  onClick={() => !isUpdatingUser && handleUnblock(item.id)}
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
