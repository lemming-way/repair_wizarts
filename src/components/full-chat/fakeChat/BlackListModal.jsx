import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import style from './blackListModal.module.css';
import { updateUser } from '../../../services/user.service';
import appFetch from '../../../utilities/appFetch';
import { useUserQuery } from '../../../hooks/useUserQuery';
import { userKeys } from '../../../queries';

const EMPTY_ARRAY = [];

const formatBlacklistDate = (dateInput) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

export default function BlackListModal({ setVisibleBlackList }) {
  const queryClient = useQueryClient();
  const { user = {} } = useUserQuery();
  const userId = user?.u_id ?? user?.id;
  const blackList = Array.isArray(user?.u_details?.black_list)
    ? user.u_details.black_list
    : EMPTY_ARRAY;

  const [blackListData, setBlackListData] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        const data = await Promise.all(
          blackList.map(async (item) => {
            const userReq = await appFetch(`user/${item.id}`, {}, true);
            const fetchedUser = Object.values(userReq?.data?.user || {})[0] || {};

            return {
              id: item.id,
              name: fetchedUser?.u_name || 'Неизвестно',
              date: formatBlacklistDate(item.date),
            };
          }),
        );

        if (isMounted) {
          setBlackListData(data);
        }
      } catch (error) {
        console.error('Не удалось загрузить черный список', error);
        if (isMounted) {
          setBlackListData([]);
        }
      }
    };

    if (blackList.length > 0) {
      fetchUsers();
    } else {
      setBlackListData([]);
    }

    return () => {
      isMounted = false;
    };
  }, [blackList]);

  const handleUnblock = async (id) => {
    if (!userId) {
      return;
    }

    const updatedList = blackList.filter((entry) => entry.id !== id);
    try {
      await updateUser(
        {
          details: {
            black_list: updatedList,
          },
        },
        userId,
      );
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      setBlackListData((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error('Не удалось обновить черный список', error);
    }
  };

  return (
    <div className={style.wrap}>
      <div className={style.block}>
        <div className={style.close} onClick={() => setVisibleBlackList(false)}>
          <img src="/img/close.svg" alt="" />
        </div>
        <h2 className={style.heading}>Черный список</h2>
        <div className={style.row_td}>
          <p>Дата</p>
          <p>Пользователь</p>
        </div>
        {blackListData.length === 0 ? (
          <p>Пока пусто</p>
        ) : (
          blackListData.map((item) => (
            <div key={item.id} className={style.user_ban}>
              <div
                className={style.row_button}
                onClick={() => handleUnblock(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleUnblock(item.id);
                  }
                }}
              >
                <div className={style.button}>Разблокировать</div>
              </div>
              <div className={style.data}>
                <p>{item.date}</p>
                <p>{item.name}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
